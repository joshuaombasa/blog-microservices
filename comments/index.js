const express = require('express')
const axios = require('axios')
const { randomBytes } = require('crypto')
const cors = require('cors')
const app = express()

const commentsPerPostId = {}

app.use(cors())
app.use(express.json())

app.post('/stories/:id/comments', async (request, response) => {
    const id = randomBytes(4).toString('hex')
    const comments = commentsPerPostId[request.params.id] || []

    comments.push({ id, comment: request.body.comment, status: 'pending' })
    commentsPerPostId[request.params.id] = comments

    try {
        await axios.post('http://event-bus-srv:4010/events', {
            type: 'CommentCreation',
            data: {
                postId: request.params.id,
                id,
                comment: request.body.comment,
                status: 'pending'
            }
        })
    } catch (error) {
        console.log(error)
    }

    response.send({})
})

app.get('/comments', (request, response) => {
    response.send(commentsPerPostId)
})

app.post('/events', async (request, response) => {
    const event = request.body
    console.log('Recieved event', event.type)

    const { type, data } = event

    if (type === 'CommentModeration') {
        const { postId, id, comment, status } = data
        const comments = [...commentsPerPostId[postId]]
        const selection = comments.find(comment => comment.id === id)
        selection.status = status

        try {
            await axios.post('http://event-bus-srv:4010/events', {
                type: 'CommentUpdated',
                data: {
                    postId,
                    id,
                    comment,
                    status
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    response.send({})
})

app.listen(4007, () => {
    console.log(`server running on port 4007`)
})