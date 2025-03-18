import mongoose from "mongoose";

const questionAnsweredSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
  userAnswer: Number,
  isCorrect: Boolean,
});

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Courses",
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  pass: {
    type: Boolean,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  questionsAnswered: [questionAnsweredSchema],
  certificateIssuedDate: { // Add this field
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Result", resultSchema);