import React, { useEffect, useState } from 'react';
import './MyPostsView.css';

const MyPostsView = () => {
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState({});
  const [error, setError] = useState(null);
  const [activePostId, setActivePostId] = useState(null);

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
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const user = JSON.parse(localStorage.getItem('user'));
        const userPosts = data.filter(post => post.author.id === user.id);
        
        const postsWithApplications = await Promise.all(
          userPosts.map(async (post) => {
            const appResponse = await fetch(`http://localhost:3000/job-posts/${post.id}/applications?status=Pending`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                "X-CSRF-Token": localStorage.getItem("token"),
              },
              credentials: "include"
            });
            if (appResponse.ok) {
              const appsData = await appResponse.json();
              return { ...post, applications: appsData.length > 0 ? appsData : null };
            }
            return { ...post, applications: null };
          })
        );

        const sortedPosts = postsWithApplications.sort((a, b) => {
          if (a.applications && !b.applications) return -1;
          if (!a.applications && b.applications) return 1;
          return 0;
        });

        setPosts(sortedPosts);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching posts:', error);
      }
    };

    fetchUserPosts();
  }, []);

  const fetchApplications = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/job-posts/${postId}/applications?status=Pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(prevApplications => ({ ...prevApplications, [postId]: data }));
      setActivePostId(postId);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching applications:', error);
    }
  };

  const updateApplicationStatus = async (applicationId, status, postId) => {
    try {
      const response = await fetch(`http://localhost:3000/job-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      alert(`Application status updated to: ${status}`);
      fetchApplications(postId);
    } catch (error) {
      setError(error.message);
      console.error('Error updating application status:', error);
    }
  };

  const downloadCV = async (applicationId) => {
    try {
      const response = await fetch(`http://localhost:3000/job-applications/${applicationId}/cv`, {
        method: 'GET',
        headers: {
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error('Failed to download CV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cv_${applicationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
      console.error('Error downloading CV:', error);
    }
  };

  return (
    <div className="my-posts-view">
      <h1>My Job Posts</h1>
      {posts.length === 0 ? (
        <p>No job posts available.</p>
      ) : (
        <ul className="posts-list">
          {posts.map(post => (
            <React.Fragment key={post.id}>
              <li className="post-item">
                <div className="post-header">
                  {}
                  <div className="company-logo">
                    <img src={`http://localhost:3000/logo/${post.logo}`} alt="Company Logo" />
                  </div>
                  <h3 className="job-title">{post.title}</h3>
                </div>

                {}
                {post.applications !== null && (
                  <button className="view-applications-btn" onClick={() => fetchApplications(post.id)}>
                    {activePostId === post.id ? "Hide Applications" : `View Applications (${post.applications ? post.applications.length : 0})`}
                  </button>
                )}
              </li>

              {}
              {activePostId === post.id && applications[post.id] && applications[post.id].length > 0 && (
                <div className="applications-section">
                  <h4>Applications:</h4>
                  <ul className="applications-list">
                    {applications[post.id].map(application => (
                      <li key={application.id} className="application-item">
                        <div className="application-details">
                          <p>Applicant: {application.user.username}</p>
                          <button onClick={() => downloadCV(application.id)} className="download-cv-btn">Download CV</button>
                        </div>
                        <div className="application-actions">
                          <button onClick={() => updateApplicationStatus(application.id, 'Accepted', post.id)} className="accept-btn">Accept</button>
                          <button onClick={() => updateApplicationStatus(application.id, 'Rejected', post.id)} className="reject-btn">Reject</button>
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
