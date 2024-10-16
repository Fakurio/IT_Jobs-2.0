import React, { useEffect, useState } from "react";
import "./MyPostsView.css";

const MyPostsView = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [activePostId, setActivePostId] = useState(null);

  const [activeTab, setActiveTab] = useState("accepted");
  const [counts, setCounts] = useState({
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const fetchUserPosts = async (status) => {
    try {
      const response = await fetch(
        `http://localhost:3000/job-posts/me?status=${status}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();

      const postsWithApplications = await Promise.all(
        data.map(async (post) => {
          const response = await fetch(
            `http://localhost:3000/job-posts/${post.id}/applications?status=pending`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": localStorage.getItem("token"),
              },
              credentials: "include",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch applications");
          }

          const applicationsData = await response.json();
          return {
            ...post,
            applications: applicationsData.length > 0 ? applicationsData : null,
          };
        })
      );

      const sortedPosts = postsWithApplications.sort((a, b) => {
        if (a.applications && !b.applications) return -1;
        if (!a.applications && b.applications) return 1;
        return 0;
      });

      setPosts(sortedPosts);
      setCounts((prevCounts) => ({
        ...prevCounts,
        [status]: data.length,
      }));
    } catch (error) {
      setError(error.message);
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchUserPosts(activeTab);
  }, [activeTab]);

  useEffect(() => {
    ["pending", "accepted", "rejected"].forEach((status) => {
      fetchUserPosts(status);
    });
  }, []);

  const updateApplicationStatus = async (applicationId, status, postId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/job-applications/${applicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update application status");
      }

      alert(`Application status updated to: ${status}`);
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              applications: post.applications.filter(
                (application) => application.id !== applicationId
              ),
            };
          }
          return post;
        })
      );
    } catch (error) {
      setError(error.message);
      console.error("Error updating application status:", error);
    }
  };

  const downloadCV = async (applicationId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/job-applications/${applicationId}/cv`,
        {
          method: "GET",
          headers: {
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include",
        }
      );

      if (response.status === 404) {
        alert("User has removed their CV.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to download CV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cv_${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
      console.error("Error downloading CV:", error);
    }
  };

  return (
    <div className="my-posts-view">
      <h1>My Job Posts</h1>

      <div className="tabs">
        <button
          className={activeTab === "pending" ? "active" : ""}
          onClick={() => setActiveTab("pending")}
        >
          Pending ({counts.pending})
        </button>
        <button
          className={activeTab === "accepted" ? "active" : ""}
          onClick={() => setActiveTab("accepted")}
        >
          Accepted ({counts.accepted})
        </button>
        <button
          className={activeTab === "rejected" ? "active" : ""}
          onClick={() => setActiveTab("rejected")}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>

      {posts.length === 0 ? (
        <p>No job posts available.</p>
      ) : (
        <ul className="posts-list">
          {posts.map((post) => (
            <React.Fragment key={post.id}>
              <li className="post-item">
                <div className="post-header">
                  <div className="company-logo">
                    <img
                      src={`http://localhost:3000/logo/${post.logo}`}
                      alt="Company Logo"
                    />
                  </div>
                  <h3 className="job-title">{post.title}</h3>
                </div>

                {post.applications && post.applications.length > 0 && (
                  <button
                    className="view-applications-btn"
                    onClick={() =>
                      setActivePostId(activePostId === post.id ? null : post.id)
                    }
                  >
                    {activePostId === post.id
                      ? "Hide Applications"
                      : `View Applications (${post.applications.length})`}
                  </button>
                )}
              </li>

              {activePostId === post.id &&
                post.applications &&
                post.applications.length > 0 && (
                  <div className="applications-section">
                    <h4>Applications:</h4>
                    <ul className="applications-list">
                      {post.applications.map((application) => (
                        <li key={application.id} className="application-item">
                          <div className="application-details">
                            <p>Applicant: {application.user.username}</p>
                            <button
                              onClick={() => downloadCV(application.id)}
                              className="download-cv-btn"
                            >
                              {application.user.cv
                                ? "Download CV"
                                : "User removed CV"}
                            </button>
                          </div>
                          <div className="application-actions">
                            <button
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "Accepted",
                                  post.id
                                )
                              }
                              className="accept-btn"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() =>
                                updateApplicationStatus(
                                  application.id,
                                  "Rejected",
                                  post.id
                                )
                              }
                              className="reject-btn"
                            >
                              Reject
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </React.Fragment>
          ))}
        </ul>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyPostsView;
