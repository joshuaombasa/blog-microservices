const express = require('express')
const axios = require('axios')


const app = express()

const events = []


app.use(express.json())

app.post('/events', async (request, response) => {
    const event = request.body
    console.log('Recieved event', event.type)
    events.push(event)
    const { type, data } = event

    try {
        await axios.post('http://stories-clusterip-srv:4006/events', { type, data })
        // await axios.post('http://localhost:4007/events', { type, data })
        // await axios.post('http://localhost:4009/events', { type, data })
        // await axios.post('http://localhost:4008/events', { type, data })
    } catch (error) {
        console.log(error)
    }

    response.send({})
})

app.get('/events', (request,response) => {
    response.send(events)
})


app.listen(4010, () => {
    console.log('event-bus up')
    console.log('server running on port 4010')
})