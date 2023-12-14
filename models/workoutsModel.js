import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
    name: { type: String, required: true},
    reps: { type: String },
    sets: { type: String },
    weight: { type: String },
});

const Workout = mongoose.model('Workout', workoutSchema);

export default Workout;