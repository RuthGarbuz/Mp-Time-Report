import type { Task } from "../interface/interfaces";
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
    console.log("Employees list data:", data);
  } catch (error) {
    console.error("Error fetching employees list:", error);
    return null
  } 
}
export const getTasksList = async (fromDate: Date, toDate: Date,activeTab:string): Promise<Task[] | null> => {
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');
    const requestBody = {
      Database: user.dataBase,
      EmployeeID:user.id,
      ActiveTab:activeTab,//received or sent
      FromDate:fromDate.toISOString(), //
      ToDate:toDate.toISOString() 
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
    console.log('TasksList:', data);

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
console.log("task inserted successfully:", data);
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
console.log("Contact updated successfully:", data);
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
console.log("Contact updated successfully:", data);
    return true;
 } 
 catch (error) {
    console.error("Error uppdating phone book contact:", error);
    return false;
  }
}
export const deleteTask = async (taskID: number): Promise<boolean> => {
  try {
     const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/Tasks/DeleteTaskAsync`; 
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
console.log("task Deleted successfully:", data);
    return true;
 } 
 catch (error) {
    console.error("Error Deleteing task:", error);
    return false;
  }
}
