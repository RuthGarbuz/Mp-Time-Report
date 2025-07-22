// userApi.js

import { API_BASE_URL } from "../vite-env";

//  import { API_BASE_URL } from "../config";


export async function loginUser(email: any, password: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return { success: false, message: 'Invalid credentials' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    throw error;
  }
}
