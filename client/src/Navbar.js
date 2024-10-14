import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      const userRoles = parsedUser?.roles.map((role) => role.role);
      setIsModerator(userRoles.includes("MODERATOR"));
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
      } else {
        throw new Error('Failed to log out');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/main">Home</Link>
      {user ? (
        <>
          {!isModerator && (
            <>
              <Link to="/add-post">Add post</Link>
              <Link to="/edit-post">Edit post</Link>
              <Link to="/my-posts">My posts</Link>
              <Link to="/my-applications">My applications</Link>
            </>
          )}
          <div className="user-menu">
            <span>{user.username}</span>
            <div className="dropdown">
              <button className="dropbtn">▼</button>
              <div className="dropdown-content">
                <Link to="/edit-profile">Edit Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
