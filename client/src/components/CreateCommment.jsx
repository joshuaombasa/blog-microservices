import axios from "axios";
import React, { useState } from "react";

export default function CreateComment({ postId }) {
    const [formData, setFormData] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()
        await axios.post(`http://localhost:4007/stories/${postId}/comments`, { comment: formData })
        setFormData('')
    }
    return (
        <div className="comment-form">
            <form onSubmit={handleSubmit}>
                <label htmlFor="comment">Add comment:</label>
                <input
                    type="text"
                    name="comment"
                    id="comment"
                    value={formData}
                    onChange={e => setFormData(e.target.value)}
                />
                <button>submit</button>
            </form>
        </div>
    )
}