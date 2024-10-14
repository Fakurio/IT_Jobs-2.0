import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^\S+@\S+\.\S+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!email) {
      alert("Email wymagany");
    } else if (username.trim().length === 0) {
      alert("Nazwa użytkownika nie może zawierać samych spacji");
    } else if (!emailRegex.test(email)) {
      alert("Wymagany prawidłowy email");
    } else if (!password) {
      alert("Hasło wymagane");
    } else if (!passwordRegex.test(password)) {
      alert("Hasło musi zawierać co najmniej 8 znaków, w tym jedną dużą literę, jedną małą literę, jedną cyfrę i jeden znak specjalny");
    } else {
      try {
        let response = await fetch('http://localhost:3000/auth/register', {
          method: "POST",
          headers: {
            "Content-Type": 'application/json'
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
          })
        });
        const data = await response.json();
        alert('Rejestracja zakończona sukcesem');
        setEmail('');
        setPassword('');
        navigate('/login');
      } catch (error) {
        console.error('Błąd rejestracji:', error.message);
        alert('Błąd rejestracji: ' + error.message);
      }
    }
  };

  return (
    <div className="register-container">
      <h1>Registration</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
        />
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Register</button>
      </form>
      <p>are you already registered? <Link to="/login">Sign in</Link></p>
    </div>
  );
}

export default Register;
