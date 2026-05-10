import express from "express"
import { loginDemo, logout, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/login-demo", loginDemo);
router.post("/logout", logout);
router.get("/api/me", getMe);

export default router;