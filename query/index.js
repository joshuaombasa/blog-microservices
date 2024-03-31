const express = require('express')
const cors = require('cors')
const app = express()

const stories = {}

app.use(cors())
app.use(express.json())

app.get('/stories', (request, response) => {
    response.send(stories)
})

app.post('/events', (request, response) => {
    const event = request.body
    console.log('Recieved event', event.type)

    const { type, data } = event
    if (type === 'StoryCreation') {
        const { id, content } = data
        stories[id] = { postId: id, content, comments: [] }

        response.send({})
    } else if (type === 'CommentCreation') {
        const { postId, id, comment, status } = data
        const comments = stories[postId].comments
        comments.push({ id, comment, status })
        stories[postId].comments = comments

        response.send({})
    } else if (type === 'CommentUpdated') {
        const { postId, id, comment, status } = data
        const comments = stories[postId].comments
        comments.push({ id, comment, status })
        stories[postId].comments = comments

        response.send({})
    }
})

app.listen(4008, () => {
    console.log('server running on port 4008')
})