import 'dotenv/config';
import express from 'express';
import connectDB from './db.js';
import workoutRoutes from './routes/workoutRoutes.js';
import setSelfLinkHeader from './routes/workoutRoutes.js';

const app = express();
const PORT = 8000;

// Connect to MongoDB
connectDB();

app.use(setSelfLinkHeader);

app.use(express.json());

app.use('/', workoutRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://145.24.222.39:${PORT}/workouts`);
});
