import type { ManagerIntake, Office } from "../interface/ManagerAnalisesModel";
import authService from "./authService";

export const getOfficeList = async (): Promise<Office[]> => {
  try {
    
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

     // const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const requestBody = {
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/ManagerData/GetOfficeDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(requestBody),
      });

    if (!response.ok) {
      throw new Error('Failed to fetch phone book data');
    }

    const data: Office[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching office list:', error);
    return [];
  }
  
};
export const getManagerModelData = async (officeId: number,functionName: string): Promise<ManagerIntake | null> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const requestBody = {
      database: user.dataBase,
      officeId: officeId
    };

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/ManagerData/${functionName}`;

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch intake data');
    }
    const data = await response.json();
    return data;
  } 
  catch (error) {
    console.error('Error fetching intake data:', error);
    return null;
  }
};



