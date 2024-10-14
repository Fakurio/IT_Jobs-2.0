import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ListView.css';

const ListView = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [languages, setLanguages] = useState([]);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:3000/job-posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('http://localhost:3000/job-posts/languages');
        const data = await response.json();
        setLanguages(data);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleCardClick = (id) => {
    navigate(`/job-post/${id}`);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = filter ? post.languages.some(lang => lang.language === filter) : true;
    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="list-view-container">
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <select value={filter} onChange={handleFilterChange} className="filter-select">
          <option value="">All Languages</option>
          {languages.map(lang => (
            <option key={lang.id} value={lang.language}>{lang.language}</option>
          ))}
        </select>
      </div>

      <h1>Job Posts</h1>
      <ul>
        {filteredPosts.map(post => (
          <li key={post.id} className="job-card" onClick={() => handleCardClick(post.id)}>
            <div className="job-card-header">
              <div className="company-logo"><img src={`http://localhost:3000/logo/${post.logo}`} alt="Company Logo" /></div>
              <div className="job-title">{post.title}</div>
              <div className="job-salary">${post.salary}</div>
            </div>
            <div className="job-details">
              <div className="job-type">{post.type}</div>
              <div className="job-poster">Posted by: {post.companyName}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListView;
