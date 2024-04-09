const express = require('express')
const axios = require('axios')
const { randomBytes } = require('crypto')
const cors = require('cors')

const app = express()

const stories = {}

app.use(cors())
app.use(express.json())


app.post('/stories/create', async (request, response) => {
    const id = randomBytes(4).toString('hex')
    const content = request.body.content
    stories[id] = { id, content }

    try {
        await axios.post('http://event-bus-srv:4010/events', {
            type: 'StoryCreation',
            data: { id, content }
        })
    } catch (error) {
        console.log(error)
    }
    response.send({})
})

app.get('/stories', (request, response) => {
    response.send(stories)
})

app.post('/events', (request, response) => {
    const event = request.body
    console.log('Recieved event', event.type)
    response.send({})
})

app.listen(4006, () => {
    console.log('server is up and running on port 4006')
})