import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    if (!email) {
      alert("Email wymagany");
    } else if (!password) {
      alert("Hasło wymagane");
    } else {
      try {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message);
        }

        const data = await response.json();
        console.log("Full response data:", data);

        localStorage.setItem('token', response.headers.get("x-csrf-token"));
        localStorage.setItem('user', JSON.stringify(data));

        alert('Zalogowano');
        e.target.email.value = "";
        e.target.password.value = "";
        navigate('/main');
      } catch (error) {
        alert('Błąd logowania: ' + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <h1>Sign In.</h1>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="E-mail" required />
        <input type="password" name="password" placeholder="Password" required />
        <button type="submit">Sign In.</button>
      </form>
      <p>don't have an account? <Link to="/register">Create a account</Link></p>
    </div>
  );
}

export default Login;
