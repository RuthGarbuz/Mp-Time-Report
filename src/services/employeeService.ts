// services/employeeService.js
import authService from './authService';

class EmployeeService {
  async getEmployee() {
    try {
    
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const date = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const requestBody = {
        date:date,
        id: user.id,
        database: user.dataBase
      };

      const dynamicBaseUrl = user.urlConnection; // ← Use this instead of static URL
      const endpoint = `${dynamicBaseUrl}/employees/GetEmployeeDataAsync`; // Make sure this is correct


      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data = await response.json();
console.log('data')

console.log(data)
      // Store employee info in localStorage
      localStorage.setItem('employee', JSON.stringify({
        id: data.id,
        name: data.name,
        image: data.pictureBase64,
        isActive: data.isActive,
        jobScope: data.jobScope,
        expiresAt: data.expiration,
        timeHourReportID:data.timeHourReportID,
        minutesHoursAmount:data.minutesHoursAmount,
        editPermision:true
      }));
      localStorage.setItem("timeHourReportsTypes", JSON.stringify(data.timeHourReportsTypes));
      return {
        success: true,
        message: 'Employee fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  }
  
  async clockIn() {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
  
      const employee = authService.getCurrentEmployee();
      if (!employee) throw new Error('employee not authenticated');

      const now = new Date();
      const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
     // const time = now.toTimeString().split(' ')[0]; // Format: HH:MM:SS
      const location = localStorage.getItem('location') || '';
      const requestBody = {
        date: date,
        timeHourReportID:employee.timeHourReportID,
        location: location,
        id: user.id,
        database: user.dataBase,
        type: 'clockIn' // או כל פרמטר נוסף שהשרת מצפה לו
      };

      const dynamicBaseUrl = user.urlConnection;
      const endpoint = `${dynamicBaseUrl}/employees/ClockInAsync`; // endpoint מתאים לכניסה

      const response = await authService.makeAuthenticatedRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

   if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to get employee data');
      }
      const data = await response.json();

      return {
        success: true,
        message: 'Employee fetched successfully',
        data: data,
      };
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  }
async clockOut() {
  try {
    console.log('clockOut');
    const user = authService.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const employee = authService.getCurrentEmployee();
    if (!employee) throw new Error('Employee not authenticated');

    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // ⬇️ Get latest location from geolocation
    const location = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=he`
            );
            const data = await response.json();
            const address = data.address;

            const city =
              address.city ||
              address.town ||
              address.village ||
              address.locality ||
              'עיר לא ידועה';

            const street = address.road || address.street || address.pedestrian || 'רחוב לא ידוע';

            resolve(`${city} - ${street}`);
          } catch (err) {
            console.error('Location fetch error:', err);
            resolve('מיקום לא זמין');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          resolve('מיקום לא זמין');
        }
      );
    });

    const requestBody = {
      date: date,
      timeHourReportID: employee.timeHourReportID,
      location: location,
      id: user.id,
      database: user.dataBase,
      type: 'clockOut',
    };

    const dynamicBaseUrl = user.urlConnection;
    const endpoint = `${dynamicBaseUrl}/employees/clockOutAsync`;

    const response = await authService.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to clock out');
    }

    const data = await response.json();
    return {
      success: true,
      message: 'Clock-out successful',
      data: data,
    };
  } catch (error) {
    console.error('Clock out error:', error);
    throw error;
  }
}
}

export default new EmployeeService();