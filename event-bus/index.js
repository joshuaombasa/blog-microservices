const express = require('express')
const axios = require('axios')


const app = express()




app.use(express.json())

app.post('/events', async (request, response) => {
    const event = request.body
    const { type, data } = event

    try {
        await axios.post('http://localhost:4006/events', { type, data })
        await axios.post('http://localhost:4007/events', { type, data })
        await axios.post('http://localhost:4008/events', { type, data })
        await axios.post('http://localhost:4009/events', { type, data })
    } catch (error) {
        console.log(error)
    }

    response.send({})
})


app.listen(4010, () => {
    console.log('server running on port 4010')
})