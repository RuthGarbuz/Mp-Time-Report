import type { Company, PhoneBook, PhoneBookCompany } from "../interface/PhoneBookModel";
import authService from "./authService";

// API endpoint paths
const API_ENDPOINTS = {
  GET_PHONE_BOOK_COMPANY_DATA: "/PhoneBook/GetPhoneBookDataAsync",
  GET_PHONE_BOOK_DATA: "/phoneBook/GetPhoneBookDataAsync",
  UPDATE_CONTACT: "/phoneBook/UpdatePhoneBookContact",
  ADD_CONTACT: "/phoneBook/AddPhoneBookContact",
  ADD_COMPANY: "/phoneBook/AddCompany",
  UPDATE_COMPANY: "/phoneBook/UpdateCompany",
} as const;

// Helpers
const getAuthenticatedUser = () => {
  const user = authService.getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
};

const buildEndpoint = (baseUrl: string, path: string): string => {
  return `${baseUrl}${path}`;
};

const buildRequestOptions = (requestBody: Record<string, unknown>) => ({
  method: "POST" as const,
  body: JSON.stringify(requestBody),
});

const handleApiResponse = async <T>(response: Response, errorMessage: string): Promise<T> => {
  if (!response.ok) {
    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
};

export const getPhoneBookCompanyList = async (): Promise<PhoneBookCompany | null> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(
      user.urlConnection,
      API_ENDPOINTS.GET_PHONE_BOOK_COMPANY_DATA
    );

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildRequestOptions(requestBody)
    );

    return await handleApiResponse<PhoneBookCompany>(
      response,
      "Failed to fetch phone book data"
    );
  } catch (error) {
    console.error("Error fetching phone book list:", error);
    return null;
  }
};

export const getPhoneBookList = async (): Promise<PhoneBook[]> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(user.urlConnection, API_ENDPOINTS.GET_PHONE_BOOK_DATA);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildRequestOptions(requestBody)
    );

    return await handleApiResponse<PhoneBook[]>(
      response,
      "Failed to fetch phone book data"
    );
  } catch (error) {
    console.error("Error fetching phone book list:", error);
    return [];
  }
};

export const updatePhoneBookContact = async (contact: PhoneBook): Promise<boolean> => {
  try {
    const user = getAuthenticatedUser();

    const endpoint = buildEndpoint(user.urlConnection, API_ENDPOINTS.UPDATE_CONTACT);

    const requestBody = {
      database: user.dataBase,
      id: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      contactCell: contact.mobile,
      email: contact.email,
      companyID: contact.selectedCompanyId,
    };

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildRequestOptions(requestBody)
    );

    const data = await handleApiResponse<boolean>(response, "Failed to update contact");

    if (data === false) {
      throw new Error("Failed to update contact");
    }

    return true;
  } catch (error) {
    console.error("Error updating phone book contact:", error);
    return false;
  }
};

export const addPhoneBookContact = async (contact: PhoneBook): Promise<number> => {
  try {
    const user = getAuthenticatedUser();

    const endpoint = buildEndpoint(user.urlConnection, API_ENDPOINTS.ADD_CONTACT);

    const requestBody = {
      database: user.dataBase,
      firstName: contact.firstName,
      lastName: contact.lastName,
      contactCell: contact.mobile,
      email: contact.email,
      companyID: contact.selectedCompanyId,
    };

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildRequestOptions(requestBody)
    );

    return await handleApiResponse<number>(response, "Failed to save contact");
  } catch (error) {
    console.error("Error adding phone book contact:", error);
    return 0;
  }
};

export const addCompany = async (company: Company): Promise<number> => {
  try {
    const user = getAuthenticatedUser();

    const endpoint = buildEndpoint(user.urlConnection, API_ENDPOINTS.ADD_COMPANY);

    const requestBody = {
      database: user.dataBase,
      Name: company.name,
      address: company.address,
      cityID: company.cityID,
      phoneNum: company.phoneNum,
    };

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildRequestOptions(requestBody)
    );

    return await handleApiResponse<number>(response, "Failed to save company");
  } catch (error) {
    console.error("Error adding phone book company:", error);
    return 0;
  }
};

export const updateCompany = async (company: Company): Promise<number> => {
  try {
    const user = getAuthenticatedUser();

    const endpoint = buildEndpoint(user.urlConnection, API_ENDPOINTS.UPDATE_COMPANY);

    const requestBody = {
      database: user.dataBase,
      id: company.id,
      name: company.name,
      address: company.address,
      cityID: company.cityID,
      phoneNum: company.phoneNum,
    };

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildRequestOptions(requestBody)
    );

    return await handleApiResponse<number>(response, "Failed to save company");
  } catch (error) {
    console.error("Error updating phone book company:", error);
    return 0;
  }
};
