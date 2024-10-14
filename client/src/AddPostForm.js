import React, { useState, useEffect } from 'react';
import './AddPostForm.css';
import uploadFileIcon from './upload_file.png';
const AddPostForm = () => {
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
    console.log(languages);
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
    console.log('Token used for fetch:', token);

    if (!token) {
      alert('Token is missing. Please log in again.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/job-posts', {
        method: 'POST',
        headers: {
          
          "X-CSRF-Token": token
        },
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        throw new Error(error.message);
      }

      const data = await response.json();
      console.log('Dodano nowe ogłoszenie:', data);
      alert('Nowe ogłoszenie zostało dodane');
      setCompanyName('');
      setTitle('');
      setSalary('');
      setDescription('');
      setLocation('');
      setContractType('');
      setLevel('');
      setLanguages([]);
      setLogo(null);
    } catch (error) {
      console.error('Błąd podczas dodawania ogłoszenia:', error);
      alert('Wystąpił błąd podczas dodawania ogłoszenia');
    }
  };

  return (
    <div className="add-post-form">
      <h1>Add a Job Advertisement</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input type="number" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} required />
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
    {logo ? <p>{logo.name}</p> : <p>Upload company logo</p>}
    <input 
      id="logoUpload" 
      type="file"
      name="logo-file" 
      onChange={handleLogoChange} 
      required 
      className="file-input"
    />
  </label>

         <div className="file-text-logo">
          <p>Upload a file with your company logo in PNG, JPG or SVG format.</p>
          </div>
        </div>
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
        <select value={contractType} onChange={(e) => setContractType(e.target.value)} required>
          <option value="">Select contract type</option>
          {contractTypes.map(type => (
            <option key={type.id} value={type.type}>{type.type}</option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} required>
          <option value="">Select a level</option>
          {levels.map(level => (
            <option key={level.id} value={level.level}>{level.level}</option>
          ))}
        </select>
        <div className="languages-checkboxes">
          <label>Choose programming languages:</label>
          {languageOptions.map(language => (
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
        <button type="submit">Add job advertisement</button>
      </form>
    </div>
  );
};

export default AddPostForm;
