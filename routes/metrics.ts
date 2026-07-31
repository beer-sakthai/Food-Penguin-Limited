import express from "express";
import {
  getMetrics, getOrders, getTargets, getRecipes, getProductionTasks,
  getWasteRecords, getEmployeeHours, getInventory, getDailyLogs, getAlerts,
  updateMetrics, addOrder, addWasteRecord, addDailyLog,
} from "../db";

export const metricsRouter = express.Router();

metricsRouter.get("/metrics", (_req, res) => {
  try {
    const data = getMetrics();
    res.json(data || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.put("/metrics", (req, res) => {
  try {
    updateMetrics(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.get("/orders", (req, res) => {
  try {
    const branch = req.query.branch as string | undefined;
    res.json(getOrders(branch));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.post("/orders", (req, res) => {
  try {
    addOrder(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.get("/targets", (_req, res) => {
  try { res.json(getTargets()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

metricsRouter.get("/recipes", (_req, res) => {
  try { res.json(getRecipes()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

metricsRouter.get("/tasks", (_req, res) => {
  try { res.json(getProductionTasks()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

metricsRouter.get("/waste", (_req, res) => {
  try { res.json(getWasteRecords()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

metricsRouter.post("/waste", (req, res) => {
  try {
    addWasteRecord(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.get("/hours", (_req, res) => {
  try { res.json(getEmployeeHours()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

metricsRouter.get("/inventory", (_req, res) => {
  try { res.json(getInventory()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});

metricsRouter.get("/logs", (req, res) => {
  try {
    const week = req.query.week as string;
    if (!week) return res.status(400).json({ error: "week query param required" });
    res.json(getDailyLogs(week));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.post("/logs", (req, res) => {
  try {
    addDailyLog(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

metricsRouter.get("/alerts", (_req, res) => {
  try { res.json(getAlerts()); } catch (err: any) { res.status(500).json({ error: err.message }); }
});
