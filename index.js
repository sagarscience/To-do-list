// Import required packages
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';
dotenv.config();

// Setup for ES Module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Define task schema
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create Task model
const Task = mongoose.model("Task", taskSchema);

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Home route (GET)
app.get("/", async (req, res) => {
  const filter = req.query.priority || "All";
  const query = filter === "All" ? {} : { priority: filter };

  try {
    const tasks = await Task.find(query).sort({ completed: 1, priority: 1, createdAt: -1 });
    res.render("index", { tasks, filter });
  } catch (err) {
    res.status(500).send("❌ Failed to load tasks");
  }
});

// Add task
app.post("/add", async (req, res) => {
  const { task, priority } = req.body;
  if (task.trim()) {
    await Task.create({ name: task.trim(), priority });
  }
  res.redirect("/");
});

// Edit task
app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { newTask } = req.body;
  if (newTask.trim()) {
    await Task.findByIdAndUpdate(id, { name: newTask.trim() });
  }
  res.redirect("/");
});

// Delete task
app.post("/delete/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// Toggle completion
app.post("/toggle/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.redirect("/");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
});
