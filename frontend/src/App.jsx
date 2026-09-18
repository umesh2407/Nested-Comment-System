import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "https://nested-comment-system-1-mspx.onrender.com/comments";

function App() {
  const [comments, setComments] = useState([]);

  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  const [replyId, setReplyId] = useState(null);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const [editId, setEditId] = useState(null);
  const [editMessage, setEditMessage] = useState("");

  const getComments = async () => {
    try {
      const response = await axios.get(API);
      setComments(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getComments();
  }, []);

  const addComment = async () => {
    if (!author || !message) return;
    try {
      await axios.post(API, {
        author,
        message,
      });

      setAuthor("");
      setMessage("");

      getComments();
    } catch (error) {
      console.log(error);
    }
  };

  const addReply = async (parentId) => {
    if (!replyAuthor || !replyMessage) return;

    try {
      await axios.post(API, {
        parentId,
        author: replyAuthor,
        message: replyMessage,
      });

      setReplyId(null);
      setReplyAuthor("");
      setReplyMessage("");

      getComments();
    } catch (error) {
      console.log(error);
    }
  };

  const updateComment = async (id) => {
    if (!editMessage.trim()) return;

    try {
      await axios.patch(`${API}/${id}`, {
        message: editMessage,
      });

      setEditId(null);
      setEditMessage("");

      getComments();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteComment = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);

      getComments();
    } catch (error) {
      console.log(error);
    }
  };

  const renderComment = (comment) => {
    return (
      <div className="comment" key={comment._id}>
        <b>{comment.author}</b>

        {editId === comment._id ? (
          <>
            <input
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
            />

            <button onClick={() => updateComment(comment._id)}>Save</button>

            <button onClick={() => setEditId(null)}>Cancel</button>
          </>
        ) : (
          <>
            <p>{comment.message}</p>

            <button
              onClick={() => {
                setReplyId(comment._id);
                setReplyAuthor("");
                setReplyMessage("");
              }}
            >
              Reply
            </button>

            <button
              onClick={() => {
                setEditId(comment._id);
                setEditMessage(comment.message);
              }}
            >
              Edit
            </button>

            <button onClick={() => deleteComment(comment._id)}>Delete</button>
          </>
        )}

        {/* Reply Form */}
        {replyId === comment._id && (
          <div className="replyForm">
            <input
              placeholder="Your name"
              value={replyAuthor}
              onChange={(e) => setReplyAuthor(e.target.value)}
            />

            <input
              placeholder="Reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />

            <button onClick={() => addReply(comment._id)}>Add Reply</button>

            <button onClick={() => setReplyId(null)}>Cancel</button>
          </div>
        )}

        {/* Nested Replies */}
        <div className="replies">
          {comment.replies?.map((reply) => renderComment(reply))}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Testing CI CD Working</h1>
      <h2>Comments</h2>

      <div className="form">
        <input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <input
          placeholder="Write a comment..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={addComment}>Add Comment</button>
      </div>

      {comments.map((comment) => renderComment(comment))}
    </div>
  );
}

export default App;
