#!/usr/bin/env python3
"""Food-Penguin RAG — indexes operational data for context-aware advisor"""
import json, os, sys, sqlite3, numpy as np
from http.server import HTTPServer, BaseHTTPRequestHandler
from sentence_transformers import SentenceTransformer

DB_PATH = "/opt/data/projects/Food-Penguin-Limited/food-penguin.db"
INDEX_PATH = "/opt/data/projects/Food-Penguin-Limited/rag_index.json"
MODEL_NAME = "Nanthasit/sakthai-embedding"

def load_model():
    print("Loading embedding model...")
    return SentenceTransformer(MODEL_NAME)

def extract_data(db_path):
    """Extract all relevant KPI data from Food-Penguin DB"""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    chunks = []
    
    # Metrics history
    try:
        c.execute("SELECT * FROM metrics ORDER BY id DESC LIMIT 10")
        for r in c.fetchall():
            text = f"Metric: Sales=€{r['sales_today']:.0f}, Growth={r['sales_growth']:.1f}%, Production={r['production_items']}/{r['production_target']}, Waste=€{r['waste_cost']:.0f}, Reduction={r['waste_reduction']:.1f}%, Hours={r['hours_scheduled']:.0f}, Overtime={r['overtime_hours']:.1f}h, Health={r['ai_health_score']}/100"
            chunks.append({"text": text, "source": "metrics", "id": f"metric_{r['id']}"})
    except Exception as e: print(f"metrics err: {e}")
    
    # Orders
    try:
        c.execute("SELECT * FROM orders ORDER BY id DESC LIMIT 15")
        for r in c.fetchall():
            text = f"Order: {r['item']} (qty={r['quantity']}, €{r['amount']:.0f}) — {r['status']} at {r['branch']}"
            chunks.append({"text": text, "source": "orders", "id": f"order_{r['id']}"})
    except: pass
    
    # Targets
    try:
        c.execute("SELECT * FROM targets ORDER BY rowid DESC LIMIT 10")
        for r in c.fetchall():
            text = f"Target: {r['name']} — {r['metric']}: €{r['current_value']:.0f}/€{r['target_value']:.0f} ({r['category']})"
            chunks.append({"text": text, "source": "targets", "id": f"target_{r['id']}"})
    except Exception as e: print(f"targets err: {e}")
    
    # Waste records
    try:
        c.execute("SELECT * FROM waste_records ORDER BY id DESC LIMIT 10")
        for r in c.fetchall():
            text = f"Waste: {r['item']} ({r['reason']}) — {r['weight']}g, €{r['cost']:.0f} loss"
            chunks.append({"text": text, "source": "waste", "id": f"waste_{r['id']}"})
    except Exception as e: print(f"waste err: {e}")
    
    conn.close()
    return chunks

def build_index(model, chunks):
    texts = [c["text"] for c in chunks]
    embs = model.encode(texts, show_progress_bar=True)
    index = []
    for i, chunk in enumerate(chunks):
        index.append({
            "id": chunk["id"],
            "source": chunk["source"],
            "text": chunk["text"],
            "embedding": embs[i].tolist()
        })
    return index

def query_index(index, query_vec, top_k=5):
    scores = []
    for item in index:
        vec = np.array(item["embedding"])
        score = np.dot(query_vec, vec) / (np.linalg.norm(query_vec) * np.linalg.norm(vec))
        scores.append((score, item))
    scores.sort(key=lambda x: -x[0])
    return scores[:top_k]

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8125)
    parser.add_argument("--rebuild", action="store_true", help="Rebuild index from DB")
    args = parser.parse_args()
    
    # Load or build index
    if args.rebuild or not os.path.exists(INDEX_PATH):
        model = load_model()
        chunks = extract_data(DB_PATH)
        print(f"Extracted {len(chunks)} data points")
        index = build_index(model, chunks)
        with open(INDEX_PATH, "w") as f:
            json.dump(index, f)
        print(f"Index saved: {len(index)} vectors")
    else:
        with open(INDEX_PATH) as f:
            index = json.load(f)
        model = load_model()
    
    print(f"Index has {len(index)} vectors. Starting RAG server...")
    
    class RAGHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/":
                self.send_json({"status": "ok", "vectors": len(index)})
                return
            if self.path.startswith("/search?q="):
                query = self.path.split("?q=")[1]
                vec = model.encode([query])[0]
                results = query_index(index, vec)
                self.send_json({"results": [{"text": r[1]["text"], "source": r[1]["source"], "score": round(float(r[0]), 3)} for r in results]})
                return
            self.send_error(404)
        
        def send_json(self, data):
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(data).encode())
        
        def log_message(self, *a): pass
    
    server = HTTPServer(("0.0.0.0", args.port), RAGHandler)
    print(f"Food-Penguin RAG server on port {args.port}")
    server.serve_forever()
