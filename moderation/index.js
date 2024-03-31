const express = require('express')
const axios = require('axios')
const app = express()

app.use(express.json())

app.post('/events', async (request, response) => {
    const event = request.body
    const { type, data } = event

    console.log('Recieved event', type)


    if (type === 'CommentCreation') {
        const { postId, id, comment, status } = data
        const moderatedStatus = comment.includes('sex') ? 'rejected' : 'approved'
        try {
            await axios.post('http://localhost:4010/events', {
                type: 'CommentModeration',
                data: { postId, id, comment, status: moderatedStatus }
            })
        } catch (error) {
            console.log(error)
        }

    }
    response.send({})
})

app.listen(4009, () => {
    console.log('server running on port 4009')
})