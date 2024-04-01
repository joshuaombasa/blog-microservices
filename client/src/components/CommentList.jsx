import React from "react";

export default function CommentList({ comments }) {

    const renderComments = comments.map(comment => {

        let content = ''
        let statusStyle
        if (comment.status === 'approved') {
            content = comment.comment
            statusStyle = {color: 'green', fontWeight:'700'}
        } else if (comment.status === 'pending') {
            content = 'This comment awaiting moderation'
            statusStyle={color: 'purple'}
        } else if (comment.status === 'rejected') {
            content = 'This comment has been rejected'
            statusStyle={color: 'red',textDecoration:'underline'}
        }
  
    
        return (<li style={statusStyle} key={comment.id}>
            <em>{content}</em>
        </li>)

    })
    return (
        <div className="comment-list">
            {renderComments}
        </div>
    )
}