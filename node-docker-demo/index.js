const express = require("express");
const os = require("os");

// Load variables from .env (built into Node 20.12+, no dotenv needed).
// Skipped if the file is missing, e.g. when env vars are passed with `docker run -e`.
try {
  process.loadEnvFile();
} catch {}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data (resets when the container restarts)
let todos = [
  { id: 1, title: "Learn Docker", done: false },
  { id: 2, title: "Build an image", done: false },
];
let nextId = 3;

app.get("/", (req, res) => {
  res.json({
    message: "Hello from Docker demo API 🐳",
    hostname: os.hostname(), // shows the container ID when running in Docker
    env: process.env.NODE_ENV || "development",
    status: process.env.APP_STATUS || "unknown",
    author: process.env.AUTHOR || "unknown",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/todos", (req, res) => {
  res.json(todos);
});

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  res.json(todo);
});

app.post("/todos", (req, res) => {
  const { title } = req.body || {};
  if (!title) return res.status(400).json({ error: "title is required" });
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.put("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Todo not found" });
  const { title, done } = req.body || {};
  if (title !== undefined) todo.title = title;
  if (done !== undefined) todo.done = Boolean(done);
  res.json(todo);
});

app.delete("/todos/:id", (req, res) => {
  const index = todos.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Todo not found" });
  todos.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
