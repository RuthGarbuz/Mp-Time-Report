import type {
  CheckHoursOverlapQuery,
  HourReport,
  HourReportModal,
  HourReportStepsModal,
  Step,
} from "../interface/HourReportModal";
import authService from "./authService";

// API endpoint paths for hour report actions
const HOUR_REPORT_ENDPOINTS = {
  GET_PROJECT_HOUR_REPORT_DATA: "/hourReports/GetProjectHourReportDataAsync",
  GET_FULL_PROJECT_HOUR_REPORT_DATA: "/hourReports/GetFullProjectHourReportDataAsync",
  DELETE_PROJECT_HOUR_REPORT: "/hourReports/DeleteProjectHourReportAsync",
  CHECK_HOURS_OVERLAP: "/hourReports/CheckHoursOverlapAsync",
  GET_HOUR_REPORT_STEPS_MODAL: "/hourReports/GetHourReportStepsModalAsync",
  INSERT_PROJECT_HOUR_REPORT_BASE: "/hourReports", // used with dynamic function name
  GET_HOUR_REPORT_STEPS: "/hourReports/GetHourReportStepsAsync",
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

class HourReportsService {
  async getHourReportProjectData(date: Date): Promise<HourReport[] | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        timeHourFromDate: date,
        employeeID: user.id,
        database: user.dataBase,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        HOUR_REPORT_ENDPOINTS.GET_PROJECT_HOUR_REPORT_DATA
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to get employee data");
      }

      const data: HourReport[] = await response.json();
      return data;
    } catch (error) {
      console.error("Get employee error:", error);
      throw error;
    }
  }

  async getFullHourReportProjectData(id: number): Promise<HourReportModal | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        ID: id,
        database: user.dataBase,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        HOUR_REPORT_ENDPOINTS.GET_FULL_PROJECT_HOUR_REPORT_DATA
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to get employee data");
      }

      const data: HourReportModal = await response.json();
      return data;
    } catch (error) {
      console.error("Get employee error:", error);
      throw error;
    }
  }

  async deleteHourReport(TimeRecordID: number): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        Database: user.dataBase,
        ID: TimeRecordID,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        HOUR_REPORT_ENDPOINTS.DELETE_PROJECT_HOUR_REPORT
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
  }

  async CheckHoursOverlapAsync(hourReportCheck: CheckHoursOverlapQuery): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
        checkHourOverlap: hourReportCheck,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        HOUR_REPORT_ENDPOINTS.CHECK_HOURS_OVERLAP
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to check hours overlap");
      }

      const data = await response.json();
      if (data === false) throw new Error("Failed to check hours overlap");

      return true;
    } catch (error) {
      console.error("Error checking hours overlap:", error);
      return false;
    }
  }
}
export const getHourReportStepsModal = async (
  projectID: number
): Promise<HourReportStepsModal | null> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      projectID: projectID,
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(
      user.urlConnection,
      HOUR_REPORT_ENDPOINTS.GET_HOUR_REPORT_STEPS_MODAL
    );

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch contracts list");
    }

    const data: HourReportStepsModal = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contracts list:", error);
    return null;
  }
};
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
export const insertProjectHourReport = async (
  hourReportModal: HourReportModal,
  functionName: string
): Promise<number | null> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      hourReportModal: hourReportModal,
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(
      user.urlConnection,
      `${HOUR_REPORT_ENDPOINTS.INSERT_PROJECT_HOUR_REPORT_BASE}/${functionName}`
    );

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Steps list");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Steps list:", error);
    return null;
  }
};

export const getStepsList = async (projectID: number): Promise<Step[] | null> => {
  try {
    const user = getAuthenticatedUser();

    const requestBody = {
      projectID: projectID,
      database: user.dataBase,
    };

    const endpoint = buildEndpoint(
      user.urlConnection,
      HOUR_REPORT_ENDPOINTS.GET_HOUR_REPORT_STEPS
    );

    const response = await authService.makeAuthenticatedRequest(
      endpoint,
      buildPostOptions(requestBody)
    );

    if (!response.ok) {
      throw new Error("Failed to fetch Steps list");
    }

    const data: Step[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching Steps list:", error);
    return null;
  }
};

const houreReportService = new HourReportsService();
export default houreReportService;