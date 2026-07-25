#!/usr/bin/env python3
import argparse
import json
import sys
from pathlib import Path


def run_gguf_advisor(model_path: str, port: int):
    try:
        from llama_cpp import Llama
    except ImportError:
        print("llama-cpp-python not installed", file=sys.stderr)
        sys.exit(1)

    llm = Llama(
        model_path=model_path,
        n_ctx=2048,
        verbose=False,
        n_threads=2,
    )

    from http.server import BaseHTTPRequestHandler, HTTPServer

    class Handler(BaseHTTPRequestHandler):
        def do_POST(self):
            if self.path != "/advise":
                self.send_error(404)
                return
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
            except Exception:
                self.send_error(400)
                return

            metrics = data.get("metrics", {})
            question = data.get("question", "Give 3 operational recommendations")
            prompt = build_prompt(metrics, question)
            output = llm(
                prompt,
                max_tokens=240,
                temperature=0.35,
                top_p=0.8,
                repeat_penalty=1.25,
                stop=["<|im_end|>", "\n\n", "User:", "System:"],
            )
            text = output.get("choices", [{}])[0].get("text", "")
            cleaned = clean(text)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"text": cleaned}).encode())

        def log_message(self, format, *args):
            pass

    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"Advisor 0.5B server running on port {port}")
    server.serve_forever()


def build_prompt(metrics, question):
    system = "You are SakThai, an operational advisor for Food Penguin Limited, a sushi business in Cork, Ireland. Answer with exactly 3 short bullet points. Each bullet must start with '- ' and be one sentence. No numbering, no bold, no markdown, no repeated ideas, no extra text."
    
    # Build context from RAG index
    context = ""
    try:
        import json, numpy as np
        idx_path = Path(__file__).parent / "rag_index.json"
        if idx_path.exists():
            with open(idx_path) as f:
                idx = json.load(f)
            query = f"sales {metrics.get('sales',0)} cost {metrics.get('cogsPct',0)} waste {metrics.get('wastePct',0)}"
            sims = []
            for item in idx:
                if item["source"] in ("metrics", "waste", "production"):
                    sims.append((1.0, item))  # Return all recent data as context
            context = "\nRecent data:\n" + "\n".join(f"- {s[1]['text']}" for s in sims[:5]) + "\n"
    except Exception:
        pass
    
    user = (
        f"Branch: {metrics.get('branch', 'All branches')}\n"
        f"Sales: €{metrics.get('sales', 0):.2f}\n"
        f"COGS: {metrics.get('cogsPct', 0) * 100:.1f}% of sales\n"
        f"Waste: {metrics.get('wastePct', 0) * 100:.1f}% of COGS\n"
        f"Production: {metrics.get('productionItems', 0)} / {metrics.get('productionTarget', 0)} items\n"
        f"{context}"
        f"Question: {question}\n\nAnswer:\n-"
    )
    return f"<|im_start|>system\n{system}<|im_end|>\n<|im_start|>user\n{user}<|im_end|>\n<|im_start|>assistant\n-"


def clean(text: str) -> str:
    t = text.replace("**", "").replace("*", "").replace("#", "").strip()
    lines = [l.strip("-•* ") for l in t.splitlines()]
    lines = [l for l in lines if len(l) >= 10]
    seen = set()
    out = []
    for l in lines:
        key = l.lower()[:40]
        if key in seen:
            continue
        seen.add(key)
        out.append(f"- {l}")
        if len(out) >= 3:
            break
    return "\n".join(out) or "- No specific recommendation generated."


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="/opt/data/models/sakthai-0.5b/sakthai-0.5b-Q4_K_M.gguf")
    parser.add_argument("--port", type=int, default=8124)
    args = parser.parse_args()
    run_gguf_advisor(args.model, args.port)
