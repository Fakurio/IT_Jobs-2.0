import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";
import "./Navbar.css";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isModerator, setIsModerator] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    let parsedUser = null;

    if (userData) {
      parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const userRoles = parsedUser?.roles.map((role) => role.role);
      setIsModerator(userRoles && userRoles.includes("MODERATOR"));

      if (parsedUser.notifications && Array.isArray(parsedUser.notifications)) {
        setNotifications(parsedUser.notifications);
      }
    }

    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      if (parsedUser) {
        socket.emit("new user", parsedUser.id);
      }
    });

    socket.on("new application", (data) => {
      console.log(data);
      setNotifications((prev) => [
        ...prev,
        {
          type: data.type,
          content: data.content,
        },
      ]);
    });

    socket.on("status change", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: data.type,
          content: data.content,
        },
      ]);
    });

    socket.on("post rejected", (data) => {
      setNotifications((prev) => [
        ...prev,
        {
          type: data.type,
          content: data.content,
        },
      ]);
    });

    socket.on("exception", (data) => {
      console.error(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
      });

      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setNotifications([]);
        navigate("/login");
      } else {
        throw new Error("Failed to log out");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
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
              <Link to="/my-favourite-posts">My favourite posts</Link>
              <div
                onClick={handleBellClick}
                style={{
                  position: "relative",
                  marginLeft: "1rem",
                  cursor: "pointer",
                }}
              >
                <FontAwesomeIcon
                  icon={faBell}
                  size="lg"
                  style={{ color: "white" }}
                />
                {notifications.length > 0 && (
                  <span className="notification-badge">
                    {notifications.length}
                  </span>
                )}
                {showNotifications && (
                  <div className="notification-dropdown">
                    {notifications.length === 0 ? (
                      <p>No notifications</p>
                    ) : (
                      <ul>
                        {notifications.map((notification, index) => (
                          <li key={index}>
                            {`${notification.type}: ${notification.content}`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
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
