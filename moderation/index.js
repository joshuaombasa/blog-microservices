// const express = require('express')
// const axios = require('axios')
// const app = express()

// app.use(express.json())



// app.post('/events', async (request, response) => {
//     const event = request.body
//     const { type, data } = event

//     console.log('Recieved event', type)

//     if (type === 'CommentCreation') {
//         const { postId, id, comment, status } = data
//         const moderatedStatus = comment.includes('sex') ? 'rejected' : 'approved'

//         const res = await axios.post('http://event-bus-srv:4010/events', {
//             type: 'CommentModeration',
//             data: { postId, id, comment, status: moderatedStatus }
//         })

//     }

//     response.send({})
// })

// app.listen(4009, () => {
//     console.log('server running on port 4009')
// })

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();

// MongoDB URI (Adjust this based on your setup)
const mongoURI = 'mongodb://moderation-mongodb:27017/moderation_db';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB for moderation service"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Define the Moderated Comment schema and model
const moderatedCommentSchema = new mongoose.Schema({
    postId: String,
    id: String,
    comment: String,
    status: String,
    createdAt: { type: Date, default: Date.now }
});
const ModeratedCommentModel = mongoose.model('ModeratedComment', moderatedCommentSchema);

app.use(express.json());

app.post('/events', async (req, res) => {
    const event = req.body;
    const { type, data } = event;

    console.log('Received event:', type);

    if (type === 'CommentCreation') {
        const { postId, id, comment, status } = data;
        const moderatedStatus = comment.includes('sex') ? 'rejected' : 'approved';

        // Save the moderated comment to MongoDB
        const moderatedComment = new ModeratedCommentModel({
            postId,
            id,
            comment,
            status: moderatedStatus
        });
        await moderatedComment.save();

        // Send moderation event to the event-bus
        await axios.post('http://event-bus-srv:4010/events', {
            type: 'CommentModeration',
            data: { postId, id, comment, status: moderatedStatus }
        });
    }

    res.send({});
});

// Start the server
app.listen(4009, () => {
    console.log('Moderation service running on port 4009');
});
