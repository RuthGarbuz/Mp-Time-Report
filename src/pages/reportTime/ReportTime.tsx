/**
 * ReportTime Component - Time Tracking Display
 * 
 * Displays employee time tracking interface with:
 * - Current date and time
 * - Employee profile and status
 * - Real-time report time calculation
 * - Clock in/out buttons
 * - Time summary (total, start, end times)
 * - Location map
 * 
 * All business logic extracted to useReportTime hook
 * This component handles only UI rendering
 */

import { useReportTime } from './hooks';
import "tailwindcss";

const ReportTime = () => {
  // ==========================================================================
  // Hook - All business logic extracted
  // ==========================================================================
  
  const {
    // State
    employee,
    currentTime,
    effectiveReportTime,
    locationName,
    locationUrl,
    
    // Actions
    handleClockIn,
    handleClockOut,
    
    // Utilities
    formatDate,
    getProfileImage
  } = useReportTime();

  // ==========================================================================
  // Render
  // ==========================================================================
  
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
                <div className="text-lg mb-1 font-bold text-purple-600">
                  {formatDate(currentTime)}
                </div>
              </div>

              {/* Profile Image with Status Indicator */}
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                  <img
                    src={getProfileImage()}
                    alt={employee?.name || 'תמונה'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Green dot indicator - employee is online */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>

            {/* Employee Name */}
            {employee?.name && (
              <div className="text-right text-purple-600 text-lg font-medium mb-4">
                {employee.name}
              </div>
            )}

            {/* Clock Display - Circular Timer */}
            <div className="flex justify-center mb-6">
              <div className="w-56 h-56 rounded-full border-4 border-purple-500 flex flex-col items-center justify-between bg-purple-50 p-6">
                
                {/* Title */}
                <div className="text-xl font-semibold text-purple-600">
                  זמן דיווח
                </div>

                {/* Actual Reported Time - Updates every second */}
                <div className="text-2xl font-bold text-purple-700">
                  {effectiveReportTime}
                </div>

                {/* Expected Work Hours */}
                <div className="text-center">
                  <div className="text-sm text-gray-500">תקן משרה</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {employee?.minutesHoursAmount || '--:--'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Clock In/Out */}
            <div className="flex gap-4 mb-6">
              {/* Clock Out Button - Enabled when active */}
              <button
                onClick={handleClockOut}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!employee?.isActive}
              >
                יציאה
              </button>
              
              {/* Clock In Button - Enabled when not active */}
              <button
                onClick={handleClockIn}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 px-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={employee?.isActive}
              >
                כניסה
              </button>
            </div>

            {/* Time Summary - 3 Column Grid */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Total Report Time */}
              <div>
                <div className="text-xs text-gray-500 mb-1">סה"כ דיווח</div>
                <div className="text-lg font-semibold text-gray-800">
                  {effectiveReportTime}
                </div>
              </div>
              
              {/* Clock Out Time */}
              <div>
                <div className="text-xs text-gray-500 mb-1">שעת יציאה</div>
                <div className="text-lg font-semibold text-gray-800">
                  {employee?.endTime || '--:--'}
                </div>
              </div>
              
              {/* Clock In Time */}
              <div>
                <div className="text-xs text-gray-500 mb-1">שעת כניסה</div>
                <div className="text-lg font-semibold text-gray-800">
                  {employee?.startTime || '--:--'}
                </div>
              </div>
            </div>
          </div>

          {/* Map Container - Location Display */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-64 mt-6">
            <div className="relative h-full">
              {/* Google Maps Embed */}
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
              {/* Hide Google Maps UI - Bottom links bar */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-white pointer-events-none"></div>
              
              {/* Location Name Overlay */}
              <div className="absolute bottom-2 left-2 bg-purple-600 bg-opacity-90 text-white px-3 py-1 rounded shadow-md z-10">
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
