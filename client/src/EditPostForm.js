import React, { useState, useEffect } from 'react';
import './AddPostForm.css';
import uploadFileIcon from './upload_file.png';
import { useParams, useNavigate } from 'react-router-dom';

const EditPostForm = () => {
  const { id } = useParams();
  const [companyName, setCompanyName] = useState('');
  const [title, setTitle] = useState('');
  const [salary, setSalary] = useState('');
  const [logo, setLogo] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [contractType, setContractType] = useState('');
  const [level, setLevel] = useState('');
  const [languages, setLanguages] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [languageOptions, setLanguageOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/job-posts/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': localStorage.getItem('token')
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch post details');
        }

        const data = await response.json();
        setCompanyName(data.companyName);
        setTitle(data.title);
        setSalary(data.salary);
        setDescription(data.description);
        setLocation(data.location);
        setContractType(data.contractType.type);
        setLevel(data.level.level);
        setLanguages(data.languages.map(lang => lang.language));
      } catch (error) {
        console.error('Error fetching post details:', error);
      }
    };

    fetchPostDetails();
  }, [id]);

  useEffect(() => {
    const fetchContractTypes = async () => {
      const response = await fetch('http://localhost:3000/job-posts/contract-types');
      const data = await response.json();
      setContractTypes(data);
    };

    const fetchLevels = async () => {
      const response = await fetch('http://localhost:3000/job-posts/levels');
      const data = await response.json();
      setLevels(data);
    };

    const fetchLanguages = async () => {
      const response = await fetch('http://localhost:3000/job-posts/languages');
      const data = await response.json();
      setLanguageOptions(data);
    };

    fetchContractTypes();
    fetchLevels();
    fetchLanguages();
  }, []);

  const handleLanguageChange = (language) => {
    setLanguages((prevLanguages) =>
      prevLanguages.includes(language)
        ? prevLanguages.filter((l) => l !== language)
        : [...prevLanguages, language]
    );
  };

  const handleLogoChange = (e) => {
    setLogo(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setLogo(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('title', title);
    formData.append('salary', salary);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('contractType', contractType);
    formData.append('level', level);
    formData.append('languages', languages.join(","));
    if (logo) {
      formData.append('logo', logo);
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Token is missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/job-posts/${id}`, {
        method: 'PUT',
        headers: {
          'X-CSRF-Token': token
        },
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('Post updated successfully!');
      navigate('/my-posts');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update the post');
    }
  };

  return (
    <div className="add-post-form">
      <h1>Edit Job Advertisement</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          required
        />
        <div className="file-input-container">
          <label
            htmlFor="logoUpload"
            className="file-input-label"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <img 
              src={uploadFileIcon} 
              alt="Upload icon" 
              width="54" 
              height="44" 
            />
            {logo ? <p>{logo.name}</p> : <p>Upload new company logo (optional)</p>}
            <input
              id="logoUpload"
              type="file"
              onChange={handleLogoChange}
              className="file-input"
            />
          </label>
          <div className="file-text-logo">
            <p>Upload a file with your company logo in PNG, JPG or SVG format.</p>
          </div>
        </div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <select
          value={contractType}
          onChange={(e) => setContractType(e.target.value)}
          required
        >
          <option value="">Select contract type</option>
          {contractTypes.map((type) => (
            <option key={type.id} value={type.type}>
              {type.type}
            </option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          required
        >
          <option value="">Select a level</option>
          {levels.map((level) => (
            <option key={level.id} value={level.level}>
              {level.level}
            </option>
          ))}
        </select>
        <div className="languages-checkboxes">
          <label>Choose programming languages:</label>
          {languageOptions.map((language) => (
            <div key={language.id}>
              <input
                type="checkbox"
                value={language.language}
                checked={languages.includes(language.language)}
                onChange={() => handleLanguageChange(language.language)}
              />
              {language.language}
            </div>
          ))}
        </div>
        <button type="submit">Update job advertisement</button>
      </form>
    </div>
  );
};

export default EditPostForm;
