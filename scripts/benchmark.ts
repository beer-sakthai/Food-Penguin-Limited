import request from "supertest";
import path from "path";
import os from "os";
import fs from "fs";

// Use ephemeral database path
const dbPath = path.join(os.tmpdir(), `fp-benchmark-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
process.env.DB_PATH = dbPath;

// Import server
import { app } from "../server";

// Clean up DB on exit
process.on("exit", () => {
  for (const suffix of ["", "-shm", "-wal"]) {
    try {
      fs.unlinkSync(dbPath + suffix);
    } catch (_) {}
  }
});

// Generate dummy events
function generateEvents(count: number) {
  const events = [];
  for (let i = 0; i < count; i++) {
    events.push({
      session_id: `bench-session-${Math.floor(i / 10)}`,
      event_type: i % 5 === 0 ? "session_start" : i % 5 === 4 ? "session_end" : "pageview",
      page: "Overview",
      user_role: "Manager",
      branch: "Tesco - Cork City",
      occurred_at: new Date(Date.now() - i * 1000).toISOString(),
      day: new Date().toISOString().slice(0, 10),
    });
  }
  return events;
}

async function run() {
  console.log("Generating 500 events...");
  const events = generateEvents(500);

  console.log("Running baseline benchmark (10 iterations of 500 events batch track)...");
  const times: number[] = [];

  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const res = await request(app)
      .post("/api/analytics/track-batch")
      .send({ events });
    const end = performance.now();

    if (res.status !== 200) {
      console.error(`Request failed with status ${res.status}:`, res.body);
      process.exit(1);
    }

    const duration = end - start;
    times.push(duration);
    console.log(`Iteration ${i + 1}: ${duration.toFixed(2)}ms (tracked ${res.body.count} events)`);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`\nAverage batch tracking time: ${avg.toFixed(2)}ms`);
}

run().catch(console.error);
