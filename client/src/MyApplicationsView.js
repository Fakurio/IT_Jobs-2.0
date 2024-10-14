import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyApplicationsView.css';

const MyApplicationsView = () => {
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({ pending: 0, accepted: 0, rejected: 0 });
  const navigate = useNavigate();

  const fetchApplications = async (status) => {
    try {
      const response = await fetch(`http://localhost:3000/job-applications/me?status=${status}`, {
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
      setApplications(data);
      setCounts((prevCounts) => ({
        ...prevCounts,
        [status]: data.length,
      }));
    } catch (error) {
      setError(error.message);
      console.error('Error fetching applications:', error);
    }
  };

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  useEffect(() => {
    ['pending', 'accepted', 'rejected'].forEach(status => {
      fetchApplications(status);
    });
  }, []);

  const handleJobClick = (jobId) => {
    navigate(`/job-post/${jobId}`, { state: { fromApplications: true } });
  };

  return (
    <div className="my-applications-view">
      <h1>My Applications</h1>
      <div className="tabs">
        <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>
          Pending ({counts.pending})
        </button>
        <button className={activeTab === 'accepted' ? 'active' : ''} onClick={() => setActiveTab('accepted')}>
          Accepted ({counts.accepted})
        </button>
        <button className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>
          Rejected ({counts.rejected})
        </button>
      </div>

      {}
      <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>

      <div className="applications-content">
        {applications.length === 0 ? (
          <p>No applications found for this status.</p>
        ) : (
          <ul className="applications-list">
            {applications.map(app => (
              <li key={app.id} className="application-item">
                {}
                <h3 className="job-title" onClick={() => handleJobClick(app.jobPost.id)}>{app.jobPost.title}</h3>
                
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default MyApplicationsView;
