import React from "react";

export default function CommentList({ comments }) {

    const renderComments = comments.map(comment => (
        <li key={comment.id}>
            <em>{comment.comment}</em>
        </li>)
    )
    return (
        <div className="comment-list">
            {renderComments}
        </div>
    )
}