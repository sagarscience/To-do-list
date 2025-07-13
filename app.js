import express from "express";
const app = express();
const PORT = 8000;

let listItems = []; // Task storage

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Home route with optional priority filter
app.get("/", (req, res) => {
  const filter = req.query.priority || "All";
  const filteredItems = filter === "All"
    ? listItems
    : listItems.filter(item => item.priority === filter);
  res.render("index", { tasks: filteredItems, filter });
});

// Add task
app.post("/add", (req, res) => {
  const { task, priority } = req.body;
  if (task.trim()) {
    listItems.push({ name: task.trim(), priority });
  }
  res.redirect("/");
});

// Edit task
app.post("/edit/:index", (req, res) => {
  const index = req.params.index;
  const newName = req.body.newTask.trim();
  if (newName) {
    listItems[index].name = newName;
  }
  res.redirect("/");
});

// Delete task
app.post("/delete/:index", (req, res) => {
  const index = req.params.index;
  listItems.splice(index, 1);
  res.redirect("/");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
