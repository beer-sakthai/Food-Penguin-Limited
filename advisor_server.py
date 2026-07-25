#!/usr/bin/env python3
"""Lightweight local SakThai GGUF advisor server."""
import os
import sys
import json
import glob
from http.server import HTTPServer, BaseHTTPRequestHandler
from llama_cpp import Llama

MODEL_DIR = "/opt/data/models/sakthai-1.5b/gguf"
MODEL_PATH = os.environ.get("SAKTHAI_GGUF", glob.glob(os.path.join(MODEL_DIR, "*.gguf"))[0])

llm: Llama | None = None


def load_model():
    global llm
    if llm:
        return llm
    print(f"Loading SakThai model from {MODEL_PATH}", file=sys.stderr)
    llm = Llama(
        model_path=MODEL_PATH,
        n_ctx=2048,
        n_threads=int(os.environ.get("SAKTHAI_THREADS", "2")),
        n_batch=256,
        verbose=False,
    )
    return llm


def build_prompt(metrics, question=None):
    q = question or "Give 3 operational recommendations"
    return (
        "You are SakThai, an operational advisor for Food Penguin Limited, a sushi business in Cork, Ireland.\n"
        "Answer with exactly 3 short bullet points. Each bullet must start with '- ' and be one sentence.\n"
        "No numbering. No bold. No markdown. No repeated ideas. No extra text.\n\n"
        f"Branch: {metrics.get('branch', 'All branches')}\n"
        f"Sales: €{metrics.get('sales', 0):.2f}\n"
        f"COGS: {metrics.get('cogsPct', 0)*100:.1f}% of sales\n"
        f"Waste: {metrics.get('wastePct', 0)*100:.1f}% of COGS\n"
        f"Production: {metrics.get('productionItems', 0)} / {metrics.get('productionTarget', 0)} items\n"
        f"Health: {metrics.get('healthScore', 0)} / 100\n"
        f"Question: {q}\n\n"
        "Answer:\n-"
    )


def _extract_text(response) -> str:
    if isinstance(response, dict):
        choices = response.get("choices") or []
        if choices:
            return choices[0].get("text", "").strip()
    return ""


def _clean(text: str) -> str:
    text = text.replace('**', '').replace('*', '').replace('#', '').strip()
    lines = [line.strip('-•* \t').strip() for line in text.splitlines()]
    seen = set()
    cleaned = []
    for line in lines:
        if not line or len(line) < 10:
            continue
        key = line.lower()[:40]
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(f"- {line}")
        if len(cleaned) >= 3:
            break
    return "\n".join(cleaned) if cleaned else "- No specific recommendation generated."


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/advise":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            model = load_model()
            prompt = build_prompt(body.get("metrics", {}), body.get("question"))
            response = model.create_completion(
                prompt,
                max_tokens=240,
                temperature=0.35,
                top_p=0.8,
                repeat_penalty=1.25,
                stop=["\n\n", "Answer:", "Question:", "Branch:", "Sales:", "COGS:", "Waste:", "Production:", "Health:"],
            )
            text = _clean(_extract_text(response))
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"text": text}).encode("utf-8"))
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode("utf-8"))


if __name__ == "__main__":
    port = int(os.environ.get("SAKTHAI_ADVISOR_PORT", "8123"))
    load_model()
    print(f"SakThai advisor listening on http://127.0.0.1:{port}/advise", file=sys.stderr)
    HTTPServer(("127.0.0.1", port), Handler).serve_forever()
