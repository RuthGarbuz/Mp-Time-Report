import type { PhoneBook } from "../interface/interfaces";
import authService from "./authService";

export const getPhoneBookList = async (): Promise<PhoneBook[]> => {
  try {
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

     // const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const requestBody = {
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/phoneBook/GetPhonBookDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(requestBody),
      });

    if (!response.ok) {
      throw new Error('Failed to fetch phone book data');
    }

    const data: PhoneBook[] = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error fetching phone book list:', error);
    return [];
  }
};