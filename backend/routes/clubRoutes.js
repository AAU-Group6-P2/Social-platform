import express from "express";
import multer from "multer";

import { getClubs, getClubJoinCount, joinClub, leaveClub, createClub, updateClub, uploadClubImage } from "../controllers/clubController.js"

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() })

router.get("/", getClubs);
router.get("/:id/join-count", getClubJoinCount);
router.post("/:id/joined", joinClub);
router.delete("/:id/joined", leaveClub);
router.post("/", createClub);
router.patch("/:id", updateClub);
router.post("/:id/image", upload.single("image"), uploadClubImage);

export default router;

