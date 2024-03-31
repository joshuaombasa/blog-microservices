import axios from "axios";
import React, { useEffect, useState } from "react";
import CommentList from "./CommentList";
import CreateComment from "./CreateCommment";


export default function StoriesList() {

    const [stories, setStories] = useState({})

    const fetchStories = async () => {
        const res = await axios.get('http://localhost:4008/stories')
        setStories(res.data)
        console.log(res.data)
    }


    useEffect(() => {
        fetchStories()
    }, [])

    const renderStories = Object.values(stories).map(story => (
        <div className="story-item" key={story.postId}>
            <h3>{story.content}</h3>
            <div className="comment-info">
                <CommentList comments={story.comments} />
                <CreateComment postId={story.postId} />
            </div>
        </div>
    ))

    return (
        <div className="stories-list">
            <h1>Stories:</h1>
            {renderStories}
        </div>
    )
}