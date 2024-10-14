import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModeratorHome.css';

const ModeratorHome = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/job-posts/pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "X-CSRF-Token": localStorage.getItem("token")
          },
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error('Failed to fetch pending posts');
        }

        const data = await response.json();
        setPendingPosts(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching pending posts:', error);
      }
    };

    fetchPendingPosts();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const goToJobDetails = (postId) => {
    navigate(`/job-post/${postId}`);
  };

  return (
    <div className="moderator-home">
      <h1>Pending Job Posts</h1>
      <ul className="post-list">
        {pendingPosts.map(post => (
          <li key={post.id} className="post-item" onClick={() => goToJobDetails(post.id)}> {}
            <div className="post-details">
              <h2>{post.title}</h2>
              <p>Author: {post.author.username}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ModeratorHome;
