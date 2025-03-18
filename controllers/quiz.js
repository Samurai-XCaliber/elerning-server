import Quiz from "../models/Quiz.js";
import Result from "../models/Result.js";
import TryCatch from "../middlewares/TryCatch.js";
import { QuizProgress } from "../models/QuizProgress.js";

export const createQuiz = TryCatch(async (req, res) => {
  const { title, description, questions, courseId } = req.body;

  const quiz = new Quiz({ title, description, questions, courseId });
  await quiz.save();

  res.status(201).json({ message: "Quiz created successfully", quiz });
});

export const getQuiz = TryCatch(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  res.status(200).json({ quiz });
});

export const getAllQuizzes = TryCatch(async (req, res) => {
  const quizzes = await Quiz.find({ courseId: req.params.courseId });
  res.status(200).json({ quizzes });
});

export const updateQuiz = TryCatch(async (req, res) => {
  const { title, description, questions } = req.body;
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.id,
    { title, description, questions },
    { new: true }
  );
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  res.status(200).json({ message: "Quiz updated successfully", quiz });
});

export const deleteQuiz = TryCatch(async (req, res) => {
  const quiz = await Quiz.findByIdAndDelete(req.params.id);
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  res.status(200).json({ message: "Quiz deleted successfully" });
});

export const submitQuiz = TryCatch(async (req, res) => {
  const { answers, seenQuestions } = req.body;
  const quiz = await Quiz.findById(req.params.id).populate('courseId');
  if (!quiz) return res.status(404).json({ message: "Quiz not found" });

  let score = 0;
  const questionsAnswered = seenQuestions.map((question) => {
    const userAnswer = answers[question._id];
    const isCorrect = question.correctAnswer === userAnswer;
    if (isCorrect) score += 1;
    return {
      question: question.question,
      options: question.options,
      correctAnswer: question.correctAnswer,
      userAnswer,
      isCorrect,
    };
  });

  const result = {
    user: req.user._id,
    quiz: req.params.id,
    course: quiz.courseId._id,
    score,
    pass: score >= 3,
    duration: quiz.courseId.duration,
    questionsAnswered,
    certificateIssuedDate: new Date(), // Store the current date
  };

  await Result.create(result);

  // Update QuizProgress
  let progress = await QuizProgress.findOne({
    user: req.user._id,
    course: quiz.courseId._id,
  });

  if (!progress) {
    progress = await QuizProgress.create({
      user: req.user._id,
      course: quiz.courseId._id,
      completedQuizzes: [],
    });
  }

  if (!progress.completedQuizzes.includes(req.params.id)) {
    progress.completedQuizzes.push(req.params.id);
    await progress.save();
  }

  res.status(200).json({ message: "Quiz submitted successfully", result });
});

export const getResult = TryCatch(async (req, res) => {
  const result = await Result.findOne({ user: req.user._id, quiz: req.params.id });
  if (!result) return res.status(404).json({ message: "Result not found" });

  res.status(200).json({ result });
});

// New endpoint to fetch quiz result for a specific course
export const getQuizResult = TryCatch(async (req, res) => {
  const userId = req.user._id;
  const courseId = req.params.id;

  const result = await Result.findOne({ user: userId, course: courseId }).populate('course');

  if (!result) {
    return res.status(404).json({ message: 'Quiz result not found' });
  }

  res.status(200).json({ result });
});