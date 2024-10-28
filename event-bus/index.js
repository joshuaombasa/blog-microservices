// const express = require('express')
// const axios = require('axios')


// const app = express()

// const events = []


// app.use(express.json())

// app.post('/events', async (request, response) => {
//     const event = request.body
//     console.log('Recieved event', event.type)
//     events.push(event)
//     const { type, data } = event

//     try {
//         await axios.post('http://stories-clusterip-srv:4006/events', { type, data })
//         await axios.post('http://comments-srv:4007/events', { type, data })
//         await axios.post('http://moderation-srv:4009/events', { type, data })
//         await axios.post('http://query-srv:4008/events', { type, data })
//     } catch (error) {
//         console.log(error)
//     }

//     response.send({})
// })

// app.get('/events', (request,response) => {
//     response.send(events)
// })


// app.listen(4010, () => {
//     console.log('event-bus up')
//     console.log('server running on port 4010')
// })

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const app = express();

// MongoDB URI (Adjust this based on your setup)
const mongoURI = 'mongodb://event-bus-mongodb:27017/event_bus_db';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB for event-bus service"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Define the Event schema and model
const eventSchema = new mongoose.Schema({
    type: String,
    data: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});
const EventModel = mongoose.model('Event', eventSchema);

app.use(express.json());

// Event publishing endpoint
app.post('/events', async (req, res) => {
    const event = req.body;
    console.log('Received event:', event.type);

    // Save event to MongoDB
    const newEvent = new EventModel(event);
    await newEvent.save();

    // Forward event to each service
    const { type, data } = event;
    const services = [
        { name: 'stories', url: 'http://stories-clusterip-srv:4006/events' },
        { name: 'comments', url: 'http://comments-srv:4007/events' },
        { name: 'moderation', url: 'http://moderation-srv:4009/events' },
        { name: 'query', url: 'http://query-srv:4008/events' }
    ];

    for (const service of services) {
        try {
            await axios.post(service.url, { type, data });
            console.log(`Event sent to ${service.name} service`);
        } catch (error) {
            console.error(`Error sending event to ${service.name} service:`, error.message);
        }
    }

    res.status(200).send({ status: 'Event dispatched' });
});

// Endpoint to retrieve all stored events
app.get('/events', async (req, res) => {
    const events = await EventModel.find({});
    res.send(events);
});

// Start the server
app.listen(4010, () => {
    console.log('Event-bus service running on port 4010');
});
