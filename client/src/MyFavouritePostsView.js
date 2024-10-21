import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './MyFavouritePostsView.css';

const MyFavouritePostsView = () => {
  const [favouritePosts, setFavouritePosts] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFavouritePosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/job-posts/favourite", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch favourite posts");
      }

      const data = await response.json();
      setFavouritePosts(data);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching favourite posts:", error);
    }
  };

  useEffect(() => {
    fetchFavouritePosts();
  }, []);

  const handlePostClick = (id) => {
    navigate(`/job-post/${id}`);
  };

  return (
    <div className="my-favourite-posts-view">
      <h1 className="my-favourite-posts-title">My Favourite Posts</h1>

      {favouritePosts.length === 0 ? (
        <p className="no-favourite-posts-message">No favourite posts available.</p>
      ) : (
        <ul className="favourite-posts-list">
          {favouritePosts.map((post) => (
            <li key={post.id} className="favourite-post-item" onClick={() => handlePostClick(post.id)}>
              <div className="favourite-post-header">
                <div className="favourite-company-logo">
                  <img src={`http://localhost:3000/logo/${post.logo}`} alt="Company Logo" />
                </div>
                <div className="favourite-job-title">{post.title}</div>
                <div className="favourite-job-salary">${post.salary}</div>
              </div>
              <div className="favourite-job-details">
                <div className="favourite-job-type">{post.type}</div>
                <div className="favourite-job-poster">Posted by: {post.companyName}</div>
                <div className="favourite-job-location">{post.location}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="favourite-error">{error}</p>}
    </div>
  );
};

export default MyFavouritePostsView;
