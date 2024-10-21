import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./MyPostsView.css";

const MyFavouritePostsView = () => {
  const [favouritePosts, setFavouritePosts] = useState([]);
  const [error, setError] = useState(null);

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

  return (
    <div className="my-posts-view">
      <h1>My Favourite Posts</h1>

      {favouritePosts.length === 0 ? (
        <p>No favourite posts available.</p>
      ) : (
        <ul className="posts-list">
          {favouritePosts.map((post) => (
            <li key={post.id} className="post-item">
              <Link to={`/job-post/${post.id}`}>
                <h3>{post.title}</h3>
              </Link>
              <p>{post.companyName}</p>
              <p>{post.location}</p>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyFavouritePostsView;
