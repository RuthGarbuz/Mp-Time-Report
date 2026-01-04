const API_BASE_URL = 'http://localhost:5003/api'
//const API_BASE_URL = 'https://mpweba.master-plan.co.il/GlobalWebAPI/api'

//const API_BASE_URL = "https://mpwebapp.master-plan.co.il/GlobalWebAPI/api";



class AuthService {
  [x: string]: any;
  // Login user with email and password, rememberMe: boolean
  async login(email: string, password: string,rememberMe: boolean) {
    
    try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        message: error,
      };
    }

    const data = await response.json();

    this.setToken(data.token);

    const userObject = {
      id: data.id,
      email: data.email,
      username: data.username,
      dataBase: data.dataBase,
      urlConnection: data.urlConnection,
      expiresAt: data.expiration,
      seeFinance: data.seeFinance,
      allowAddReport: data.allowAddReport,
      password: password ,
      rememberMe: rememberMe 
    };

    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userObject));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userObject));
      localStorage.removeItem("user");
    }

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
    sessionStorage.removeItem('user');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }
getCurrentUser() {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
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
