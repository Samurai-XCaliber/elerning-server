import express from "express"
import { isAuth, isAdmin,} from "../middlewares/isAuth.js"
import {
  createLiveClass,
  getAllLiveClasses,
  getLiveClassById,
  deleteLiveClass,
  checkoutLiveClass,
  paymentVerificationLiveClass,
  validateCredentials,
  startMeeting,
  validateLiveClassTime,
  validateLecturerAccess,
  getLecturerClasses,
  getAllLecturers,
  getMyLiveClasses
} from "../controllers/liveClass.js"
import { uploadFiles } from "../middlewares/multer.js"

const router = express.Router()

// Admin routes
router.post("/live-class/new", isAuth, isAdmin, uploadFiles, createLiveClass)
router.delete("/live-class/:id", isAuth, isAdmin, deleteLiveClass)
router.get("/lecturers", isAuth, isAdmin, getAllLecturers)

// Public routes
router.get("/live-classes", isAuth, getAllLiveClasses)
router.get("/live-class/:id", isAuth, getLiveClassById)

// User routes
router.post("/live-class/checkout/:id", isAuth, checkoutLiveClass)
router.post("/live-class/verification/:id", isAuth, paymentVerificationLiveClass)

// Lecturer routes
router.get("/lecturer/classes", isAuth, getLecturerClasses)
router.get("/live-class/validate-access/:id", isAuth, validateLecturerAccess)

// Common routes
router.post("/live-class/validate-credentials", isAuth, validateCredentials)
router.post("/live-class/:id/start-meeting", isAuth, startMeeting)
router.get("/live-class/validate-time/:id", isAuth, validateLiveClassTime)
router.get("/my-live-classes", isAuth, getMyLiveClasses)

export default router;