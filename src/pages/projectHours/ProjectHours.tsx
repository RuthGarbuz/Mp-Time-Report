import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import "tailwindcss";
import HourReportModalOpen from './HourReportModalOpen';
import EmployeeProfileCard from '../shared/employeeProfileCard';
import ConfirmModal from '../shared/confirmDeleteModal';
import { useProjectHours } from './hooks/useProjectHours';

const ProjectHours = () => {
  // const rowRef = useRef<HTMLDivElement>(null);

  const {
    employee,
    reports,
    currentDay,
    totalTime,
    editingReportId,
    editingReport,
    isModalOpen,
    isConfirmOpen,
    editPermission,
    navigateDay,
    openNewReport,
    openEditReport,
    onDeleteClick,
    confirmDelete,
    cancelDelete,
    closeReportModal,
  } = useProjectHours();

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

    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">

        {/* Employee Profile Section */}
        <EmployeeProfileCard
          employee={employee}
        ></EmployeeProfileCard>

        {/* Week Navigation */}

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDay('prev')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {currentDay.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h2>
            </div>

            <button
              onClick={() => navigateDay('next')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600  transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Add Report Button */}
        {editPermission && (
          <div className="mb-6">
            <button
              onClick={openNewReport}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              הוסף דיווח חדש
            </button>
          </div>
        )}

        {/* Reports Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {reports.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">אין דיווחים להיום</h3>
              <p className="text-gray-500">לחץ על "הוסף דיווח חדש" כדי להתחיל</p>
            </div>
          ) : (
            <>
              {/* Grid Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 md:p-3">
                <h3 className="text-lg md:text-xl font-bold mb-3">דיווחי שעות לפרויקטים</h3>
                <div className="flex flex-row items-center justify-between font-semibold text-sm md:text-base">
                  <div className="w-[40%] text-center">פרויקט</div>
                  <div className="w-[20%] text-center">כניסה</div>
                  <div className="w-[20%] text-center">יציאה</div>
                  <div className="w-[20%] text-center">סה"כ</div>
                  <div className="text-center"></div>
                </div>
              </div>

              {/* Grid Content */}
              <div className="divide-y divide-gray-100">
                {reports.map((report, index) => (
                  <div
                    key={report.id}
                    className={`relative p-2 md:p-3 hover:bg-gray-50 transition-colors duration-200
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                      flex flex-row items-center justify-between gap-3 text-xs md:text-sm`}
                  >
                    {/* Project */}
                    <div className="w-[40%] text-center">
                      <span className="text-xs md:text-base text-blue-600 font-semibold">
                        {report.projectName ?? 'כללי'}
                      </span>
                    </div>

                    {/* Clock In Time */}
                    <div className="w-[20%] text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-green-500 hidden md:block" />
                        <span className={`text-xs md:text-base ${
                          report.clockInTime === '-' ? 'text-gray-400' : 'text-green-600 font-semibold'
                        }`}>
                          {report.clockInTime || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Clock Out */}
                    <div className="w-[20%] text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3 text-red-500 hidden md:block" />
                        <span className={`text-xs md:text-base ${
                          report.clockOutTime === '-' ? 'text-gray-400' : 'text-red-600 font-semibold'
                        }`}>
                          {report.clockOutTime || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="w-[20%] text-center text-blue-600 font-semibold">
                      <span className="text-xs md:text-base">
                        {report.total ?? '00:00'}
                      </span>
                    </div>
                   
                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditReport(report.id)}
                        className="pl-2 text-gray-500 hover:text-gray-700 rounded-xl transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteClick(report.id)}
                        className="pr-2 text-red-500 hover:text-red-700 rounded-xl transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות שדווחו</h4>
            <p className="text-2xl font-bold text-green-600">{totalTime}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות תקן ליום</h4>
            <p className="text-2xl font-bold text-blue-600">{employee.minutesHoursAmount}</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <HourReportModalOpen
          title={editingReportId ? 'עריכת דיווח שעות' : 'הוספת דיווח חדש'}
          isOpen={isModalOpen}
          onClose={closeReportModal}
          report={editingReport}
          employee={employee}
          currentDay={currentDay}
          editingReportId={editingReportId ?? 0}
        />
      )}

      {isConfirmOpen && (
        <ConfirmModal
          message="האם הנך בטוח שברצונך למחוק דיווח זה?"
          onOk={confirmDelete}
          onCancel={cancelDelete}
          okText="מחק"
          cancelText="ביטול"
        />
      )}
    </div>
  );
};

export default ProjectHours;