// services/authService.js
const API_BASE_URL = 'http://localhost:5003/api';


class AuthService {
  // Login user with email and password
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

       
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const data = await response.json();
     
      // Store token and user info
      this.setToken(data.token);
      localStorage.setItem('user', JSON.stringify({
      id: data.id,
      email: data.email,
      username: data.username,
      dataBase: data.dataBase,
      urlConnection: data.urlConnection,
      expiresAt: data.expiration,
      }));
 
      return {
        success: response.ok,
        message: data.message,
        data: data.data,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

    getCurrentEmployee() {
    const employeeStr = localStorage.getItem('employee');
    return employeeStr ? JSON.parse(employeeStr) : null;
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (!token || !user) return false;

    const expiresAt = new Date(user.expiresAt);
    return expiresAt > new Date();
  }

async makeAuthenticatedRequest(url: string | URL | Request, options: RequestInit = {})
 {
    const token = this.getToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: authHeaders,
      });

      if (response.status === 401) {
        this.logout();
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  }
}

export default new AuthService();
