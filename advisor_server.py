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


def build_prompt(metrics):
    return (
        "You are SakThai, the operational AI advisor for Food Penguin Limited, a premium sushi business with three branches: Cork, Mahon, and Marks & Spencer.\n"
        "Rules: COGS should be ~30% of net sales, waste ~10% of COGS, commission 30% of gross.\n"
        "Given this dashboard snapshot, give 3-5 concise, actionable operational recommendations.\n\n"
        f"Data: {json.dumps(metrics, indent=2)}\n\nAdvice:"
    )


def _extract_text(response) -> str:
    if isinstance(response, dict):
        choices = response.get("choices") or []
        if choices:
            return choices[0].get("text", "").strip()
    return ""


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/advise":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            model = load_model()
            prompt = build_prompt(body.get("metrics", {}))
            response = model.create_completion(
                prompt,
                max_tokens=512,
                temperature=0.6,
                top_p=0.9,
                stop=["\n\n"],
            )
            text = _extract_text(response)
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
