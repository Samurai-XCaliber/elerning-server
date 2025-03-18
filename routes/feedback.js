// routes/feedback.js
import express from "express";
import { submitFeedback, getFeedback } from "../controllers/feedback.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/feedback", isAuth, submitFeedback);
router.get("/feedback/:courseId", isAuth, getFeedback);


export default router;