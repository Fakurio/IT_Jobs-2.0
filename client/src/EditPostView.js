import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditPostView.css';

const EditPostView = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`http://localhost:3000/job-posts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user posts');
        }

        const data = await response.json();
        const userPosts = data.filter(post => post.author.id === user.id); 
        setPosts(userPosts);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserPosts();
  }, [user.id]);

  const handleEditClick = (id) => {
    navigate(`/edit-job-post/${id}`);
  };

  const handleDeleteClick = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/job-posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      setPosts(posts.filter(post => post.id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter ? post.location === filter : true;
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="list-view-container">
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
          <option value="">All Locations</option>
          <option value="Remote">Remote</option>
          <option value="New York">New York</option>
          <option value="San Francisco">San Francisco</option>
        </select>
        <button className="filter-button">Filter</button>
      </div>

      <h1>Edit Your Job Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <ul>
          {filteredPosts.map(post => (
            <li key={post.id} className="job-card">
              <div className="job-card-header">
                <div className="company-logo">
                  <img src={`http://localhost:3000/logo/${post.logo}`} alt="Company Logo" />
                </div>
                <div className="job-title">{post.title}</div>
                <div className="job-salary">${post.salary}</div>
              </div>
              <div className="job-details">
                <div className="job-type">{post.type}</div>
                <div className="job-poster">Posted by: {post.companyName}</div>
              </div>
              <div className="job-actions">
                <button onClick={() => handleEditClick(post.id)} className="edit-btn">Edit</button>
                <button onClick={() => handleDeleteClick(post.id)} className="delete-btn">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EditPostView;
