import express from "express"
import { getPaymentDetails } from "../controllers/payment.js"
import { isAuth } from "../middlewares/isAuth.js"

const router = express.Router()

router.get("/payment/:id", isAuth, getPaymentDetails)

export default router;

