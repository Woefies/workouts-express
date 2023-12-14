import express from 'express';
import Workout from '../models/workoutsModel.js';
import bodyParser from "body-parser";

const router = express.Router();
router.use(express.json()); // use again since it doesn't work if only in index.js

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const setSelfLinkHeader = (req, res, next) => {
    const selfLink = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.setHeader('Link', `<${selfLink}>; rel="self"`);

    res.setHeader('Content-Type', 'application/json');

    next();
};

router.options('/workouts/:id?', (req, res) => {
    const allowedMethods = req.params.id
        ? 'OPTIONS, GET, PUT, DELETE'
        : 'OPTIONS, GET, POST';

    res.header('Access-Control-Allow-Methods', allowedMethods);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).send();
});


router.get('/workouts', async (req, res) => {
    if (!req.accepts('json')) {
        res.status(406).send('Not Acceptable: Supported format is JSON');
    } else {
        try {
            // Fetch the workouts from the database
            const workouts = await Workout.find();

            // Construct the response object
            const responseObj = {
                items: workouts.map((workout) => ({
                    _links: {
                        self: {
                            href: `${req.protocol}://${req.get('host')}/workouts/${workout.id}`,
                            method: 'GET',
                        },
                    },
                    // Workout details
                    name: workout.name,
                    reps: workout.reps,
                    sets: workout.sets,
                    weight: workout.weight,
                })),
                _links: {
                    self: {
                        href: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                        method: 'GET',
                    },
                },
                pagination: {
                    temp: 'pagination maken we later af',
                },
            };

            // Send the response object as JSON
            res.json(responseObj);
        } catch (error) {
            console.error('Error getting workouts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});


// Route to get a specific workout by ID
router.get('/workouts/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        const responseObj = {
            _links: {
                self: {
                    href: `${req.protocol}://${req.get('host')}/workouts/${workout.id}`,
                    method: 'GET',
                },
                collection: {
                    href: `${req.protocol}://${req.get('host')}/workouts`,
                    method: 'GET',
                },
            },
            // Include other workout details
            name: workout.name,
            reps: workout.reps,
            sets: workout.sets,
            weight: workout.weight,
        };

        res.json(responseObj);
    } catch (error) {
        console.error('Error getting workout by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Route to create a new workout
router.post('/workouts',urlencodedParser, async (req, res) => {
    try {
        const newWorkout = new Workout(req.body);

        // Validate the Mongoose model before saving
        await newWorkout.validate();

        // Save the new workout to the database
        await newWorkout.save();

        res.status(201).json(newWorkout);
    } catch (error) {
        if (error.name === 'ValidationError') {
            // Mongoose validation error, respond with a 400 status and details
            return res.status(400).json({ error: error.message });
        }

        console.error('Error creating workout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Route to update a workout by ID
router.put('/workouts/:id', async (req, res) => {
    try {
        console.log('Received PUT request:', req.body);

        // Update only if at least one field is filled
        const updatedWorkout = await Workout.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        console.log('Updated Workout:', updatedWorkout);

        if (!updatedWorkout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        // Fetch the updated item
        const item = await Workout.findOne({ _id: req.params.id });
        res.status(200).json(item);
    } catch (err) {
        if (err.name === 'ValidationError' && err.errors && err.errors.name) {
            // Handle the specific validation error related to the 'name' field
            return res.status(400).json({ error: 'Name is required' });
        }

        console.error('Error updating workout by ID:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Route to delete a workout by ID
router.delete('/workouts/:id', async (req, res) => {
    try {
        const deletedWorkout = await Workout.findByIdAndDelete(req.params.id);
        if (!deletedWorkout) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        return res.status(204).send({ message: 'Workout deleted successfully' });
    } catch (error) {
        console.error('Error deleting workout by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;