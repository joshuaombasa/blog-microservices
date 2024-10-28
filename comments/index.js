// const express = require('express')
// const axios = require('axios')
// const { randomBytes } = require('crypto')
// const cors = require('cors')
// const app = express()

// const commentsPerPostId = {}

// app.use(cors())
// app.use(express.json())

// app.post('/stories/:id/comments', async (request, response) => {
//     const id = randomBytes(4).toString('hex')
//     const comments = commentsPerPostId[request.params.id] || []

//     comments.push({ id, comment: request.body.comment, status: 'pending' })
//     commentsPerPostId[request.params.id] = comments

//     try {
//         await axios.post('http://event-bus-srv:4010/events', {
//             type: 'CommentCreation',
//             data: {
//                 postId: request.params.id,
//                 id,
//                 comment: request.body.comment,
//                 status: 'pending'
//             }
//         })
//     } catch (error) {
//         console.log(error)
//     }

//     response.send({})
// })

// app.get('/comments', (request, response) => {
//     response.send(commentsPerPostId)
// })

// app.post('/events', async (request, response) => {
//     const event = request.body
//     console.log('Recieved event', event.type)

//     const { type, data } = event

//     if (type === 'CommentModeration') {
//         const { postId, id, comment, status } = data
//         const comments = [...commentsPerPostId[postId]]
//         const selection = comments.find(comment => comment.id === id)
//         selection.status = status

//         try {
//             await axios.post('http://event-bus-srv:4010/events', {
//                 type: 'CommentUpdated',
//                 data: {
//                     postId,
//                     id,
//                     comment,
//                     status
//                 }
//             })
//         } catch (error) {
//             console.log(error)
//         }
//     }

//     response.send({})
// })

// app.listen(4007, () => {
//     console.log(`server running on port 4007`)
// })

const express = require('express');
const axios = require('axios');
const { randomBytes } = require('crypto');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// MongoDB URI for the comments-mongodb deployment
const mongoURI = 'mongodb://comments-mongodb:27017/comments_db';

// Connect to MongoDB for the comments service
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB for comments service"))
    .catch(err => console.log("Error connecting to MongoDB:", err));

// Define the Comment schema and model
const commentSchema = new mongoose.Schema({
    postId: String,
    id: String,
    comment: String,
    status: String
});
const Comment = mongoose.model('Comment', commentSchema);

app.use(cors());
app.use(express.json());

// Route to create a new comment
app.post('/stories/:id/comments', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { comment } = req.body;
    const postId = req.params.id;

    // Create and save the comment in MongoDB
    const newComment = new Comment({
        postId,
        id,
        comment,
        status: 'pending'
    });
    await newComment.save();

    // Send event to the event-bus
    try {
        await axios.post('http://event-bus-srv:4010/events', {
            type: 'CommentCreated',
            data: {
                postId,
                id,
                comment,
                status: 'pending'
            }
        });
    } catch (error) {
        console.error("Error sending event to event-bus:", error);
    }

    res.status(201).send(newComment);
});

// Route to fetch all comments for a specific post
app.get('/stories/:id/comments', async (req, res) => {
    const comments = await Comment.find({ postId: req.params.id });
    res.send(comments);
});

// Endpoint to handle incoming events
app.post('/events', async (req, res) => {
    const { type, data } = req.body;

    console.log('Received event:', type);

    if (type === 'CommentModerated') {
        const { id, postId, status } = data;

        // Find and update the comment status in MongoDB
        await Comment.updateOne({ id, postId }, { status });

        // Emit the updated comment to event-bus
        try {
            await axios.post('http://event-bus-srv:4010/events', {
                type: 'CommentUpdated',
                data: {
                    id,
                    postId,
                    status
                }
            });
        } catch (error) {
            console.error("Error sending updated event to event-bus:", error);
        }
    }

    res.send({});
});

// Start the server
app.listen(4007, () => {
    console.log('Comments service running on port 4007');
});
