import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ModeratorJobDetailView.css';

const ModeratorJobDetailView = () => {
  const { id } = useParams();
  const [jobDetails, setJobDetails] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/job-posts/pending/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            "X-CSRF-Token": localStorage.getItem("token")
          },
          credentials: "include"
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job details');
        }

        const data = await response.json();
        setJobDetails(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching job details:', error);
      }
    };

    fetchJobDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/job-posts/pending/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "X-CSRF-Token": localStorage.getItem("token")
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update post status');
      }

      alert(`Post status updated to: ${newStatus}`);
      navigate('/main');
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!jobDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="moderator-job-detail">
      <h1>{jobDetails.title}</h1>
      <p><strong>Author:</strong> {jobDetails.author.username}</p>
      <p><strong>Description:</strong> {jobDetails.description}</p>
      <p><strong>Location:</strong> {jobDetails.location}</p>
      <p><strong>Salary:</strong> ${jobDetails.salary}</p>
      <p><strong>Contract Type:</strong> {jobDetails.contractType.type}</p>
      <p><strong>Level:</strong> {jobDetails.level.level}</p>
      <h3>Languages:</h3>
      <ul>
        {jobDetails.languages.map(language => (
          <li key={language.id}>{language.language}</li>
        ))}
      </ul>
      <div className="job-actions">
        <button 
          className="accept-btn" 
          onClick={() => handleUpdateStatus("Accepted")}
        >
          Accept
        </button>
        <button 
          className="reject-btn" 
          onClick={() => handleUpdateStatus("Rejected")}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default ModeratorJobDetailView;
