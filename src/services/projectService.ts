import type {
  ContactsToInsert,
  InsertProjectRequest,
  ProjectDetails,
  ProjectModel,
} from "../interface/projectModel";
import authService from "./authService";

// API endpoint paths for project-related actions
const PROJECT_ENDPOINTS = {
  GET_PROJECTS: "/Project/GetProjectsAsync",
  GET_PROJECT_BY_ID: "/Project/GetProjectByIdAsync",
  INSERT_OR_UPDATE_PROJECT_BASE: "/Project", // used with dynamic function name
  INSERT_PROJECT_CONTACTS: "/Project/InsertProjectContactAsync",
  DELETE_PROJECT_CONTACTS: "/Project/DeleteProjectContactsAsync",
} as const;

// Helpers
const getAuthenticatedUser = () => {
  const user = authService.getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
};

const buildEndpoint = (baseUrl: string, path: string): string => `${baseUrl}${path}`;

const buildPostOptions = (body: unknown) => ({
  method: "POST" as const,
  body: JSON.stringify(body),
});

const projectService = {
  async getProjectsModelList(): Promise<ProjectModel[] | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
        // isActive: true
      };

      const endpoint = buildEndpoint(user.urlConnection, PROJECT_ENDPOINTS.GET_PROJECTS);

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects list");
      }

      const data: ProjectModel[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching projects list:", error);
      return null;
    }
  },

  async getProjectByID(ID: number): Promise<ProjectDetails | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
        projectID: ID,
      };

      const endpoint = buildEndpoint(user.urlConnection, PROJECT_ENDPOINTS.GET_PROJECT_BY_ID);

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects ");
      }

      const data: ProjectDetails = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching projects :", error);
      return null;
    }
  },

  async insertUpdateProject(
    project: InsertProjectRequest,
    func: string
  ): Promise<number | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
        ...project,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        `${PROJECT_ENDPOINTS.INSERT_OR_UPDATE_PROJECT_BASE}/${func}`
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to insert project");
      }

      const projectId: number = await response.json();
      return projectId;
    } catch (error) {
      console.error("Error inserting project:", error);
      return null;
    }
  },

  async inserProjectContacts(contacts: ContactsToInsert[]): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
        contactsToInsert: contacts,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        PROJECT_ENDPOINTS.INSERT_PROJECT_CONTACTS
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to fetch projects ");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching projects :", error);
      return false;
    }
  },

  async deleteProjectContacts(contactID: number, projectID: number): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
        contactID: contactID,
        projectID: projectID,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        PROJECT_ENDPOINTS.DELETE_PROJECT_CONTACTS
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to delete project contacts");
      }

      return true;
    } catch (error) {
      console.error("Error deleting project contacts:", error);
      return false;
    }
  },
};

export default projectService;



