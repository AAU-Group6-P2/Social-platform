import { supabase } from "../Supabase.js";
import { randomUUID } from "crypto"; //generates random id

/*Here we generate a random user id when user logs in and saves it in the database  */
export const loginDemo = async(req, res) => {
    const userId = randomUUID();

       req.session.user = {
        id: userId,
        role: req.body.role
    };
    
    //save user in database
    await supabase.from("users").insert([
        {
            id: userId,
            role: req.body.role
        }
    ]);

    res.sendStatus(200);
};

/*When we log out the session is destroyed */
export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Logout failed");
    }

    res.clearCookie("connect.sid");
    res.sendStatus(200);
  });
};

export const getMe = (req, res) => {
    if (!req.session.user) {
        return res.json({ role: null });
    }

    res.json({ role: req.session.user.role });
};