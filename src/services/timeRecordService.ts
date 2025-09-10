// type TimeRecord = {
//   id?: string;
//   date: string;
//   type: string;
//   clockInTime: string;
//   clockOutTime: string;
//   notes: string;
//   total?: string;
// };

import { TimeType } from "../enum";
import type { TimeRecord, Employee } from "../interface/interfaces";
import authService from "./authService";


// type Employee = {
//   id?: string;
//   name?: string;
//   jobScope?: number;
//   expiresAt?: string;
//   [key: string]: any;
// };

class TimeRecordService {
  private storageKey = 'timeRecords';
  private employeeKey = 'employee';
async getTimeRecordsData(date:Date):Promise<TimeRecord[] | null>{
  try{
      const user = authService.getCurrentUser();
          if (!user) throw new Error('User not authenticated');
    
     const requestBody = {
        timeHourFromDate: date,
        employeeID: user.id,
        database: user.dataBase,
      };
const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/timeRecords/GetTimeRecordDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data: TimeRecord[] = await response.json();
      console.log('ReportData')
      console.log(data)
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
   combineDateAndTime = (date: Date, timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours);
  combined.setMinutes(minutes);
  combined.setSeconds(0);
  combined.setMilliseconds(0);
  return combined.toISOString();
};
async insertTimeRecord(timeRecords:TimeRecord){
try{
 const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const employee = authService.getCurrentEmployee();
    if (!employee) throw new Error('Employee not authenticated');

 const location = localStorage.getItem('location') || '';
    const requestBody = {
      database: user.dataBase,
      employeeID: user.id,
      dateTime: timeRecords.date.toISOString(), // כולל תאריך מלא עם שעה 00:00
      startTime: timeRecords.clockInTime,
      endTime: timeRecords.clockOutTime,
      dayPart:null,
      description: timeRecords.notes || null,
      timeHourReportsTypeID: timeRecords.typeID,
      timeHourReportMethodID: 3,
      location:location,
      type: 'insertTimeRecord'
      };
    console.log("requestBody", requestBody)
        const dynamicBaseUrl = user.urlConnection;
        const endpoint = `${dynamicBaseUrl}/TimeRecords/InsertTimeRecordDataAsync`;
 
        const response = await authService.makeAuthenticatedRequest(endpoint, {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
    
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error || 'Failed to InsertTimeRecord');
        }
    
        const data = await response.json();
        return {
          success: true,
          message: 'InsertTimeRecord successful',
          data: data,
        };
}
catch (error) {
      console.error('Error InsertTimeRecord data:', error);
      return null;
    }
}
  // Get employee data from localStorage
  getEmployee(): Employee | null {
    try {
      const employeeData = localStorage.getItem(this.employeeKey);
      if (!employeeData) return null;
      console.log(employeeData);

      const employee: Employee = JSON.parse(employeeData);
      if (employee.expiresAt && new Date(employee.expiresAt) < new Date()) {
        this.clearEmployee();
        return null;
      }
      console.log(employee);
      return employee;
    } catch (error) {
      console.error('Error getting employee data:', error);
      return null;
    }
  }

  clearEmployee() {
    localStorage.removeItem(this.employeeKey);
  }

  getTimeRecords(): TimeRecord[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting time records:', error);
      return [];
    }
  }

  addTimeRecord(record: TimeRecord): void {
    const records = this.getTimeRecords();
    record.id =Number(this.generateId());
    records.push(record);
    localStorage.setItem(this.storageKey, JSON.stringify(records));
  }

  // Get time records for a specific date range
  getTimeRecordsByDateRange(startDate: Date | string, endDate: Date | string): TimeRecord[] {
    try {
      const records = this.getTimeRecords();
      const start = new Date(startDate);
      const end = new Date(endDate);

      return records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= start && recordDate <= end;
      });
    } catch (error) {
      console.error('Error getting records by date range:', error);
      return [];
    }
  }

  // Get time records for current week
  getCurrentWeekRecords(currentWeek: Date = new Date()): TimeRecord[] {
    try {
      const startOfWeek = new Date(currentWeek);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return this.getTimeRecordsByDateRange(startOfWeek, endOfWeek);
    } catch (error) {
      console.error('Error getting current week records:', error);
      return [];
    }
  }

  // Calculate total hours between clockInTime and clockOutTime times
  calculateTotalHours(clockInTime: string, clockOutTime: string): string {
    if (!clockInTime || !clockOutTime || clockInTime === '-' || clockOutTime === '-') {
      return '00:00';
    }

    try {
      const [clockInTimeHour, clockInTimeMin] = clockInTime.split(':').map(Number);
      const [clockOutTimeHour, clockOutTimeMin] = clockOutTime.split(':').map(Number);

      const clockInTimeMinutes = clockInTimeHour * 60 + clockInTimeMin;
      const clockOutTimeMinutes = clockOutTimeHour * 60 + clockOutTimeMin;

      let totalMinutes = clockOutTimeMinutes - clockInTimeMinutes;
      if (totalMinutes < 0) totalMinutes += 24 * 60;

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating total hours:', error);
      return '00:00';
    }
  }

  getWeeklyStats(currentWeek: Date = new Date()): {
    totalHours: string;
    workDays: number;
    vacationDays: number;
    averageHours: number;
    totalMinutes: number;
  } {
    try {
      const weekRecords = this.getCurrentWeekRecords(currentWeek);

      let totalMinutes = 0;
      let workDays = 0;
      let vacationDays = 0;

      weekRecords.forEach(record => {
        if (record.type === TimeType.Vacation) {
          vacationDays++;
        } else if (record.total && record.total !== '00:00') {
          workDays++;
          const [hours, minutes] = record.total.split(':').map(Number);
          totalMinutes += hours * 60 + minutes;
        }
      });

      const totalHours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      const totalHoursFormatted = `${String(totalHours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;

      const averageHours = workDays > 0 ? (totalMinutes / workDays / 60).toFixed(2) : '0.00';

      return {
        totalHours: totalHoursFormatted,
        workDays,
        vacationDays,
        averageHours: parseFloat(averageHours),
        totalMinutes
      };
    } catch (error) {
      console.error('Error calculating weekly stats:', error);
      return {
        totalHours: '00:00',
        workDays: 0,
        vacationDays: 0,
        averageHours: 0,
        totalMinutes: 0
      };
    }
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getEmployeeJobScope(): number | null {
    const employee = this.getEmployee();
    return employee ? employee.jobScope ?? null : null;
  }

  initializeSampleData(): boolean {
    const employee = this.getEmployee();
    if (!employee) return false;

    const existingRecords = this.getTimeRecords();
    if (existingRecords.length > 0) return false;

    // const sampleRecords: TimeRecord[] = [
    //   { date: "2025-06-16", type: "רגיל", clockInTime: "08:30", clockOutTime: "17:30", notes: "" },
    //   { date: "2025-06-17", type: "נוכחות חלקית", clockInTime: "09:00", clockOutTime: "14:00", notes: "פגישה רפואית" },
    //   { date: "2025-06-18", type: "עבודה מהבית", clockInTime: "08:00", clockOutTime: "16:30", notes: "" },
    //   { date: "2025-06-19", type: "רגיל", clockInTime: "08:45", clockOutTime: "17:15", notes: "" },
    //   { date: "2025-06-20", type: "חופש", clockInTime: "-", clockOutTime: "-", notes: "יום חופש" }
    // ];

   // sampleRecords.forEach(record => this.addTimeRecord(record));
    return true;
  }
}

const timeRecordService = new TimeRecordService();
export default timeRecordService;
