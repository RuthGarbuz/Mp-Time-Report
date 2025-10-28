import type { HourReport, HourReportModal, HourReportStepsModal, Step } from "../interface/interfaces";
import authService from "./authService";

class HourReportsService{
async getHourReportProjectData(date:Date):Promise<HourReport[] | null>{
  try{
      const user = authService.getCurrentUser();
          if (!user) throw new Error('User not authenticated');
    
     const requestBody = {
        timeHourFromDate: date,
        employeeID: user.id,
        database: user.dataBase,
      };
const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/hourReports/GetProjectHourReportDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data: HourReport[] = await response.json();
      
      //const timeRepordData: TimeRecord[] = JSON.parse(data);
      return data
      //   return {
      //   success: true,
      //   message: 'Employee fetched successfully',
      //   data: data,
      // };
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  }


 async getFullHourReportProjectData(id:number):Promise<HourReport | null>
{ 
  try{
 const user = authService.getCurrentUser();
          if (!user) throw new Error('User not authenticated');
     const requestBody = {
        HourReportID: id,
        database: user.dataBase,
      };
const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/hourReports/GetFullProjectHourReportDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data: HourReport = await response.json();
     
      //const timeRepordData: TimeRecord[] = JSON.parse(data);
      return data
      //   return {
      //   success: true,
      //   message: 'Employee fetched successfully',
      //   data: data,
      // };
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  
}


}
export const getHourReportStepsModal= async (projectID:number)=>{ 
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const requestBody = {
      projectID:projectID,
      database: user.dataBase
    };

    const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
    const endpoint = `${dynamicBaseUrl}/hourReports/GetHourReportStepsModalAsync`; // Make sure this is correct

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch contracts list");
    }

    const data:HourReportStepsModal= await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contracts list:", error);
    return null
  } 
}
// export const getSubContractsList= async (projectID:number)=>{ 
//   try {
//     const user = authService.getCurrentUser();
//     if (!user) throw new Error("User not authenticated");
//     const requestBody = {
//       projectID:projectID,
//       database: user.dataBase
//     };

//     const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
//     const endpoint = `${dynamicBaseUrl}/hourReports/GetSubContracts`; // Make sure this is correct

//     const response = await authService.makeAuthenticatedRequest(endpoint, {
//       method: "POST",
//       body: JSON.stringify(requestBody),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to fetch subContracts list");
//     }

//     const data:SubContract[]= await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching subContracts list:", error);
//     return null
//   } 
// }
export const insertProjectHourReport= async (hourReportModal:HourReportModal):Promise<number|null>=>{  
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const requestBody = {
      hourReportModal:hourReportModal,
      database: user.dataBase
    };

    const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
    const endpoint = `${dynamicBaseUrl}/hourReports/InsertProjectHourReportAsync`; // Make sure this is correct

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Steps list");
    }

    const data= await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Steps list:", error);
    return null
  } 
  return 0;
}
export const getStepsList= async (projectID:number)=>{ 
  try {
    const user = authService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const requestBody = {
      projectID:projectID,
      database: user.dataBase
    };

    const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
    const endpoint = `${dynamicBaseUrl}/hourReports/GetHourReportStepsAsync`; // Make sure this is correct

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Steps list");
    }

    const data:Step[]= await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Steps list:", error);
    return null
  } 
}
const houreReportService = new HourReportsService();
export default houreReportService;