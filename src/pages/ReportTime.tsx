// ------------------------
// Utility: Convert lat/lon to Hebrew location name


import { useState, useEffect } from 'react';
import EmployeeService from '../services/employeeService';
import "tailwindcss";
import authService from '../services/authService';

// const getLocationName = async (lat: number, lon: number) => {
//   try {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=he`
//     );
//     const data = await response.json();
//     console.log('Full address received:', data.address); // 👈 check what you're actually getting

//     const address = data.address;

//     const city =
//       address.city ||
//       address.town ||
//       address.village ||
//       address.locality ||
//       'Unknown City';

//     const street = address.road || address.street || address.pedestrian || 'Unknown Street';

//     return `${city} - ${street}`;
//   } catch (error) {
//     console.error('Error resolving location:', error);
//     return 'Unknown location';
//   }
// };


const ReportTime = () => {
  const [employee, setEmployee] = useState<{
    name: string;
    profileImage: string;
    isActive: boolean;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reportedSeconds, setReportedSeconds] = useState(0);
  const [minutesHoursAmount, setMinutesHoursAmount] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [locationName, setLocationName] = useState('המיקום שלך');

  useEffect(() => {
    let mounted = true;
    const fetchEmployee = async () => {
      try {
        const empData = await authService.getCurrentEmployee();
        // const empData = result?.data ?? {};
        if (!mounted) return;
        setEmployee({
          name: empData.name ?? '',
          profileImage: empData.image ?? empData.profileImage ?? '',
          isActive: Boolean(empData.isActive ?? false),
        });
        setStartTime(empData.startTime ?? '');
        setEndTime(empData.endTime ?? '');
        setMinutesHoursAmount(empData.minutesHoursAmount ?? '');
        setReportedSeconds(Number(empData.totalSecondsReported ?? empData.reportedSeconds ?? 0));
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      }
    };

    fetchEmployee();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
function getCoords(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
  });
}
useEffect(() => {
  const fetchLocation = async () => {
    try {
      const position = await getCoords(); // עכשיו זה מחזיר GeolocationPosition
      const { latitude, longitude } = position.coords;

      const name = await EmployeeService.getUserLocation();
      setLocationName(name);
      localStorage.setItem('location', name);

      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&hl=he&z=16&output=embed`;
      setLocationUrl(mapsUrl);

    } catch (error) {
      console.error('שגיאה בקבלת מיקום:', error);
      setLocationName('תל אביב');
      setLocationUrl('https://www.google.com/maps?q=Tel+Aviv&hl=he&z=16&output=embed');
      localStorage.setItem('location', 'תל אביב');
    }
  };

  fetchLocation();
}, []);


  // const getElapsedSecondsSinceStart = (startTime: string | null | undefined): number => {
  //   if (!startTime) return 0;
  //   const start = new Date(`${new Date().toDateString()} ${startTime}`);
  //   if (isNaN(start.getTime())) {
  //     // Invalid date
  //     return 0;
  //   }

  //   const now = new Date();
  //   const diff = Math.floor((now.getTime() - start.getTime()) / 1000); // difference in seconds
  //   return diff > 0 ? diff : 0;
  // };


  const getEffectiveReportTime = () => {
    let total = reportedSeconds ?? 0;

    if (employee?.isActive && startTime) {
      try {
        const now = new Date();
        const [hours, minutes, seconds] = startTime.split(':').map(Number);
        if (!isNaN(hours) && !isNaN(minutes)) {
          const start = new Date();
          start.setHours(hours, minutes, seconds || 0, 0);
          const diffSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
          if (diffSeconds > 0) {
            total += diffSeconds;
          }
        }
      } catch (err) {
        console.warn('Error parsing startTime:', err);
      }
    }

    if (typeof total !== 'number' || isNaN(total)) total = 0;

    const hours = String(Math.floor(total / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const seconds = String(total % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };


  const formatDate = (date: Date) =>
    date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

  const handleClockIn = async () => {
    try {
      await EmployeeService.clockIn();
      ('כניסה נרשמה בהצלחה');
      window.location.reload();
    } catch (error) {
      console.error('שגיאה ברישום כניסה:', error);
    }
  };

  const handleClockOut = async () => {
    try {
      await EmployeeService.clockOut();
      console.log('יציאה נרשמה בהצלחה');
      window.location.reload();
    } catch (error) {
      console.error('שגיאה ברישום יציאה:', error);
    }
  };

  const getProfileImage = () => {
    const img = employee?.profileImage?.trim();
    if (img && img !== 'null') {
      return `data:image/jpeg;base64,${img}`;
    }
    return '/default-profile.png'; // from public/
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 flex justify-center">
      {/* Container with max dimensions */}
      <div className="w-full max-w-[576px] max-h-[868px] overflow-y-auto">
        <div className="px-4 py-4">
          {/* Top Card with Date, Time and Profile */}
          <div className="bg-white rounded-2xl p-6 mb-4 shadow-lg">
            {/* Date and Profile Row */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-gray-600">
                <div className="text-lg mb-1  font-bold text-purple-600">{formatDate(currentTime)}</div>
                {/* <div className="text-2xl font-bold text-purple-600">
                  {formatTime(currentTime)}
                </div> */}
              </div>


              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={getProfileImage()}
                    alt={employee?.name || 'תמונה'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {employee?.name && (
              <div className="text-right text-purple-600 text-lg font-medium mb-4">
                {employee.name}
              </div>
            )}

            {/* Clock Display */}
            <div className="flex justify-center mb-6">
              <div className="w-56 h-56 rounded-full border-4 border-purple-500 flex flex-col items-center justify-between bg-purple-50 p-6">

                {/* כותרת עליונה */}
                <div className="text-xl font-semibold text-purple-600">
                  זמן דיווח
                </div>

                {/* זמן מדווח בפועל */}
                <div className="text-2xl font-bold text-purple-700">
                  {getEffectiveReportTime()}
                </div>

                {/* תקן משרה וזמן תקן */}
                <div className="text-center">
                  <div className="text-sm text-gray-500">תקן משרה</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {minutesHoursAmount || '--:--'}
                  </div>
                </div>
              </div>
            </div>


            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleClockOut}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                // disabled={employee?.isActive === false}
                disabled={!employee?.isActive}
              //  disabled={employee && !employee.isActive}

              >
                יציאה
              </button>
              <button
                onClick={handleClockIn}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                // disabled={employee?.isActive === false}
                disabled={employee?.isActive}

              >
                כניסה
              </button>
            </div>

            {/* Time Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">סה"כ דיווח</div>
                <div className="text-lg font-semibold text-gray-800">
                  {getEffectiveReportTime()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">שעת יציאה</div>
                <div className="text-lg font-semibold text-gray-800">
                  {endTime || '--:--'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">שעת כניסה</div>
                <div className="text-lg font-semibold text-gray-800">
                  {startTime || '--:--'}
                </div>
              </div>
            </div>
          </div> {/* ✅ This was the missing closing tag */}

          {/* Map Container */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-64 mt-6">
            <div className="relative h-full">
              {locationUrl && (
                <iframe
                  src={locationUrl}
                  className="w-full h-full border-0 pointer-events-none"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Location Map"
                />
              )}
              <div className="absolute bottom-2 left-2 bg-white bg-opacity-70 text-gray-700 px-3 py-1 rounded shadow-md">
                מיקום: {locationName}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ReportTime;
