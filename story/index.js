// const express = require('express')
// const axios = require('axios')
// const { randomBytes } = require('crypto')
// const cors = require('cors')

// const app = express()

// const stories = {}

// app.use(cors())
// app.use(express.json())


// app.post('/stories/create', async (request, response) => {
//     const id = randomBytes(4).toString('hex')
//     const content = request.body.content
//     stories[id] = { id, content }

//     try {
//         await axios.post('http://event-bus-srv:4010/events', {
//             type: 'StoryCreation',
//             data: { id, content }
//         })
//     } catch (error) {
//         console.log(error)
//     }
//     response.send({})
// })

// app.get('/stories', (request, response) => {
//     response.send(stories)
// })

// app.post('/events', (request, response) => {
//     const event = request.body
//     console.log('Recieved event', event.type)
//     response.send({})
// })

// app.listen(4006, () => {
//     console.log('server is up and running on port 4006')
// })

const express = require('express');
const axios = require('axios');
const { randomBytes } = require('crypto');
const cors = require('cors');
const mongoose = require('mongoose');

// MongoDB URI (Adjust this based on your setup)
const mongoURI = 'mongodb://story-mongodb:27017/story_db';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB for story service"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Define the Story schema and model
const storySchema = new mongoose.Schema({
    id: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});
const StoryModel = mongoose.model('Story', storySchema);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/stories/create', async (request, response) => {
    const id = randomBytes(4).toString('hex');
    const content = request.body.content;

    // Save the story to MongoDB
    const newStory = new StoryModel({ id, content });
    await newStory.save();

    try {
        await axios.post('http://event-bus-srv:4010/events', {
            type: 'StoryCreation',
            data: { id, content }
        });
    } catch (error) {
        console.log(error);
    }
    response.send({});
});

app.get('/stories', async (request, response) => {
    const stories = await StoryModel.find({});
    response.send(stories);
});

app.post('/events', (request, response) => {
    const event = request.body;
    console.log('Received event', event.type);
    response.send({});
});

app.listen(4006, () => {
    console.log('Story service is up and running on port 4006');
});
