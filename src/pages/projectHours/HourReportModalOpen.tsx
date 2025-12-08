import { X } from "lucide-react";
import type { CheckHoursOverlapQuery, Contract, Employee, HourReportModal, Project, Step, SubContract } from "../../interface/interfaces";
import { useEffect, useState } from "react";
import ErrorMessage from "../shared/errorMessage";
import hourReportService, { getHourReportStepsModal, getStepsList, insertProjectHourReport } from "../../services/hourReportService";
import { getProjectsList } from "../../services/TaskService";
import ProjectFilter from "../shared/projectsFilter";

interface Props {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  report: any;
  employee?: Employee;
  currentDay: Date;
  editingReportId: number;
  project?: Project;
}

export default function HourReportModalOpen({
  title,
  isOpen,
  onClose,
  report,
  employee,
  editingReportId,
  currentDay,
  project
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportingType, setReportingType] = useState('total');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [calculateclockOutTime, setCalculateclockOutTime] = useState("");
  const [isOpenProject, setIsOpenProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(project ? project : null);
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [subContracts, setSubContracts] = useState<SubContract[] | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [projectsList, setProjectsList] = useState<Project[]>(
    [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
  );
  const [newReport, setNewReport] = useState<HourReportModal>(
    {
      id: 0,
      date: new Date(),
      clockInTime: undefined,
      clockOutTime: undefined,
      notes: "",
      total: undefined,
      projectID: selectedProject?.id ?? 0,
      contractID: 0,
      subContractID: 0,
      stepID: 0,
      hourReportMethodID: selectedProject?.hoursReportMethodID ?? 0,
      employeeId: employee?.id ?? 0,

    }
  );
  if (!isOpen) return null;
  useEffect(() => {
    if (report) {
      const reportData: HourReportModal = { ...report, hourReportMethodID: project?.hoursReportMethodID ?? 0 };
      setNewReport(reportData);
    }
  }, [report]);

  useEffect(() => {
    // חישוב שעת יציאה משולב — רץ כש־employee או currentDay או newReport משתנים (כל מה שמשפיע)
    const doCalc = async () => {
      try {
        // ברירת מחדל
        setCalculateclockOutTime("");

        if (employee?.minutesHoursAmount) {
          const calc = addTime("08:00", employee.minutesHoursAmount); // ודאי ש־addTime מחזיר string תקין
          setCalculateclockOutTime(calc);
        }

        // אם רוצים לעשות פעולה תלויה בתאריכים/דוח חדש — אפשר גם כאן
      } catch (error) {
        console.error("Failed to calculate clock out time:", error);
      }
    };

    doCalc();
  }, [employee?.minutesHoursAmount, currentDay, newReport?.clockInTime, newReport?.clockOutTime]);
  useEffect(() => {

    if (newReport?.clockInTime && newReport?.clockOutTime) {
      setReportingType("time-range");
    } else {
      setReportingType("total");
    }
  }, [newReport?.clockInTime, newReport?.clockOutTime]);
  //      useEffect(() => {
  //  setOpenProjectList();
  //  setIsModalOpen(true);

  //  }, []);

  useEffect(() => {
    const init = async () => {
      await setOpenProjectList();
      if (editingReportId && project) {
        await initProjectData();
      }
      else {
        setIsOpenProject(true);
        return;
      }

      setIsModalOpen(true);        // עכשיו פותחים מודל
    };

    init();
  }, []);
  const setOpenProjectList = async () => {
    const projectsData: Project[] = await getProjectsList();
    if (projectsData) {
      setProjectsList(projectsData as Project[]);
    }

  }

  const handleOk = async () => {
    if (selectedProject) {
      // setError(null)
      await initNewReport()
      setErrorMessage(null)
      setIsOpenProject(false);
      setIsModalOpen(true)
    }
  };
  const initProjectData = async () => {
    if (selectedProject?.hoursReportMethodID === 5) {
      const HourReportStepsData = await getHourReportStepsModal(selectedProject?.id ?? 0);
      if (HourReportStepsData) {
        if (HourReportStepsData.contractsList) {
          setContracts(HourReportStepsData.contractsList);
        }
        if (HourReportStepsData.subContractsList) {
          setSubContracts(HourReportStepsData.subContractsList);
        }
        if (HourReportStepsData.stepsList.length > 0) {
          console.log('stepsList', HourReportStepsData.stepsList)

          setSteps(HourReportStepsData.stepsList);
        }
      }
    }
    else if (selectedProject?.hoursReportMethodID === 3) {
      setSubContracts(null)
      setContracts(null)
      setSteps(null)

    }
    else if (selectedProject) {
      let StepList = await getStepsList(selectedProject?.id ?? 0);
      if (StepList && StepList.length > 0) {
        console.log('stepsList4', StepList)
        setSteps(StepList);
      }
      setSubContracts(null)
      setContracts(null)
    }
  }
  const initNewReport = async () => {
    setErrorMessage(null);
    await initProjectData();
    setNewReport({
      id: 0,
      date: currentDay,
      clockInTime: undefined,
      clockOutTime: undefined,
      notes: "",
      total: employee?.minutesHoursAmount,
      projectID: selectedProject?.id ?? 0,
      contractID: 0,
      subContractID: 0,
      stepID: 0,
      hourReportMethodID: selectedProject?.hoursReportMethodID ?? 0,
      employeeId: employee?.id ? Number(employee.id) : 0,

    })
  }
  function addTime(clockInTimeTime: string, duration: string): string {
    const [clockInTimeHours, clockInTimeMinutes] = clockInTimeTime.split(':').map(Number);
    const [durationHours, durationMinutes] = duration.split(':').map(Number);

    let totalMinutes = clockInTimeMinutes + durationMinutes;
    let totalHours = clockInTimeHours + durationHours;

    if (totalMinutes >= 60) {
      totalMinutes -= 60;
      totalHours += 1;
    }

    // Handle overflow beyond 24 hours if needed
    totalHours = totalHours % 24;

    const clockOutTimeHoursStr = String(totalHours).padStart(2, '0');
    const clockOutTimeMinutesStr = String(totalMinutes).padStart(2, '0');

    return `${clockOutTimeHoursStr}:${clockOutTimeMinutesStr}`;
  }
  const calculateTotalHours = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime === '-' || clockOutTime === '-') return '00:00';

    const clockInTimeMinutes = timeToMinutes(clockInTime);
    const clockOutTimeMinutes = timeToMinutes(clockOutTime);
    const totalMinutes = clockOutTimeMinutes - clockInTimeMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Always prevent default first
    console.log("newReport", newReport)


    if (newReport.clockInTime) {

      const totalHours = calculateTotalHours(newReport.clockInTime ?? "", newReport.clockOutTime ?? "");
      newReport.total = totalHours;
    }

    if (reportingType != 'total') {
      const newItem: CheckHoursOverlapQuery = {
        clockInTime: newReport.clockInTime || '',
        clockOutTime: newReport.clockOutTime || '',
        date: newReport.date,
        projectID: newReport.projectID || 0,
        employeeID: employee?.id || 0,
        hourReportID: editingReportId || 0
      };
      const hasHoursOverlap = await hourReportService.CheckHoursOverlapAsync(newItem);

      if (hasHoursOverlap) {
        setErrorMessage("יש דיווחים החופפים בשעות");
        return;
      }
    }
    let updateReport: any = null
    if (editingReportId) {
      updateReport = await insertProjectHourReport(newReport, "UpdateProjectHourReportAsync")
    }
    else {
      updateReport = await insertProjectHourReport(newReport, "InsertProjectHourReportAsync")
    }
if(updateReport===null){
      setErrorMessage("אירעה שגיאה בשמירת הדוח. אנא נסה/י שוב.");
}


    // ✅ Close only after successful handling
    onClose();
  };
  
  const validateTimes = (clockInTime: string, clockOutTime: string) => {
    if (clockInTime && clockOutTime && clockOutTime < clockInTime) {
      setError("שעת יציאה לא יכולה להיות לפני שעת כניסה");
    } else {
      setError(null);
    }
  };
  const closeModal = () => {
    if (error) {
      alert("לא ניתן לסגור את הטופס כל עוד קיימת שגיאה. אנא תקן/י את השדות.");
      return;
    }
    onClose()
    // setIsModalOpen(false)
  };
  const changeReportingType = (type: string) => {
    //changeReportingType(type)
    setReportingType(type);
    if (type == 'total') {
      setNewReport({ ...newReport, clockInTime: undefined, clockOutTime: undefined })
    }
    else {
      setNewReport((prev: any) => ({
        ...prev,
        clockInTime: "08:00",
        clockOutTime: calculateclockOutTime
      }));
    }

  }
  const submitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (reportingType === 'time-range' && (!newReport.clockInTime || !newReport.clockOutTime)) {
      setError("שעת כניסה ושעת יציאה חייבות להיות מוגדרות");
      return;
    }
    if (error) {
      return;
    }

    handleSubmit(e);
  }
  const onCloseProjectModal = () => {
    setIsOpenProject(false);
    onClose();
  }
  return (
    <div className="text-gray-800 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {isModalOpen && (
        <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="relative pt-1 flex items-center justify-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800 text-center"> {title}</h2>
            <button
              onClick={() => onClose()}
              className="absolute left-0  w-8 h-8 flex items-center justify-center"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

          </div>
          {/* Scrollable body */}
          <div className="p-4 space-y-3 overflow-y-auto">


            <form onSubmit={submitForm} className="2 space-y-2">
              {errorMessage && (<ErrorMessage validateError={String(errorMessage)} />)}
              <div className="space-y-4">
                {/* Project Name and Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שם פרויקט
                    </label>
                    <input
                      type="text"
                      value={selectedProject?.name}
                      onChange={() => setNewReport({ ...newReport, projectID: selectedProject?.id ?? 0 })}
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      תאריך
                    </label>
                    <input
                      type="date"
                      value={currentDay ? currentDay.toISOString().split("T")[0] : ""}
                      onChange={(e) => setNewReport({ ...newReport, date: new Date(e.target.value) })}
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                      disabled
                    />
                  </div>
                </div>

                {/* Reporting Type */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    אופן דיווח שעות
                  </label>
                  <div className="space-y-2">

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportingType === 'time-range'}
                        onChange={() => { setError(null), changeReportingType('time-range') }}
                        className="ml-2 text-blue-500"
                      />
                      <span className="text-sm">משעה עד שעה</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={reportingType === 'total'}
                        onChange={() => { setError(null), changeReportingType('total') }}
                        className="ml-2 text-blue-500"
                      />
                      <span className="text-sm">סה"כ שעות</span>
                    </label>
                  </div>

                  {/* Time Range */}
                  {reportingType === 'time-range' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          שעת כניסה
                        </label>
                        <input
                          type="time"
                          value={newReport.clockInTime}
                          onChange={(e) => setNewReport({ ...newReport, clockInTime: e.target.value })}
                          onBlur={() => {
                            if (newReport.clockInTime && newReport.clockOutTime) {
                              validateTimes(newReport.clockInTime, newReport.clockOutTime)
                            }
                          }
                          }
                          className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          שעת יציאה
                        </label>
                        <input
                          type="time"
                          value={newReport.clockOutTime}
                          onChange={(e) =>
                            setNewReport({ ...newReport, clockOutTime: e.target.value })}
                          onBlur={() => {
                            if (newReport.clockInTime && newReport.clockOutTime) {
                              validateTimes(newReport.clockInTime, newReport.clockOutTime)
                            }
                          }
                          }
                          className={`text-black w-full px-4 py-3 border rounded-lg transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                            } focus:border-transparent`}
                        // disabled={newReport.type === 'חופש'}
                        />
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                      </div>
                    </div>
                  )}

                  {/* Total Hours */}
                  {reportingType === 'total' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        סה"כ שעות
                      </label>
                      <input
                        type="time"
                        // step="0.5"
                        value={
                          newReport.total
                            ? newReport.total.padStart(5, "0") // ensures "8:00" → "08:00"
                            : ""
                        }
                        onChange={(e) => setNewReport({ ...newReport, total: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    הערות
                  </label>
                  <textarea

                    value={newReport.notes}
                    onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                    className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={3}
                    placeholder="הערות נוספות (אופציונלי)"
                  />
                </div>
                {/* Contract */}
                {contracts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      חוזה *
                    </label>
                    <select
                      value={newReport.contractID}
                      onChange={(e) => setNewReport({ ...newReport, contractID: Number(e.target.value) })}
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    >
                      <option value="">בחר חוזה</option>
                      {contracts?.map(contract => (
                        <option key={contract.id} value={contract.id}>{contract.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Sub-Contract */}
                {(newReport.contractID ?? 0) > 0 && subContracts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      תת חוזה *
                    </label>
                    <select
                      value={newReport.subContractID}
                      onChange={(e) => setNewReport({ ...newReport, subContractID: Number(e.target.value) })}
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    >
                      <option value="">בחר תת חוזה</option>
                      {subContracts
                        ? subContracts
                          .filter(sc => sc.contractID === newReport.contractID)
                          .map(subContract => (
                            <option key={subContract.id} value={subContract.id}>
                              {subContract.name}
                            </option>
                          )) : null
                      }
                    </select>
                  </div>
                )}
                {/* Step */}
                {(newReport.subContractID ?? 0) > 0 || (selectedProject?.hoursReportMethodID != 5 && selectedProject?.hoursReportMethodID != 3) && steps && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      שלב *
                    </label>
                    <select
                      onFocus={() => { console.log("steps-list", newReport) }}
                      value={newReport.stepID}
                      onChange={(e) => setNewReport({ ...newReport, stepID: Number(e.target.value) })}
                      className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                    >
                      <option value="">בחר שלב</option>
                      {steps
                        ? steps
                          .filter(step =>
                            newReport.subContractID === 0 || newReport.subContractID === null ||
                            step.subContractID === newReport.subContractID)
                          .map(step => (
                            <option key={step.id} value={step.id}>
                              {step.name}
                            </option>
                          )) : null
                      }
                    </select>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                  >
                    ביטול
                  </button>
                  <button
                    type="submit"
                    // onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    שמור דיווח
                  </button>

                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {isOpenProject && (
        <ProjectFilter
          isOpen={isOpenProject}
          projectsList={projectsList}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          handleOk={handleOk}
          onClose={() => onCloseProjectModal()}
        />
      )}
    </div>
  );
}