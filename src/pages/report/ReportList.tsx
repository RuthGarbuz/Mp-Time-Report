/**
 * ReportList Component
 * 
 * Main component for displaying and managing weekly time reports.
 * Features:
 * - Week navigation (previous/next/today)
 * - Report grid with time entries
 * - Add/Edit/Delete reports
 * - Weekly statistics (total hours, days worked)
 * - Permission-based access control
 * 
 * Refactored to use custom hooks for better separation of concerns.
 */

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar, Plus, Edit2, Trash2 } from 'lucide-react';
import "tailwindcss";
import EmployeeProfileCard from '../shared/employeeProfileCard';
import ConfirmModal from '../shared/confirmDeleteModal';
import ReportModal from './createUpdateReportModal';
import { useModal } from '../ModalContextType';
import { useReportList } from './hooks';

const ReportList = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { openModal, closeModal } = useModal();
  
  // Use custom hook for all report list logic
  const {
    employee,
    filteredReports,
    typeReports,
    currentWeek,
    totalTime,
    totalDay,
    editPermission,
    allowAddReport,
    isModalOpen,
    newReport,
    errorMessage,
    isConfirmOpen,
    contextMenuRowId,
    navigateWeek,
    openNewReport,
    openEditReport,
    closeReportModal,
    handleSubmit,
    setNewReport,
    onDeleteClick,
    confirmDelete,
    cancelDelete,
    setContextMenuRowId,
    getReportTypeStyle
  } = useReportList();


  /**
   * Helper function to format date for display
   */
  const formatDateForDisplay = (date: Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  /**
   * Helper function to format week range for display
   */
  const formatWeekRangeDisplay = (inputDate: Date): string => {
    const date = new Date(inputDate);
    const dayOfWeek = date.getDay(); // 0 = Sunday

    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return `${formatDateForDisplay(startOfWeek)} - ${formatDateForDisplay(endOfWeek)}`;
  };

  /**
   * Handle opening new report modal
   */
  const handleOpenNewReport = () => {
    openNewReport();
    openModal();
  };

  /**
   * Handle opening edit report modal
   */
  const handleOpenEditReport = (id: number) => {
    openEditReport(id);
    openModal();
  };

  /**
   * Handle closing report modal
   */
  const handleCloseReportModal = () => {
    closeReportModal();
    closeModal();
  };

  /**
   * Handle form submission with modal close
   */
  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    closeModal();
  };

  // Show loading state while employee data is being fetched
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
        <EmployeeProfileCard employee={employee} />

        {/* Week Navigation */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek('prev')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex items-center gap-2 md:gap-3">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
              <h2 className="text-lg md:text-xl font-bold text-gray-800">
                {formatWeekRangeDisplay(currentWeek)}
              </h2>
            </div>

            <button
              onClick={() => navigateWeek('next')}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-500 hover:bg-blue-600  transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Add Report Button */}
        {editPermission && allowAddReport && (
          <div className="mb-6">
            <button
              onClick={handleOpenNewReport}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              הוסף דיווח חדש
            </button>
          </div>
        )}

        {/* Reports Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Grid Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 md:p-4">
            <h3 className="text-lg md:text-xl font-bold mb-3">דיווחי נוכחות</h3>
            <div className="grid grid-cols-5 gap-1 md:gap-4 font-semibold text-sm md:text-base">
              <div className="text-center">תאריך</div>
              <div className="text-center">סוג</div>
              <div className="text-center">כניסה</div>
              <div className="text-center">יציאה</div>
              <div className="text-center">סה"כ</div>
              <div className="text-center"></div>

            </div>
          </div>

          {/* Grid Content */}
            <div className="divide-y divide-gray-100">

            {filteredReports?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((report, index) => (

              <div
              ref={(el) => {
                rowRef.current = el;
              }}
              key={report.id}
              onClick={() => setContextMenuRowId(report.id ?? null)}
              className={`relative p-2 md:p-3 hover:bg-gray-50 transition-colors duration-200
        ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
        flex flex-row items-center justify-between gap-2 text-xs md:text-sm`}
              >
              {/* Date */}
              <div className="w-[20%] text-center">
                <div className="font-medium text-gray-800">
                {formatDateForDisplay(new Date(report.date))}
                </div>
                <div className="text-xs text-gray-500 hidden md:block">
                {new Date(report.date).toLocaleDateString('he-IL', { weekday: 'long' })}
                </div>
              </div>

                {/* Report Type */}

                <div className="w-[20%] text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] md:text-xs ${getReportTypeStyle(report.typeID)}`}>
                    <span className="block md:hidden">
                      {report.typeID === 5 ? 'ר' :
                        report.typeID === 3 ? 'ח' :
                          report.typeID === 6 ? 'ב' :
                            report.typeID === 4 ? 'מ' :
                              report.typeID === 2 ? 'ת' :
                                report.typeID === 1 ? 'מח' :
                                  typeReports.find((type) => (type.id === report.typeID))?.name}
                    </span>
                    <span className="hidden md:block">
                      {typeReports.find((type) => (type.id === report.typeID))?.name}
                    </span>
                  </span>
                </div>


                {/* clockInTime Time */}

                <div className="w-[20%] text-center ">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-green-500 hidden md:block" />
                    <span className={` text-xs md:text-base ${report.clockInTime === '-' ? 'text-gray-400' : 'text-green-600 font-semibold'}`}>
                      {report.clockInTime}
                    </span>
                  </div>
                </div>

                {/* Clock Out */}
                <div className="w-[20%] text-center ">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-red-500 hidden md:block" />
                    <span className={` text-xs md:text-base ${report.clockOutTime === '-' ? 'text-gray-400' : 'text-red-600 font-semibold'}`}>
                      {report.clockOutTime}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="w-[20%] text-center  text-blue-600 font-semibold">
                  <span className={` text-xs md:text-base text-blue-600 font-semibold`}>
                    {report.total ?? '00:00'}
                  </span>
                </div>
                {/* Total Hours */}
                {contextMenuRowId === report.id && editPermission && allowAddReport && (
                  <div className=" top-1 left-1 flex gap-1 z-10">
                    <button
                      onClick={() => {
                        if (report.id !== undefined) {
                          handleOpenEditReport(report.id);
                        }
                        setContextMenuRowId(null);
                      }}
                      className=" text-gray-500 hover:text-gray-700 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => { 
                        if (report.id !== undefined) onDeleteClick(report.id);
                        setContextMenuRowId(null);
                      }}
                      className="text-red-500 hover:text-red-700 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
            
              </div>
            ))}
          </div>
        </div>

        {/* Confirm Delete Modal */}
        {isConfirmOpen && (
          <ConfirmModal
            message="האם הנך בטוח שברצונך למחוק דיווח זה?"
            onOk={confirmDelete}
            onCancel={cancelDelete}
            okText="מחק"
            cancelText="ביטול"
          />
        )}
        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {/* <User className="w-5 h-5 text-green-600" /> */}
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות שדווחו השבוע</h4>
            <p className="text-2xl font-bold text-green-600">{totalTime}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">שעות תקן ליום</h4>
            <p className="text-2xl font-bold text-blue-600">{employee.minutesHoursAmount}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-800 mb-2">ימי נוכחות</h4>
            <p className="text-2xl font-bold text-purple-600">{totalDay}</p>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <ReportModal
          isOpen={isModalOpen}
          title={newReport.id ? "עדכון דיווח" : "הוספת דיווח חדש"}
          newReport={newReport}
          setNewReport={setNewReport}
          typeReports={typeReports}
          closeModal={handleCloseReportModal}
          handleSubmit={handleFormSubmit}
          currentWeek={currentWeek}
          errorMessage={errorMessage ? errorMessage.join(', ') : ""}
        />
      )}
    </div>
  );
};

export default ReportList;