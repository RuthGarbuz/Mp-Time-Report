import type { CalendarDataModal, CalendarEventDto, CalendarPartData, Global, MeetingDataLists } from "../interface/meetingModel";
import authService from "./authService";

class MeetingService {
  getMeetingCities() {
    throw new Error("Method not implemented.");
  }
  async getMeetingsForFullCalendar(): Promise<CalendarEventDto[]>{
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        ID: user.id,
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Meeting/GetMeetingsDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get meeting data');
      }
        const data: CalendarEventDto[] = await response.json();
    return data;
      } catch (error) {
      console.error('Get meeting error:', error);
      throw error;
      return [];
    }
  }
  
  async getMeetingsData(meetingID:string): Promise<CalendarPartData|null>{
    try {
console.log('Event click data:', meetingID);
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        ID: Number(meetingID),
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Meeting/GetMeetingDataByIDAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get meeting data');
      }
       const data: CalendarPartData = await response.json();
    return data;
      } catch (error) {
      console.error('Get meeting error:', error);
      throw error;
      return null;
    }
  }
  async insertUpdateMeetingsData(meeting:CalendarDataModal,functionName:string): Promise<boolean>{
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        meeting: meeting,
        database: user.dataBase,
        employeeID: user.id
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Meeting/${functionName}`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to insert meeting data');
      }
       const data = await response.json();
    return data;
      } catch (error) {
      console.error('Insert meeting error:', error);
      throw error;
      return false;
    }
  }
   async UpdateAppointmentType(meetingID:number): Promise<boolean>{
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        ID: meetingID,
        database: user.dataBase,
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
            const endpoint = `${dynamicBaseUrl}/Meeting/UpdateAppointmentType`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to insert meeting data');
      }
       const data = await response.json();
    return data;
      } catch (error) {
      console.error('Insert meeting error:', error);
      throw error;
      return false;
    }
  }
  async getMeetingStatuse(): Promise<Global[]|null>{
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const requestBody = {
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Meeting/GetMeetingStatusesAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get meeting data');
      }
       const data: Global[] = await response.json();
    return data;
      } catch (error) {
      console.error('Get meeting error:', error);
      throw error;
      return null;
    }
  }
  async getMeetingDataLists(): Promise<MeetingDataLists|null>{
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // const requestBody = {
      //   database: user.dataBase
      // };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/Meeting/GetMeetingDataListsAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(user.dataBase),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get meeting data');
      }
       const data: MeetingDataLists = await response.json();
    return data;
      } catch (error) {
      console.error('Get meeting error:', error);
      throw error;
      return null;
    }
  }
 async  deleteMeeting (meeting:CalendarEventDto,isRecurrenceMeeting:boolean): Promise<boolean> {
    try {
      
       const user = authService.getCurrentUser();
      if (!user) throw new Error("User not authenticated");
  
      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/Meeting/DeleteMeetingAsync`; 
      const requestBody = {
        database: user.dataBase,
        meetingID:meeting.id,
        recurrenceID:meeting.recurrenceId??null,
        isRecurrenceMeeting: isRecurrenceMeeting,
        employeeID:user.id
      };
  
      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error("Failed to Delete meeting");
      }
  const data = await response.json();
  if(data===false) throw new Error("Failed to Delete task");
      return true;
   } 
   catch (error) {
      console.error("Error Deleting meeting:", error);
      return false;
    }
  }
}

export default new MeetingService();