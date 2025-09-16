import type { Employee } from "../../interface/interfaces";

interface Props {
  employee: Employee;
}

export default function EmployeeProfileCard({ employee }: Props) {
     const getProfileImage = () => {
    const img = employee?.image?.trim();
    if (img && img !== 'null') {
      return `data:image/jpeg;base64,${img}`;
    }
    return '/images/default-profile.png'; // מ- public/images
  };
  // Add loading state while employee data is being fetched
  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }
  return (
   <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="flex items-center gap-4">
            {/* Profile Image */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-white shadow-lg ring-2 ring-blue-100">
                <img
                  src={getProfileImage()}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Employee Name */}
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{employee.name}</h1>
            </div>
          </div>
        </div>
  );
}