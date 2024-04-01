const express = require('express')
const cors = require('cors')
const axios = require('axios')
const app = express()

const stories = {}

app.use(cors())
app.use(express.json())

const handleEvents = (type, data) => {
    if (type === 'StoryCreation') {
        const { id, content } = data
        stories[id] = { postId: id, content, comments: [] }

    } else if (type === 'CommentCreation') {
        const { postId, id, comment, status } = data
        const comments = stories[postId].comments
        comments.push({ id, comment, status })
        stories[postId].comments = comments

    } else if (type === 'CommentUpdated') {
        const { postId, id, comment, status } = data
        const comments = stories[postId].comments
        const commentToUpdate = comments.find(comment => comment.id === id)
        commentToUpdate.status = status
    }
}

app.get('/stories', (request, response) => {
    response.send(stories)
})

app.post('/events', (request, response) => {
    const event = request.body
    console.log('Recieved event', event.type)

    const { type, data } = event
    handleEvents(type, data)
    response.send({})
})

app.listen(4008, async () => {
    console.log('server running on port 4008')

    const res = await axios.get('http://localhost:4010/events')
    for (let event of res.data) {
        const { type, data } = event
        handleEvents(type, data)
    }
})