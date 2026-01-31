const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// =====================
// CONFIG
// =====================
const PORT = 3000;
const ADMIN_KEY = "ACKS_ADMIN_2026";

// =====================
// STATIC FILE SERVING
// =====================

// Serve all frontend files (HTML, CSS)
app.use(express.static(__dirname));

// Serve demo images & audio explicitly
app.use(
  "/demo-data",
  express.static(path.join(__dirname, "demo-data"))
);

// =====================
// HEALTH CHECK
// =====================
app.get("/api/health", (req, res) => {
  res.json({ status: "ACKS Data Labs API is running" });
});

// =====================
// CLIENT PROJECT REQUEST
// =====================
app.post("/api/request-project", (req, res) => {
  const { company, email, projectType } = req.body;

  if (!company || !email || !projectType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const request = {
    company,
    email,
    projectType,
    time: new Date().toISOString()
  };

  const file = "requests.json";
  let data = [];

  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  data.push(request);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  res.json({ message: "Project request saved successfully" });
});

// =====================
// FREELANCER REGISTRATION
// =====================
app.post("/api/register-freelancer", (req, res) => {
  const { name, email, skills } = req.body;

  if (!name || !email || !skills) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const freelancer = {
    name,
    email,
    skills,
    time: new Date().toISOString()
  };

  const file = "freelancers.json";
  let data = [];

  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  }

  data.push(freelancer);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  res.json({ message: "Freelancer registered successfully" });
});

// =====================
// ADMIN AUTH MIDDLEWARE
// =====================
function adminAuth(req, res, next) {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// =====================
// ADMIN APIs
// =====================
app.get("/api/admin/projects", adminAuth, (req, res) => {
  if (!fs.existsSync("requests.json")) return res.json([]);
  res.json(JSON.parse(fs.readFileSync("requests.json", "utf8")));
});

app.get("/api/admin/freelancers", adminAuth, (req, res) => {
  if (!fs.existsSync("freelancers.json")) return res.json([]);
  res.json(JSON.parse(fs.readFileSync("freelancers.json", "utf8")));
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
