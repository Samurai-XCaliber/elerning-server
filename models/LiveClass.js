import mongoose from "mongoose"

const liveClassSchema = new mongoose.Schema({
  meetingId: {
    type: String,
    required: true,
  },
  passcode: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["liveclass", "workshop"],
    default: "liveclass",
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  lectureUsername: {
    type: String,
    required: true,
  },
  purchased: {
    type: Boolean,
    default: false,
  },
  meetingStarted: {
    type: Boolean,
    default: false,
  },
  firstPurchaser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export const LiveClass = mongoose.model("LiveClass", liveClassSchema)

