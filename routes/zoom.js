import express from "express";
import { generateZoomMeeting } from "../zoom/zoom.service.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/meeting", isAuth, async (req, res) => {
  try {
    const meetingDetails = await generateZoomMeeting();
    res.status(201).json(meetingDetails);
  } catch (error) {
    console.error("Error creating Zoom meeting:", error);
    res.status(500).json({ message: "Failed to create meeting", error: error.message });
  }
});



export default router;