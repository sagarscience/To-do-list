import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

// For ES Modules path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express
const app = express();
const PORT = process.env.PORT || 8000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Schema & Model
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ["Urgent", "High", "Low"], default: "Low" },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model("Task", taskSchema);

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  const msg = req.query.msg || null;
  res.render("index", { tasks, msg });
});

app.post("/add", async (req, res) => {
  const { title, priority } = req.body;
  if (!title.trim()) return res.redirect("/?msg=Task%20title%20cannot%20be%20empty");
  await Task.create({ title: title.trim(), priority });
  res.redirect("/?msg=Task%20added%20successfully");
});

app.post("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const { updatedTitle, updatedPriority } = req.body;
  if (!updatedTitle.trim()) return res.redirect("/?msg=Task%20title%20cannot%20be%20empty");
  await Task.findByIdAndUpdate(id, { title: updatedTitle.trim(), priority: updatedPriority });
  res.redirect("/?msg=Task%20updated%20successfully");
});

app.post("/delete/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.redirect("/?msg=Task%20deleted%20successfully");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
