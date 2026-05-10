import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import { requireRole } from "./middleware/auth.js";

import authRoutes from "./routes/authRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.use(express.json());

/* Needed for ES modules so fx senfFile works*/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/*This allows espress to remember user logins acros requests using req.session */
app.use(session({
    secret: "your-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


/* this enabels express to acces the fiels in our public folder directly in the browser */
app.use(express.static(path.join(__dirname, "..", "public")));

//routes
app.use("/", authRoutes);
app.use("/clubs", clubRoutes);
app.use("/events", eventRoutes);

/*This sets login page as our default homepage */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

// === This is for our pages ==//
app.get("/student/:page", requireRole("student"), (req, res) => { // here we check if the role is a student
  res.sendFile(
    path.join(__dirname, "..", "public", "student", `${req.params.page}.html`)
  );
});

app.get("/owner/:page", requireRole("club_owner"), (req, res) => { //check role = club owner
  res.sendFile(
    path.join(__dirname, "..", "public", "owner", `${req.params.page}.html`)
  );
});

/* Start server */
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
