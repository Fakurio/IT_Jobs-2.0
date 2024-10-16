import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfileView.css';

const EditProfileView = () => {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [message, setMessage] = useState('');
  const [existingCv, setExistingCv] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentCv = async () => {
      try {
        const response = await fetch('http://localhost:3000/users/cv/static', {
          method: 'GET',
          headers: {
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include",
        });

        if (response.ok) {
          setExistingCv(true);
        } else if (response.status === 404) {
          setExistingCv(null);
        }
      } catch (error) {
        console.error('Error fetching CV status:', error);
      }
    };

    fetchCurrentCv();
  }, []);

  const handleCvUpload = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (username) formData.append('username', username);
    if (oldPassword) formData.append('oldPassword', oldPassword);
    if (newPassword) formData.append('newPassword', newPassword);
    if (cvFile) formData.append('cv', cvFile);

    if (formData.has('username') || formData.has('oldPassword') || formData.has('newPassword') || formData.has('cv')) {
      try {
        const response = await fetch('http://localhost:3000/users', {
          method: 'PATCH',
          headers: {
            "X-CSRF-Token": localStorage.getItem("token"),
          },
          credentials: "include",
          body: formData,
        });

        if (response.ok) {
          setMessage('Profile updated successfully!');
        } else {
          const errorResponse = await response.json();
          setMessage(`Error: ${errorResponse.message}`);
        }
      } catch (error) {
        setMessage(`Error: ${error.message}`);
        console.error('Profile update error:', error);
      }
    } else {
      setMessage('Please update at least one field.');
    }
  };

  const handleDownloadCv = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/cv', {
        method: 'GET',
        headers: {
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Error: ${response.statusText}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my_cv.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CV:', error);
      setMessage('Error downloading CV.');
    }
  };

  const handleDeleteCv = async () => {
    try {
      const response = await fetch('http://localhost:3000/users/cv', {
        method: 'DELETE',
        headers: {
          "X-CSRF-Token": localStorage.getItem("token"),
        },
        credentials: "include",
      });

      if (response.ok) {
        setMessage('CV deleted successfully.');
        setExistingCv(null);
      } else {
        setMessage('Error deleting CV.');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      setMessage('Error deleting CV.');
    }
  };

  return (
    <div className="edit-profile-container">
      <h1>Edit Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Update username"
          />
        </div>
        <div className="form-group">
          <label>Old Password:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter old password"
          />
        </div>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>

        {existingCv ? (
          <div className="cv-section">
            <h3>Your current CV:</h3>
            <button className="download-cv-btn" onClick={handleDownloadCv}>
              Download CV
            </button>
            <button type="button" onClick={handleDeleteCv} className="delete-cv-btn">
              Remove CV
            </button>
            <div className="form-group">
              <label>Update CV:</label>
              <input type="file" onChange={handleCvUpload} accept="application/pdf" />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Upload CV:</label>
            <input type="file" onChange={handleCvUpload} accept="application/pdf" />
          </div>
        )}
        <button type="submit">Update Profile</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EditProfileView;
