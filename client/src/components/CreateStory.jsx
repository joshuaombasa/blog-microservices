import axios from "axios";
import React, { useState } from "react";

export default function CreateStory() {
    const [formData, setFormData] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        await axios.post('http://stories.com/stories/create', { content: formData })
        setFormData('')
    }

    return (
        <div className="story-form">
            <form onSubmit={handleSubmit}>
                <label htmlFor="story">New story:</label>
                <input
                    type="text"
                    value={formData}
                    onChange={(e) => setFormData(e.target.value)}
                />
                <button>submit</button>
            </form>
        </div>
    )
}