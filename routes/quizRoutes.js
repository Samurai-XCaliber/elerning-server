import express from "express";
import {
  createQuiz,
  getQuiz,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getResult,
  getQuizResult
} from "../controllers/quiz.js";
import { isAuth, isAdmin } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/", isAuth, isAdmin, createQuiz);
router.get("/:id", isAuth, getQuiz);
router.get("/course/:courseId", isAuth, getAllQuizzes);
router.put("/:id", isAuth, isAdmin, updateQuiz);
router.delete("/:id", isAuth, isAdmin, deleteQuiz);
router.post("/:id/submit", isAuth, submitQuiz);
router.get("/:id/result", isAuth, getResult);
router.get('/:id/course-result', isAuth, getQuizResult); // Ensure this route is correct

export default router;