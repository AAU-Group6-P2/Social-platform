import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { supabase } from "./Supabase.js";
import session from "express-session";
import { randomUUID } from "crypto";

const app = express();

app.use(express.json());

/* Needed for ES modules */
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

/*This sets log in page as our default homepage */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});
app.get("/me", (req, res) => {
    res.json(req.session.user || null);
     credentials: "include"
});
/*This function checks the users role  */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user) { //user is not logged in
      return res.status(401).send("Not logged in");
    }

    if (req.session.user.role !== role) { //loged in but has wrong role 
      return res.status(403).send("Not allowed");
    }

    next(); // allowes as has correct role
  };
}

// === This is log in and log out ===//
/*Here we generate a random user id when user logs in  */
app.post("/login-demo", (req, res) => {
     console.log("BODY:", req.body);
    req.session.user = {
        id: randomUUID(),
        role: req.body.role
    };

    res.sendStatus(200);
});

/*When we log out the session is destroyed */
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Logout failed");
    }

    res.clearCookie("connect.sid");
    res.sendStatus(200);
  });
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

// == This is supabase routes ==//

/*Get club info */
app.get("/clubs", async (req, res) => {
    const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("name", { ascending: true });

    if (error) return res.status(500).json(error);

    res.json(data);
});

/*Get event info */
app.get("/events", async (req, res) => {
    const { data, error } = await supabase
        .from("events")
        .select("*");

    if (error) return res.status(500).json(error);

    res.json(data);
});

/*Create event */
app.post("/events", async (req, res) => {
    const {
        name,
        date,
        timeStart,
        timeEnd,
        clubId,
        location,
        description,
        practicalInformation,
        isPublished
    } = req.body;

    if (!name || !date || !timeStart || !timeEnd || !clubId || !location || !description) {
        return res.status(400).json({
            error: "Missing required event fields."
        });
    }

    // combine time in backend
    const time = `${timeStart} - ${timeEnd}`
    
    const { data, error } = await supabase
        .from("events")
        .insert([{
            title: name, //this maps frontend "name" to database "title" coulmn
            date,
            time,
            clubId: Number(clubId),
            location,
            description,
            practicalInfo: practicalInformation, 
            isPublished: Boolean(isPublished)
        }])
        .select()
        .single();

    if (error) return res.status(500).json(error);

    res.status(201).json(data);
});

/*Get the number of current joined members */
app.get("/clubs/:id", async (req, res) => {
    const clubId = req.params.id;

    const { data, error } = await supabase 
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .single();

    if (error) {
        return res.status(500).json(error);
    }

    res.json(data)
});

/* Update the database with new number of members in the club*/
app.post("/clubs/:id/joined", async (req, res) => {
    const clubId = req.params.id;

    const { data } = await supabase
        .from("clubs")
        .select("joined")
        .eq("id", clubId)
        .single();
    const newCount = (data.joined || 0) + 1;

    await supabase  
        .from("clubs")
        .update({ joined: newCount })
        .eq("id", clubId);

    res.json({ joined: newCount});

});

/* Start server */
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});