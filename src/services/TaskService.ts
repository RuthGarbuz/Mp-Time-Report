import type {
  Contact,
  Conversation,
  ConversationData,
  ConversationLogType,
} from "../interface/ConversationModel";
import type { Task } from "../pages/tasks/models/task.model";
import authService from "./authService";

// API endpoint paths for task- and conversation-related actions
const TASK_ENDPOINTS = {
  GET_PROJECTS: "/Tasks/GetProjects",
  GET_TASKS: "/Tasks/GetTaskDataAsync",
  INSERT_TASK: "/Tasks/InsertTaskAsync",
  UPDATE_TASK: "/Tasks/UpdateTaskAsync",
  UPDATE_COMPLETED_TASK: "/Tasks/UpdateCompletedTaskAsync",
  DELETE_TASK_BASE: "/Tasks", // used with dynamic function name
  GET_CONVERSATIONS_BY_EMPLOYEE: "/Tasks/GetConversationsByEmployeeAsync",
  GET_CONVERSATIONS_BY_ID: "/Tasks/GetConversationsByIDAsync",
  GET_CONVERSATION_LOG_TYPES: "/Tasks/GetConversationLogTypesAsync",
  GET_CONTACTS: "/Tasks/GetContactsAsync",
  INSERT_CONVERSATION: "/Tasks/InsertConverstionAsync",
  UPDATE_CONVERSATION: "/Tasks/UpdateConverstionAsync",
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

export const getProjectsList = async () => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.GET_PROJECTS);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch employees list");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching employees list:", error);
    return null;
  }
};

export const getTasksList = async (
  fromDate: Date | null,
  toDate: Date | null,
  activeTab: string
): Promise<Task[] | null> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      Database: user.dataBase,
      EmployeeID: user.id,
      ActiveTab: activeTab,
      FromDate: fromDate ? fromDate.toISOString() : null,
      ToDate: toDate ? toDate.toISOString() : null,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.GET_TASKS);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch phone book data");
    }

    const data: Task[] = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching task list:", error);
    return null;
  }
};

export const insertTask = async (task: Task): Promise<number> => {
  try {
    const user = getAuthenticatedUser();

    task.organizerID = user.id; // assign the current user ID as the recipientID

    const requestBody = {
      database: user.dataBase,
      task: task,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.INSERT_TASK);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to insert task");
    }

    const data: number = await response.json();
    return data;
  } catch (error) {
    console.error("Error inserting task:", error);
    return 0;
  }
};

export const updateTask = async (task: Task): Promise<boolean> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
      updateBy: user.id,
      task: task,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.UPDATE_TASK);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }

    const data = await response.json();
    if (data === false) throw new Error("Failed to update task");

    return true;
  } catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
};

export const saveCompletedTask = async (
  taskID: number,
  isCompleted: boolean,
  organizerID: number
): Promise<boolean> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
      taskID: taskID,
      isCompleted: isCompleted,
      IsOrganizerID: organizerID == user.id,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.UPDATE_COMPLETED_TASK);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }

    const data = await response.json();
    if (data === false) throw new Error("Failed to update task");

    return true;
  } catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
};

export const deleteTask = async (taskID: number, functionName: string): Promise<boolean> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
      taskID: taskID,
    };

    const endpoint = buildEndpoint(
      user.urlConnection,
      `${TASK_ENDPOINTS.DELETE_TASK_BASE}/${functionName}`
    );

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to Delete Task");
    }

    const data = await response.json();
    if (data === false) throw new Error("Failed to Delete task");

    return true;
  } catch (error) {
    console.error("Error Deleteing task:", error);
    return false;
  }
};

export const getConversationList = async (): Promise<Conversation[]> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
      ID: user.id,
    };

    const endpoint = buildEndpoint(
      user.urlConnection,
      TASK_ENDPOINTS.GET_CONVERSATIONS_BY_EMPLOYEE
    );

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch phone book data");
    }

    const data: Conversation[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching phone book list:", error);
    return [];
  }
};

export const GetConversationsByID = async (
  TaskID: number
): Promise<ConversationData | null> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
      ID: TaskID,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.GET_CONVERSATIONS_BY_ID);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversation data");
    }

    const data: ConversationData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
};

export const GetConversationLogTypes = async (): Promise<ConversationLogType[] | null> => {
  try {
    const user = getAuthenticatedUser();

    const endpoint = buildEndpoint(
      user.urlConnection,
      TASK_ENDPOINTS.GET_CONVERSATION_LOG_TYPES
    );

    // Preserve existing behavior: post the raw database value as the body
    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(user.dataBase)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversationLogTypes");
    }

    const conversationLogTypes: ConversationLogType[] = await response.json();
    localStorage.setItem("conversationLogTypes", JSON.stringify(conversationLogTypes));
    return conversationLogTypes;
  } catch (error) {
    console.error("Error fetching conversationLogTypes:", error);
    return null;
  }
};

export const GetContactsAsync = async (): Promise<Contact[] | null> => {
  try {
    const user = getAuthenticatedUser();

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.GET_CONTACTS);

    // Preserve existing behavior: post the raw database value as the body
    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(user.dataBase)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversationLogTypes");
    }

    const contacts: Contact[] = await response.json();
    return contacts;
  } catch (error) {
    console.error("Error fetching Contacts:", error);
    return null;
  }
};

export const insertConverstion = async (task: ConversationData): Promise<number> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      conversationData: task,
      updateBy: user.id,
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.INSERT_CONVERSATION);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to insert task");
    }

    const data: number = await response.json();
    return data;
  } catch (error) {
    console.error("Error inserting task:", error);
    return 0;
  }
};

export const updateConverstion = async (task: ConversationData): Promise<boolean> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      database: user.dataBase,
      updateBy: user.id,
      conversationData: task,
    };

    const endpoint = buildEndpoint(user.urlConnection, TASK_ENDPOINTS.UPDATE_CONVERSATION);

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }

    const data = await response.json();
    if (data === false) throw new Error("Failed to update task");

    return true;
  } catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
};
