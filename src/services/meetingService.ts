import type {
  CalendarDataModal,
  CalendarEventDto,
  CalendarPartData,
  Global,
  MeetingDataLists,
} from "../interface/meetingModel";
import authService from "./authService";

// API endpoint paths for meeting-related actions
const MEETING_ENDPOINTS = {
  GET_MEETINGS_FOR_CALENDAR: "/Meeting/GetMeetingsDataAsync",
  GET_MEETING_BY_ID: "/Meeting/GetMeetingDataByIDAsync",
  INSERT_OR_UPDATE: "/Meeting", // used with dynamic function name
  UPDATE_APPOINTMENT_TYPE: "/Meeting/UpdateAppointmentType",
  GET_STATUSES: "/Meeting/GetMeetingStatusesAsync",
  GET_DATA_LISTS: "/Meeting/GetMeetingDataListsAsync",
  DELETE_MEETING: "/Meeting/DeleteMeetingAsync",
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

const ensureOkOrThrowWithText = async (
  response: Response,
  defaultMessage: string
): Promise<void> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || defaultMessage);
  }
};

class MeetingService {
  getMeetingCities() {
    throw new Error("Method not implemented.");
  }

  async getMeetingsForFullCalendar(): Promise<CalendarEventDto[]> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        ID: user.id,
        database: user.dataBase,
      };

      const endpoint = buildEndpoint(user.urlConnection, MEETING_ENDPOINTS.GET_MEETINGS_FOR_CALENDAR);

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      await ensureOkOrThrowWithText(response, "Failed to get meeting data");

      const data: CalendarEventDto[] = await response.json();
      return data;
    } catch (error) {
      console.error("Get meeting error:", error);
      throw error;
    }
  }

  async getMeetingsData(meetingID: string): Promise<CalendarPartData | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        ID: Number(meetingID),
        database: user.dataBase,
      };

      const endpoint = buildEndpoint(user.urlConnection, MEETING_ENDPOINTS.GET_MEETING_BY_ID);

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      await ensureOkOrThrowWithText(response, "Failed to get meeting data");

      const data: CalendarPartData = await response.json();
      return data;
    } catch (error) {
      console.error("Get meeting error:", error);
      throw error;
    }
  }

  async insertUpdateMeetingsData(
    meeting: CalendarDataModal,
    functionName: string
  ): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        meeting: meeting,
        database: user.dataBase,
        employeeID: user.id,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        `${MEETING_ENDPOINTS.INSERT_OR_UPDATE}/${functionName}`
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      await ensureOkOrThrowWithText(response, "Failed to insert meeting data");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Insert meeting error:", error);
      throw error;
    }
  }

  async UpdateAppointmentType(meetingID: number): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        ID: meetingID,
        database: user.dataBase,
      };

      const endpoint = buildEndpoint(
        user.urlConnection,
        MEETING_ENDPOINTS.UPDATE_APPOINTMENT_TYPE
      );

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      await ensureOkOrThrowWithText(response, "Failed to insert meeting data");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Insert meeting error:", error);
      throw error;
    }
  }

  async getMeetingStatuse(): Promise<Global[] | null> {
    try {
      const user = getAuthenticatedUser();

      const requestBody = {
        database: user.dataBase,
      };

      const endpoint = buildEndpoint(user.urlConnection, MEETING_ENDPOINTS.GET_STATUSES);

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      await ensureOkOrThrowWithText(response, "Failed to get meeting data");

      const data: Global[] = await response.json();
      return data;
    } catch (error) {
      console.error("Get meeting error:", error);
      throw error;
    }
  }

  async getMeetingDataLists(): Promise<MeetingDataLists | null> {
    try {
      const user = getAuthenticatedUser();

      const endpoint = buildEndpoint(user.urlConnection, MEETING_ENDPOINTS.GET_DATA_LISTS);

      // Preserve existing behavior: post the raw database value as the body
      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(user.dataBase)
      );

      await ensureOkOrThrowWithText(response, "Failed to get meeting data");

      const data: MeetingDataLists = await response.json();
      return data;
    } catch (error) {
      console.error("Get meeting error:", error);
      throw error;
    }
  }

  async deleteMeeting(
    meeting: CalendarEventDto,
    isRecurrenceMeeting: boolean
  ): Promise<boolean> {
    try {
      const user = getAuthenticatedUser();

      const endpoint = buildEndpoint(user.urlConnection, MEETING_ENDPOINTS.DELETE_MEETING);

      const requestBody = {
        database: user.dataBase,
        meetingID: meeting.id,
        recurrenceID: meeting.recurrenceId ?? null,
        isRecurrenceMeeting: isRecurrenceMeeting,
        employeeID: user.id,
      };

      const response = await authService.makeAuthenticatedRequest(
        endpoint,
        buildPostOptions(requestBody)
      );

      if (!response.ok) {
        throw new Error("Failed to Delete meeting");
      }

      const data = await response.json();
      if (data === false) throw new Error("Failed to Delete task");

      return true;
    } catch (error) {
      console.error("Error Deleting meeting:", error);
      return false;
    }
  }
}

export default new MeetingService();