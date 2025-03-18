import { Payment } from "../models/Payment.js"
import { Courses } from "../models/Courses.js"
import { LiveClass } from "../models/LiveClass.js"
import TryCatch from "../middlewares/TryCatch.js"

export const getPaymentDetails = TryCatch(async (req, res) => {
  const payment = await Payment.findOne({ razorpay_payment_id: req.params.id })

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" })
  }

  // Check if this payment was for a course or live class
  const course = await Courses.findOne({
    _id: { $in: req.user.subscription },
  })

  const liveClass = await LiveClass.findOne({
    _id: { $in: req.user.subscription },
  })

  let paymentType = "course"
  let itemName = ""

  if (liveClass) {
    paymentType = "live class"
    itemName = liveClass.title
  } else if (course) {
    paymentType = "course"
    itemName = course.title
  }

  res.json({
    payment,
    paymentType,
    itemName,
  })
})

