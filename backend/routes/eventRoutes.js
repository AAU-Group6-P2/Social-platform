import express from "express";
import { getEvents, createEvent, getEventJoinCount, joinEvent, leaveEvent, updateEvent} from "../controllers/eventController.js";

const router = express.Router();

router.get("/", getEvents);
router.post("/", createEvent);

router.get("/:id/join-count", getEventJoinCount);
router.post("/:id/joined", joinEvent);
router.delete("/:id/joined", leaveEvent);

router.patch("/:id", updateEvent);

export default router;