import type { Contact, Conversation, ConversationData, ConversationLogType } from "../interface/ConversationModel";
import type { Task } from "../interface/task/TaskModel";
import authService from "./authService";
export const getProjectsList= async ()=>{ 
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const requestBody = {
      database: user.dataBase
    };

    const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
    const endpoint = `${dynamicBaseUrl}/Tasks/GetProjects`; // Make sure this is correct

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch employees list");
    }

    const data= await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching employees list:", error);
    return null
  } 
}
export const getTasksList = async (fromDate: Date|null, toDate: Date|null,activeTab:string): Promise<Task[] | null> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const requestBody = {
      Database: user.dataBase,
      EmployeeID:user.id,
      ActiveTab:activeTab,//received or sent
      FromDate:fromDate?fromDate!.toISOString():null, //
      ToDate:toDate?toDate!.toISOString():null 
    };

    const dynamicBaseUrl = user.urlConnection;
    
    const endpoint = `${dynamicBaseUrl}/Tasks/GetTaskDataAsync`;

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch phone book data');
    }

    const data: Task[] = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching task list:', error);
    return null;
  }
};
export const insertTask = async (task: Task): Promise<number> => {
  try {
     const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    task.organizerID=user.id; // assign the current user ID as the recipientID
    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/InsertTaskAsync`; 
    const requestBody = {
      database: user.dataBase,
      task:task
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to insert task");
    }
const data: number = await response.json();
    return data;
 } 
 catch (error) {
    console.error("Error inserting task:", error);
    return 0;
  }
}
export const updateTask = async (task: Task): Promise<boolean> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/UpdateTaskAsync`; 
    const requestBody = {
      database: user.dataBase,
      updateBy: user.id,
      task:task
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }
const data = await response.json();
if(data===false) throw new Error("Failed to update task");
    return true;
 } 
 catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
}
export const saveCompletedTask = async (taskID: number,isCompleted:boolean,organizerID:number): Promise<boolean> => {
  try {
     const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/UpdateCompletedTaskAsync`; 
    const requestBody = {
      database: user.dataBase,
      taskID: taskID,
      isCompleted:isCompleted,
      IsOrganizerID:organizerID==user.id
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }
const data = await response.json();
if(data===false) throw new Error("Failed to update task");
    return true;
 } 
 catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
}
export const deleteTask = async (taskID: number,functionName:string): Promise<boolean> => {
  try {
     const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/${functionName}`; 
    const requestBody = {
      database: user.dataBase,
      taskID:taskID
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to Delete Task");
    }
const data = await response.json();
if(data===false) throw new Error("Failed to Delete task");
    return true;
 } 
 catch (error) {
    console.error("Error Deleteing task:", error);
    return false;
  }
}
export const getConversationList = async (): Promise<Conversation[]> => {
  try {
    
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

     // const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const requestBody = {
        database: user.dataBase,
        ID: user.id
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Tasks/GetConversationsByEmployeeAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(requestBody),
      });

    if (!response.ok) {
      throw new Error('Failed to fetch phone book data');
    }

    const data: Conversation[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching phone book list:', error);
    return [];
  }
  
};
export const GetConversationsByID = async (TaskID:number): Promise<ConversationData|null> => {
  try {
    
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase,
        ID: TaskID
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Tasks/GetConversationsByIDAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(requestBody),
      });

    if (!response.ok) {
      throw new Error('Failed to fetch conversation data');
    }

    const data: ConversationData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }
}
export const GetConversationLogTypes = async (): Promise<ConversationLogType[]|null> => {
  try {
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Tasks/GetConversationLogTypesAsync`; // Make sure this is correct
      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(user.dataBase),
      });
    if (!response.ok) {
      throw new Error('Failed to fetch conversationLogTypes');
    }
    const conversationLogTypes: ConversationLogType[] = await response.json();
    localStorage.setItem('conversationLogTypes', JSON.stringify(conversationLogTypes));
    return conversationLogTypes;
  } catch (error) {
    console.error('Error fetching conversationLogTypes:', error);
    return null;
  }
} 
export const GetContactsAsync = async (): Promise<Contact[]|null> => {
  try {
const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Tasks/GetContactsAsync`; // Make sure this is correct
      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
       body: JSON.stringify(user.dataBase),
      });
    if (!response.ok) {
      throw new Error('Failed to fetch conversationLogTypes');
    }
    const contacts: Contact[] = await response.json();
    return contacts;
  } catch (error) {
    console.error('Error fetching Contacts:', error);
    return null;
  }
}
export const insertConverstion = async (task: ConversationData): Promise<number> => {
  try {
     const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/InsertConverstionAsync`; 
    const requestBody = {
       conversationData:task,
       updateBy: user.id,
       database: user.dataBase
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to insert task");
    }
const data: number = await response.json();
    return data;
 } 
 catch (error) {
    console.error("Error inserting task:", error);
    return 0;
  }
}
export const updateConverstion = async (task: ConversationData): Promise<boolean> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/UpdateConverstionAsync`; 
    const requestBody = {
      database: user.dataBase,
      updateBy: user.id,
      conversationData:task
    };

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to update contact");
    }
const data = await response.json();
if(data===false) throw new Error("Failed to update task");
    return true;
 } 
 catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
}
