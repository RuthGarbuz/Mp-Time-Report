import type { Company, PhoneBook, PhoneBookCompany } from "../interface/PhoneBookModel";
import authService from "./authService";
export const getPhoneBookCompanyList = async (): Promise<PhoneBookCompany | null> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const requestBody = {
      database: user.dataBase
    };

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/PhoneBook/GetPhoneBookDataAsync`;

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch phone book data');
    }

    const data: PhoneBookCompany = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching phone book list:', error);
    return null;
  }
};
export const getPhoneBookList = async (): Promise<PhoneBook[]> => {
  try {
    
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

     // const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const requestBody = {
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/phoneBook/GetPhoneBookDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(requestBody),
      });

    if (!response.ok) {
      throw new Error('Failed to fetch phone book data');
    }

    const data: PhoneBook[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching phone book list:', error);
    return [];
  }
  
};
//updatePhoneBookContact
export const updatePhoneBookContact = async (contact: PhoneBook): Promise<boolean> => {
  try {
     const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/phoneBook/UpdatePhoneBookContact`; 
    const requestBody = {
      database: user.dataBase,
      id: contact.id, 
      firstName: contact.firstName,
      lastName: contact.lastName,
      contactCell: contact.mobile,
      email: contact.email,
      companyID: contact.selectedCompanyId
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }
const data = await response.json();
if(data===false) throw new Error("Failed to update contact");
    return true;
 } 
 catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
}

export const addPhoneBookContact = async (contact: PhoneBook): Promise<number> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/phoneBook/AddPhoneBookContact`; 
    // <-- make sure this matches your backend route

    const requestBody = {
      database: user.dataBase,
      firstName: contact.firstName,
      lastName: contact.lastName,
      contactCell: contact.mobile,
      email: contact.email,
      companyID: contact.selectedCompanyId
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to save contact");
    }
const data: number = await response.json();
    return data
  } catch (error) {
    console.error("Error adding phone book contact:", error);
    return 0;
  }
};
export const addCompany = async (company: Company): Promise<number> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/phoneBook/AddCompany`; 
    // <-- make sure this matches your backend route

    const requestBody = {
      database: user.dataBase,
      Name: company.name,
      address: company.address,
      cityID: company.cityID, // Assuming address is a string that includes city
      phoneNum: company.phoneNum

    };
    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to save company");
    }
const data: number = await response.json();
    return data
  } catch (error) {
    console.error("Error adding phone book company:", error);
    return 0;
  }
};
export const updateCompany = async (company: Company): Promise<number> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/phoneBook/UpdateCompany`; 
    // <-- make sure this matches your backend route

    const requestBody = {
      database: user.dataBase,
      id:company.id,
      name: company.name,
      address: company.address,
      cityID: company.cityID, 
      phoneNum: company.phoneNum
    };
    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to save company");
    }
const data: number = await response.json();
    return data
  } catch (error) {
    console.error("Error update phone book company:", error);
    return 0;
  }
};
