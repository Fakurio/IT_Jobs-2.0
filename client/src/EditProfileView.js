import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfileView.css';

const EditProfileView = () => {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleCvUpload = (e) => {
    setCvFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', username);
    formData.append('oldPassword', oldPassword);
    formData.append('newPassword', newPassword);
    if (cvFile) {
      formData.append('cv', cvFile);
    }

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
        navigate('/main');
      } else {
        const errorResponse = await response.json();
        setMessage(`Error: ${errorResponse.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Profile update error:', error);
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
            required
          />
        </div>
        <div className="form-group">
          <label>Old Password:</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Upload CV:</label>
          <input type="file" onChange={handleCvUpload} accept="application/pdf" />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default EditProfileView;
