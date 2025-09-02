import React, { useState } from 'react';
import authService from '../services/authService';

type LoginProps = {
  onLoginSuccess?: (response: any) => void;
};

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' ,rememberMe: false});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password,formData.rememberMe);
      // Call parent callback to update app state,formData.rememberMe
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    }  catch (error: unknown) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError('An unknown error occurred');
  }
  } 
  // finally {
  //   setLoading(false); // לא חובה, אבל מומלץ
  // }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">email:</label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
