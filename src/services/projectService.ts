import type { ContactsToInsert, InsertProjectRequest, ProjectDetails, ProjectModel } from "../interface/project";
import authService from "./authService";
const projectService = {
  async getProjectsModelList(): Promise<ProjectModel[] | null> {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase,
        //isActive: true
      };

      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/Project/GetProjectsAsync`;

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects list');
      }

      const data: ProjectModel[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching projects list:', error);
      return null;
    }
  },
  async getProjectByID(ID: number): Promise<ProjectDetails | null> {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase,
        projectID: ID
      };

      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/Project/GetProjectByIdAsync`;

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects ');
      }

      const data: ProjectDetails = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching projects :', error);
      return null;
    }
  },
  async insertUpdateProject(project: InsertProjectRequest, func: string): Promise<number | null> {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase,
        ...project
      };

      const endpoint = `${user.urlConnection}/Project/${func}`;

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to insert project');
      }

      const projectId: number = await response.json();
      return projectId;
    } catch (error) {
      console.error('Error inserting project:', error);
      return null;
    }
  },
  async inserProjectContacts(contacts: ContactsToInsert[]): Promise<boolean> {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase,
        contactsToInsert: contacts
      };

      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/Project/InsertProjectContactAsync`;

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects ');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching projects :', error);
      return false;
    }
  },

  async deleteProjectContacts(contactID: number, projectID: number): Promise<boolean> {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase,
        contactID: contactID,
        projectID: projectID
      };

      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/Project/DeleteProjectContactsAsync`;

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to delete project contacts');
      }

      return true;
    } catch (error) {
      console.error('Error deleting project contacts:', error);
      return false;
    }
  },
  //   async getProject(id: number): Promise<ProjectModel> {
  //     const response = await api.get(`/projects/${id}`);
  //     return response.data;
  //   },

  //   async createProject(project: ProjectModel): Promise<ProjectModel> {
  //     const response = await api.post('/projects', project);
  //     return response.data;
  //   },

  //   async updateProject(project: ProjectModel): Promise<ProjectModel> {
  //     const response = await api.put(`/projects/${project.projectID}`, project);
  //     return response.data;
  //   },


};

export default projectService;



