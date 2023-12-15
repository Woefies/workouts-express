import connectDB from './db.js';
import Workout from './models/workoutsModel.js';
import faker from 'faker';
import mongoose from "mongoose";

const seedWorkouts = async () => {
    await connectDB();

    try {
        await Workout.deleteMany(); // dump existing workouts

        const workouts = Array.from({ length: 100 }).map(() => ({
            name: faker.lorem.word(),
            reps: faker.datatype.number({ min: 1, max: 20 }),
            sets: faker.datatype.number({ min: 1, max: 10 }),
            weight: faker.datatype.number({ min: 5, max: 100 }),
        }));

        await Workout.insertMany(workouts);
        console.log('Workouts seeded successfully');
    } catch (error) {
        console.error('Error seeding workouts:', error);
    } finally {
        mongoose.connection.close();
    }
};

seedWorkouts();