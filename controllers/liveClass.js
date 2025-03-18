import TryCatch from "../middlewares/TryCatch.js"
import { LiveClass } from "../models/LiveClass.js"
import { User } from "../models/User.js"
import { Payment } from "../models/Payment.js"
import crypto from "crypto"
import { instance } from "../index.js" // Ensure this is your Razorpay instance
import fs from "fs"
import { promisify } from "util"
const unlinkAsync = promisify(fs.unlink)

// Create a new live class (for admin/superadmin)
export const createLiveClass = TryCatch(async (req, res) => {
  const { meetingId, passcode, title, description, price, type, startDateTime, endDateTime, lectureUsername } = req.body
  const image = req.file

  // Validate that the lecturer exists
  const lecturer = await User.findOne({ email: lectureUsername, role: "lect" })
  if (!lecturer) {
    return res.status(400).json({
      message: "Lecturer not found with the provided email",
    })
  }

  const liveClass = await LiveClass.create({
    meetingId,
    passcode,
    title,
    description,
    price,
    type,
    startDateTime,
    endDateTime,
    lectureUsername,
    image: image?.path,
  })

  res.status(201).json({
    message: "Live class created successfully",
    liveClass,
  })
})

// Fetch all live classes
export const getAllLiveClasses = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const currentTime = new Date();

  let liveClasses = await LiveClass.find();

  // Filter out expired live classes for regular users and lecturers
  if (user.role === "user" || user.role === "lect") {
    liveClasses = liveClasses.filter((liveClass) => {
      const endTime = new Date(liveClass.endDateTime);
      return endTime > currentTime; // Only include live classes that haven't ended
    });
  }

  // If the user is a lecturer, filter live classes assigned to them
  if (user.role === "lect") {
    liveClasses = liveClasses.filter((liveClass) => liveClass.lectureUsername === user.email);
  }

  // Add purchased status for each live class
  const liveClassesWithStatus = liveClasses.map((liveClass) => ({
    ...liveClass.toObject(),
    purchased: user.subscription.includes(liveClass._id),
  }));

  res.json({ liveClasses: liveClassesWithStatus });
});

// Fetch a single live class by ID
export const getLiveClassById = TryCatch(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)
  res.json({ liveClass })
})

// Delete a live class (for admin/superadmin)
export const deleteLiveClass = TryCatch(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)

  if (!liveClass) {
    return res.status(404).json({ message: "Live class not found" })
  }

  // Delete the image file
  if (liveClass.image) {
    try {
      await unlinkAsync(liveClass.image) // Use fs.unlink to delete the file
      console.log("Image deleted:", liveClass.image)
    } catch (error) {
      console.error("Error deleting image:", error)
      return res.status(500).json({ message: "Failed to delete image" })
    }
  }

  // Delete the live class from the database
  await liveClass.deleteOne()

  res.json({ message: "Live class deleted" })
})

// Razorpay checkout for live class (for users)
export const checkoutLiveClass = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id)
  const liveClass = await LiveClass.findById(req.params.id)

  if (user.subscription.includes(liveClass._id)) {
    return res.status(400).json({
      message: "You have already purchased this live class.",
    })
  }

  const options = {
    amount: Number(liveClass.price * 100), // Convert to paise
    currency: "INR",
  }

  const order = await instance.orders.create(options)

  res.status(201).json({
    order,
    liveClass,
  })
})

// Razorpay payment verification (for users)
export const paymentVerificationLiveClass = TryCatch(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body

  const body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto.createHmac("sha256", process.env.Razorpay_Secret).update(body).digest("hex")

  const isAuthentic = expectedSignature === razorpay_signature

  if (isAuthentic) {
    await Payment.create({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    })

    const user = await User.findById(req.user._id)
    const liveClass = await LiveClass.findById(req.params.id)

    user.subscription.push(liveClass._id)
    await user.save()

    // Return the updated user data
    res.status(200).json({
      message: "Live class purchased successfully!",
      user,
    })
  } else {
    return res.status(400).json({
      message: "Payment failed.",
    })
  }
})

export const validateCredentials = TryCatch(async (req, res) => {
  const { meetingId, passcode, liveClassId } = req.body

  // Validate meeting ID and passcode
  if (!meetingId || !passcode || !liveClassId) {
    return res.status(400).json({
      message: "Meeting ID, passcode, and live class ID are required.",
    })
  }

  // Fetch the live class from the database
  const liveClass = await LiveClass.findById(liveClassId)

  if (!liveClass) {
    return res.status(404).json({
      message: "Live class not found.",
    })
  }

  // Compare the entered meeting ID and passcode with the stored values
  if (meetingId === liveClass.meetingId && passcode === liveClass.passcode) {
    return res.status(200).json({
      isValid: true,
      message: "Credentials are valid.",
    })
  } else {
    return res.status(200).json({
      isValid: false,
      message: "Invalid meeting ID or passcode.",
    })
  }
})

export const startMeeting = TryCatch(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)

  if (!liveClass) {
    return res.status(404).json({ message: "Live class not found" })
  }

  liveClass.meetingStarted = true
  await liveClass.save()

  res.json({ message: "Meeting started successfully" })
})

export const validateLiveClassTime = TryCatch(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)

  if (!liveClass) {
    return res.status(404).json({ message: "Live class not found" })
  }

  const currentTime = new Date()
  const startTime = new Date(liveClass.startDateTime)
  const endTime = new Date(liveClass.endDateTime)

  if (currentTime < startTime) {
    return res.status(400).json({ message: "Live class has not started yet" })
  }

  if (currentTime > endTime) {
    return res.status(400).json({ message: "Live class has ended" })
  }

  res.status(200).json({ isValid: true, message: "Live class is active" })
})

// New endpoint to validate if a lecturer has access to a live class
export const validateLecturerAccess = TryCatch(async (req, res) => {
  const liveClass = await LiveClass.findById(req.params.id)

  if (!liveClass) {
    return res.status(404).json({ message: "Live class not found" })
  }

  const user = await User.findById(req.user._id)

  // Check if the user is the assigned lecturer for this class
  const hasAccess =
    user.role === "admin" ||
    user.role === "superadmin" ||
    (user.role === "lect" && user.email === liveClass.lectureUsername)

  res.status(200).json({
    hasAccess,
    message: hasAccess ? "Access granted" : "Access denied",
  })
})

// New endpoint to get all live classes assigned to a lecturer
export const getLecturerClasses = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user.role !== "lect") {
    return res.status(403).json({ message: "Access denied. Only lecturers can access this endpoint." })
  }

  const liveClasses = await LiveClass.find({ lectureUsername: user.email })

  res.status(200).json({ liveClasses })
})

// New endpoint to get all lecturers (for admin to assign to live classes)
export const getAllLecturers = TryCatch(async (req, res) => {
  const lecturers = await User.find({ role: "lect" }).select("_id name email")

  res.status(200).json({ lecturers })
});

export const getMyLiveClasses = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Fetch live classes that the user has purchased or is assigned to
  const liveClasses = await LiveClass.find({
    _id: { $in: user.subscription }, // Assuming `subscription` contains live class IDs
  });

  res.status(200).json({ liveClasses });
});