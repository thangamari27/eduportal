const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  phone_no: string;
  password: string;
}

interface User {
  id: string;
  student_id: string;
  email: string;
  phone_no: string;
  role?: 'student';
  token?: string;
}

interface Admin {
  id: string;
  email: string;
  role?: 'admin';
  token?: string;
}

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> ?? {}),
      };
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Try parse JSON
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const errorMessage =
          data?.error || data?.message || response.statusText || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API request failed for endpoint:', endpoint, error);
      if (error instanceof Error) throw error;
      throw new Error('Network error occurred');
    }
  }

  private getAuthHeader(): { Authorization: string } | {} {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // 🔑 Login (user or admin)
  async login(
    loginData: LoginData,
    userType: 'user' | 'admin' = 'user'
  ): Promise<{ user: User | Admin; token: string; userType: 'user' | 'admin' }> {
    const endpoint = userType === 'admin' ? '/users/admin/login' : '/users/login';

    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (data?.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', userType);

      const userData = data.user || data.admin;
      localStorage.setItem('user', JSON.stringify(userData));
    }

    return {
      user: data.user || data.admin,
      token: data.token,
      userType,
    };
  }

  // 🧠 Smart login: tries user → admin
  async smartLogin(
    loginData: LoginData
  ): Promise<{ user: User | Admin; token: string; userType: 'user' | 'admin' }> {
    try {
      return await this.login(loginData, 'user');
    } catch {
      return await this.login(loginData, 'admin');
    }
  }

  async adminLogin(loginData: LoginData): Promise<{ admin: Admin; token: string }> {
    const data = await this.request('/users/admin/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    if (data?.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('user', JSON.stringify(data.admin));
    }

    return data;
  }

  // 📝 Register (user only)
  async register(registerData: RegisterData): Promise<{ user: User; token: string }> {
    const data = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });

    if (data?.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userType', 'user');
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  // 👤 Profile
  async getProfile(): Promise<User | Admin> {
    const userType = localStorage.getItem('userType');
    const endpoint = userType === 'admin' ? '/admin/profile' : '/users/profile';

    return this.request(endpoint, {
      method: 'GET',
      headers: this.getAuthHeader(),
    });
  }

  // 📄 Personal info
  async savePersonalInfo(personalData: any) {
    return this.request('/users/personal-info', {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personalData),
    });
  }

  // 🎓 Academic info (accept JSON or FormData)
  async saveAcademicInfo(academicData: any) {
    const isFormData = academicData instanceof FormData;

    return this.request('/users/academic-info', {
      method: 'POST',
      headers: isFormData ? this.getAuthHeader() : { ...this.getAuthHeader(), 'Content-Type': 'application/json' },
      body: isFormData ? academicData : JSON.stringify(academicData),
    });
  }

  // ➕ Extra info
  async saveExtraInfo(extraData: any) {
    return this.request('/users/extra-info', {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(extraData),
    });
  }

  // 🚪 Logout
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }

  getCurrentUserType(): 'user' | 'admin' | null {
    return localStorage.getItem('userType') as 'user' | 'admin' | null;
  }

  getStoredUser(): (User | Admin) | null {
    const userStr = localStorage.getItem('user');
    const userType = this.getCurrentUserType();

    if (userStr && userType) {
      const userData = JSON.parse(userStr);
      return { ...userData, role: userType === 'admin' ? 'admin' : 'student' };
    }
    return null;
  }
}

export const apiService = new ApiService();
