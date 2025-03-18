import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './database/db.js';
import Razorpay from 'razorpay';
import cors from 'cors';

dotenv.config();

export const instance = new Razorpay({
    key_id: process.env.Razorpay_Key,
    key_secret: process.env.Razorpay_Secret,
});

const app = express();

// using middlewares
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// importing routes
import userRoutes from './routes/user.js';
import courseRoutes from './routes/course.js';
import adminRoutes from './routes/admin.js';
import quizRoutes from './routes/quizRoutes.js'; // Import quiz routes
import zoomRoutes from './routes/zoom.js'; // Import zoom routes
import liveClassRoutes from "./routes/liveClass.js"; // Import live courses routes
import paymentRoutes from "./routes/payment.js";
import feedbackRoutes from './routes/feedback.js';

// using routes
app.use('/api', userRoutes);
app.use('/api', courseRoutes);
app.use('/api', adminRoutes);
app.use('/api/quiz', quizRoutes); // Use quiz routes
app.use('/api/zoom', zoomRoutes); // Use zoom routes
app.use("/api", liveClassRoutes); // Use live courses routes
app.use("/api", paymentRoutes);
app.use('/api', feedbackRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); 
    connectDb();
});