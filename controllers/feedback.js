// controllers/feedback.js
import TryCatch from "../middlewares/TryCatch.js";
import { Feedback } from "../models/Feedback.js";

export const submitFeedback = TryCatch(async (req, res) => {
  const { courseId, rating, comment } = req.body;

  const feedback = await Feedback.create({
    user: req.user._id,
    course: courseId,
    rating,
    comment,
  });

  res.status(201).json({
    message: "Feedback submitted successfully",
    feedback,
  });
});

export const getFeedback = TryCatch(async (req, res) => {
  const feedback = await Feedback.find({ course: req.params.courseId }).populate(
    "user",
    "name email"
  );

  res.status(200).json({
    feedback,
  });
});