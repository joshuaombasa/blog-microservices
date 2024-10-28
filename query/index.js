// const express = require('express')
// const cors = require('cors')
// const axios = require('axios')
// const app = express()

// const stories = {}

// app.use(cors())
// app.use(express.json())

// const handleEvents = (type, data) => {
    
//     if (type === 'StoryCreation') {
//         const { id, content } = data
//         stories[id] = { postId: id, content, comments: [] }

//     } else if (type === 'CommentCreation') {
//         const { postId, id, comment, status } = data
//         const comments = stories[postId].comments
//         comments.push({ id, comment, status })
//         stories[postId].comments = comments

//     } else if (type === 'CommentUpdated') {
//         const { postId, id, comment, status } = data
//         const comments = stories[postId].comments
//         const commentToUpdate = comments.find(comment => comment.id === id)
//         commentToUpdate.status = status
//     }
// }

// app.get('/stories', (request, response) => {
//     response.send(stories)
// })

// app.post('/events', (request, response) => {
//     const event = request.body
//     console.log('Recieved event', event.type)

//     const { type, data } = event
//     handleEvents(type, data)
//     response.send({})
// })

// app.listen(4008, async () => {
//     console.log('server running on port 4008')

//     const res = await axios.get('http://event-bus-srv:4010/events')
//     for (let event of res.data) {
//         const { type, data } = event
//         handleEvents(type, data)
//     }
// })

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();

// MongoDB URI (Adjust this based on your setup)
const mongoURI = 'mongodb://query-mongodb:27017/query_db';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB for query service"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Define the Story schema and model
const storySchema = new mongoose.Schema({
    postId: String,
    content: String,
    comments: [
        {
            id: String,
            comment: String,
            status: String
        }
    ],
    createdAt: { type: Date, default: Date.now }
});
const StoryModel = mongoose.model('Story', storySchema);

app.use(cors());
app.use(express.json());

const handleEvents = async (type, data) => {
    if (type === 'StoryCreation') {
        const { id, content } = data;

        // Save the story to MongoDB
        const newStory = new StoryModel({ postId: id, content, comments: [] });
        await newStory.save();

    } else if (type === 'CommentCreation') {
        const { postId, id, comment, status } = data;

        // Update the story with the new comment
        const story = await StoryModel.findOne({ postId });
        if (story) {
            story.comments.push({ id, comment, status });
            await story.save();
        }

    } else if (type === 'CommentUpdated') {
        const { postId, id, comment, status } = data;

        // Update the comment status in the story
        const story = await StoryModel.findOne({ postId });
        if (story) {
            const commentToUpdate = story.comments.find(c => c.id === id);
            if (commentToUpdate) {
                commentToUpdate.status = status;
                await story.save();
            }
        }
    }
};

app.get('/stories', async (req, res) => {
    const stories = await StoryModel.find({});
    res.send(stories);
});

app.post('/events', async (req, res) => {
    const event = req.body;
    console.log('Received event:', event.type);

    const { type, data } = event;
    await handleEvents(type, data);
    res.send({});
});

app.listen(4008, async () => {
    console.log('Query service running on port 4008');

    const res = await axios.get('http://event-bus-srv:4010/events');
    for (let event of res.data) {
        const { type, data } = event;
        await handleEvents(type, data);
    }
});
