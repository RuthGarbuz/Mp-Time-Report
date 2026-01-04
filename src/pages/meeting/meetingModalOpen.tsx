import { useEffect, useState } from 'react';

import { X, Calendar, Clock, MapPin, Link2, FileText, Bell, Repeat, Trash2 } from 'lucide-react';
import type { CalendarDataModal, CalendarEventDto, CalendarPartData, Global } from '../../interface/meetingModel';
import type { Project } from '../../interface/projectModel';
import type { SelectEmployeesList } from '../../interface/MaimModel';
import { getProjectsList } from '../../services/TaskService';

import meetingService from '../../services/meetingService';
import employeeService from '../../services/employeeService';
import ConfirmModal from '../shared/confirmDeleteModal';
import AutoComplete from "../shared/autoCompleteInput";


interface MeetingModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    checkRrecurrenceChild: (recurrenceId?: string) => boolean;

    event?: CalendarDataModal;
    isRecurrence?: boolean;
    userID?: number;
}

export default function AddMeetingModal(
    {
        isOpen,
        setIsOpen,
        checkRrecurrenceChild,

        event,
        isRecurrence,
        userID
    }: MeetingModalProps) {
    let initialForm = event;
    const [form, setForm] = useState<CalendarDataModal | undefined>(event);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [projectsList, setProjectsList] = useState<Project[]>(
        [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
    );
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [citiesList, setCitiesList] = useState<Global[]>([]);
    const [statuseList, setStatuseList] = useState<Global[] | null>(null);
    const [categoryList, setCategoryList] = useState<Global[] | null>(null);
    const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>([]);

    const [isDeleteAllExeptions, setIsDeleteAllExeptions] = useState(false);
    const [selectedCity, setSelectedCity] = useState<Global | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<SelectEmployeesList | null>(null);

    const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
    const [isDeleteSeriesConfirm, setIsDeleteSeriesConfirm] = useState(false);

    const handleDeleteClick = () => {
        const type = event?.calendarEventDto.type;
        if (type === 1) {
            // recurring series
            setIsDeleteSeriesConfirm(true);
        } else {
            // single or exception
            setIsDeleteConfirm(true);
        }
    };
    const deleteSingleOccurrence = async () => {
        if (!event) return;
        const dto = event.calendarEventDto;

        if (dto.type === 0) {
            // single meeting
            await meetingService.deleteMeeting(dto, false);
            setIsOpen(false);
            return;
        }

        if (dto.type === 3) {
            if (event.calendarEventDto.id > 0) {
                await meetingService.UpdateAppointmentType(event.calendarEventDto.id);
            }
            else {


                // exception -> change to type=4
                const updatedEvent: CalendarDataModal = {
                    ...event,
                    calendarEventDto: {
                        ...event.calendarEventDto,
                        type: 4
                    }
                };
                await meetingService.insertUpdateMeetingsData(updatedEvent, "InsertMeetingDataAsync");
            }
            setIsOpen(false);
            return;
        }


    };

    const deleteWholeSeries = async () => {
        if (!event) return;
        await meetingService.deleteMeeting(event.calendarEventDto, true);
        setIsOpen(false);
    };

    // helper: merge date with time (same as calendar)

    const handleEmployeeSelect = (emp: SelectEmployeesList) => {
        updateForm('employeeId', emp.id || userID);

        setSelectedEmployee(emp ? emp : null);
        //setIsOpenEmployee(false);
    };
    // const updateEmployee = () => {
    //     if (form?.calendarEventDto.employeeId == null || form?.calendarEventDto.employeeId == 0) {
    //         updateForm('employeeId', userID);
    //     }
    // }
    const handleBeforeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasChanges()) {
            setIsOpen(false);
            return;
        }

        if (form?.calendarEventDto.recurrenceId
            && form?.calendarEventDto.type === 1) {
            const hasChild = checkRrecurrenceChild(form?.calendarEventDto.recurrenceId);
            if (hasChild) {
                setIsDeleteAllExeptions(true);
                return;
            }
        }
        handleSubmit();
    }
    const hasChanges = () => {
        return JSON.stringify(form) !== JSON.stringify(initialForm);
    };
    // const setOpenProjectList = async () => {
    //     const projectsData = await getProjectsList();
    //     if (projectsData) {
    //         setProjectsList(projectsData as Project[]);
    //     }
    //     // setIsOpenProject(true);
    // }

    useEffect(() => {
        const init = async () => {

            try {
                setForm(event);
                const projectsData = await getProjectsList();
                if (projectsData) {
                    setProjectsList(projectsData as Project[]);
                }
                const employeeData: SelectEmployeesList[] = await employeeService.getEmployeesList();
                if (employeeData) {
                    setEmployeesList(employeeData);
                }
                const storedData = localStorage.getItem("meetingDataLists");

                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setCitiesList(parsedData?.citiesList || null);
                    setStatuseList(parsedData?.statuseList || null);
                    setCategoryList(parsedData?.categoryList || null);
                    return; // ✅ already loaded, no need to fetch again
                }
                else {
                    // Otherwise, fetch from API
                    const dataList = await meetingService.getMeetingDataLists();

                    // Save in state
                    setCitiesList(dataList?.citiesList || []);
                    setStatuseList(dataList?.statuseList || null);
                    setCategoryList(dataList?.categoryList || null);
                    // Save to localStorage for next time
                    localStorage.setItem("meetingDataLists", JSON.stringify(dataList));
                }
            } catch (err) {
                console.error("Error initializing modal:", err);
            }
        };
        if (event) init();
    }, [event]);
    useEffect(() => {
        setSelectedCity(form?.calendarPartData.cityID ? citiesList!.find(c => c.id === form.calendarPartData.cityID) || null : null);
    }, [citiesList]);
    useEffect(() => {
        setSelectedEmployee(form?.calendarEventDto.employeeId ? employeesList!.find(e => e.id === form.calendarEventDto.employeeId) || null : userID ? employeesList!.find(e => e.id === userID) || null : null);
    }, [employeesList]);
    useEffect(() => {
        setSelectedProject(form?.calendarPartData.projectID ? projectsList!.find(p => p.id === form.calendarPartData.projectID) || null : null);
    }, [projectsList]);
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const d = new Date(dateStr); // קורא UTC → הופך ל־LOCAL אוטומטית
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    // helper: Converts Date to "HH:mm"
    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";

        const d = new Date(dateStr); // UTC → ישראל

        const hours = String(d.getHours()).padStart(2, "0");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    };

    // helper: Combine date + time into ISO string
    const combineDateTime = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return '';
        return `${dateStr}T${timeStr}:00`;
    };
    const handleProjectSelect = (project: Project) => {
        setSelectedProject(project);
        setForm((prev: any) => ({
            ...prev,
            calendarPartData: {
                ...prev.calendarPartData,
                projectID: project.id,
                projectName: project.name
            }
        }));
    }



    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!form?.calendarEventDto.title.trim()) {
            newErrors.subject = 'נושא הפגישה הוא שדה חובה';
        }

        if (!form?.calendarEventDto.start) {
            newErrors.date = 'תאריך הפגישה הוא שדה חובה';
        }
        if (!form?.calendarEventDto.allDay && form?.calendarEventDto.start && form?.calendarEventDto.end) {
            // לחלץ את השעה מה־ISO string
            const startTime = new Date(form.calendarEventDto.start).toTimeString().slice(0, 5); // "10:30"
            const endTime = new Date(form.calendarEventDto.end).toTimeString().slice(0, 5);     // "17:00"

            // לבנות זמני השוואה
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);

            const diffMs = end.getTime() - start.getTime();

            const fiveMinutes = 5 * 60 * 1000;

            if (diffMs < fiveMinutes) {
                newErrors.time = 'שעת הסיום חייבת להיות לפחות 5 דקות אחרי שעת ההתחלה';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (isSaving) return;

        setIsSaving(true);
        let isInserted = false;

        if (validateForm()) {
            let data: any
            if (form?.calendarEventDto.id && form.calendarEventDto.id > 0 && form.calendarEventDto.type !== 4) {
                if (form.calendarEventDto.type === 3 && isRecurrence) {
                    isInserted = true;
                } else {
                    isInserted = false;
                }
            } else {
                isInserted = true;
            }
            data = isInserted ?
                await meetingService.insertUpdateMeetingsData(form!, "InsertMeetingDataAsync") :
                await meetingService.insertUpdateMeetingsData(form!, "UpdateMeetingDataAsync");
            if (!data) {
                alert('הפגישה נכשלה בהוספה!');
            }
            setIsOpen(false);
            // setIsOpen(false);
        }
        setIsSaving(false);

    };
    const updateForm = (field: keyof CalendarEventDto | keyof CalendarPartData, value: any) => {
        if (!form) return;

        if (field in form.calendarEventDto) {
            setForm(prev => prev ? {
                ...prev,
                calendarEventDto: { ...prev.calendarEventDto, [field]: value }
            } : prev);
        } else if (field in form.calendarPartData) {
            setForm(prev => prev ? {
                ...prev,
                calendarPartData: { ...prev.calendarPartData, [field]: value }
            } : prev);
        }
    };


    const toggleRecurrenceDay = (day: string) => setForm(prev => prev ? ({
        ...prev,
        calendarEventDto: {
            ...prev.calendarEventDto,
            rRule: {
                ...prev.calendarEventDto.rRule,
                byweekdays: prev.calendarEventDto.rRule?.byweekdays?.includes(day)
                    ? prev.calendarEventDto.rRule.byweekdays.filter(d => d !== day)
                    : [...prev.calendarEventDto.rRule?.byweekdays || [], day],
            } as CalendarEventDto['rRule']
        }
    }) : prev);

    const weekDays = [
        { value: 'SU', label: 'א' },
        { value: 'MO', label: 'ב' },
        { value: 'TU', label: 'ג' },
        { value: 'WE', label: 'ד' },
        { value: 'TH', label: 'ה' },
        { value: 'FR', label: 'ו' },
        { value: 'SA', label: 'ש' }
    ];
    const getMeetingTitle = () => {
        if (form?.calendarEventDto.type === 3) return `פגישה חריגה - ${form.calendarEventDto.title}`;
        if (form?.calendarEventDto.type === 1) return `פגישה מחזורית - ${form.calendarEventDto.title}`;
        if (form?.calendarEventDto.title === "") return `פגישה חדשה `;
        return `פגישה - ${form?.calendarEventDto.title}`;
    };
    if (!isOpen) return null;

    function setDateChanged(e: React.ChangeEvent<HTMLInputElement>) {
        const newDate = e.target.value;
        if (newDate == "") return;
        const timePart = formatTime(form?.calendarEventDto.start || new Date().toISOString());
        updateForm('start', combineDateTime(newDate, timePart));
        const timeEndPart = formatTime(form?.calendarEventDto.end || new Date().toISOString());
        updateForm('end', combineDateTime(newDate, timeEndPart));
        if (form?.calendarEventDto.type == 1) {
            const timeRulePart = formatTime(form?.calendarEventDto.rRule?.dtStart || form?.calendarEventDto.start || new Date().toISOString());

            updateForm('rRule', { ...form?.calendarEventDto.rRule, dtStart: combineDateTime(newDate, timeRulePart) })
        }
    }
    const updateHours = (isFullDay: boolean) => {
        if (!isFullDay) {
            updateForm('start', combineDateTime(formatDate(form?.calendarEventDto.start || new Date().toISOString()), "08:00"));
            updateForm('end', combineDateTime(formatDate(form?.calendarEventDto.start || new Date().toISOString()), "08:30"));
        }
        else {
            updateForm('start', formatDate(form?.calendarEventDto.start || new Date().toISOString()));
            updateForm('end', formatDate(form?.calendarEventDto.start || new Date().toISOString()));
        }
    }

    const handleCitySelect = (city: Global) => {
        setSelectedCity(city);
        setForm((prev) => prev ? ({
            ...prev,
            calendarPartData: {
                ...prev.calendarPartData,
                cityID: city.id ?? 0,
            }
        }) : prev);
    };
    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="text-gray-800 bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative pt-1 flex items-center justify-between mb-2 px-2">
                    {event?.calendarEventDto.title !== "" && (
                        <button
                            onClick={handleDeleteClick}
                            className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700"
                            title="מחק"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                    <h2 className="text-lg font-semibold text-gray-800 text-center flex-1">
                        {getMeetingTitle()}
                    </h2>
                    <button
                        onClick={() => { setIsOpen(false); }}
                        className="w-8 h-8 flex items-center justify-center"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 space-y-3 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                            נושא הפגישה <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form?.calendarEventDto.title}
                            onChange={(e) => updateForm('title', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                }`}

                            placeholder="הזן נושא"
                        />

                        {errors.subject && (
                            <p className="text-red-500 text-xs mt-1 text-right">{errors.subject}</p>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                            קישור לפגישה
                        </label>
                        <input
                            type="url"
                            value={form?.calendarPartData.meetingLink || ''}
                            onChange={(e) => updateForm('meetingLink', e.target.value)}
                            className="w-full px-3 py-2 pr-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            placeholder="https://zoom.us/j/123456789"
                        />

                        {form?.calendarPartData.meetingLink && (
                            <a
                                href={form.calendarPartData.meetingLink.startsWith('http') ? form.calendarPartData.meetingLink : `https://${form.calendarPartData.meetingLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute pt-6 left-3 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
                                title="פתח קישור"
                            >
                                <Link2 className="w-5 h-5" />
                            </a>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            מיקום
                        </label>

                        <input
                            type="text"
                            value={form?.calendarPartData.location || ''}
                            onChange={(e) => updateForm('location', e.target.value)}
                            placeholder="כתובת מדויקת"
                            className="w-full px-3 py-2  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                        />

                        {form?.calendarPartData.location && form.calendarPartData.cityID && (
                            <a
                                href={`https://waze.com/ul?q=${encodeURIComponent(
                                    `${form.calendarPartData.location} ${citiesList?.find(c => c.id === form.calendarPartData.cityID)?.name || ''}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute pt-6 left-3 top-1/2 -translate-y-1/2"
                                title="פתח ב־Waze"
                            >
                                <img
                                    src="/wazeURL.png"
                                    alt="Waze"
                                    className="w-5 h-5"
                                />
                            </a>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            יישוב
                        </label>


                        <AutoComplete
                            items={citiesList}
                            selectedItem={selectedCity}
                            onSelect={(city) => {
                                handleCitySelect(city);
                            }}
                            getItemId={(city) => city.id}
                            getItemLabel={(city) => city.name}
                            placeholder="בחר עיר..."
                            height={2}
                        />

                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            תאריך הפגישה <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="date"
                            //disabled={form?.calendarEventDto.type === 3&& initialForm?.calendarEventDto.allDay }
                            value={formatDate(form?.calendarEventDto.start || new Date().toISOString())}
                            onChange={(e) => {
                                setDateChanged(e);

                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right ${errors.date ? 'border-red-500' : 'border-gray-300'
                                }`}
                        />

                        {errors.date && (
                            <p className="text-red-500 text-xs mt-1 text-right">{errors.date}</p>
                        )}
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="fullDay"
                            checked={form?.calendarEventDto.allDay}
                            onChange={(e) => { updateHours(e.target.checked); updateForm('allDay', e.target.checked) }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        // disabled={form?.calendarEventDto.type === 1}
                        />
                        <label htmlFor="fullDay" className="mr-2 text-sm text-gray-700">
                            יום שלם
                        </label>
                    </div>

                    {!form?.calendarEventDto.allDay && (
                        <div className="grid grid-cols-2 gap-3 w-full mt-2">
                            <div className="min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                    <Clock className="inline w-4 h-4 mr-1" />
                                    שעת התחלה
                                </label>

                                <input
                                    type="time"
                                    value={formatTime(form?.calendarEventDto.start || new Date().toISOString())}
                                    onChange={(e) => {
                                        const newStartTime = e.target.value;

                                        const startDate = formatDate(form?.calendarEventDto.start || new Date().toISOString());
                                        const endDate = formatDate(form?.calendarEventDto.end || form?.calendarEventDto.start || new Date().toISOString());

                                        // עדכון שעת ההתחלה
                                        updateForm("start", combineDateTime(startDate, newStartTime));

                                        // --- לוגיקה לתיקון אם זמן ההתחלה >= זמן הסיום ---
                                        const currentEndTime = formatTime(form?.calendarEventDto.end || form?.calendarEventDto.start || new Date().toISOString());

                                        const [sH, sM] = newStartTime.split(":").map(Number);
                                        const [eH, eM] = currentEndTime.split(":").map(Number);

                                        const startMinutes = sH * 60 + sM;
                                        const endMinutes = eH * 60 + eM;

                                        if (startMinutes >= endMinutes) {
                                            // הוספת שעה בצורה בטוחה
                                            const newEndMinutes = (startMinutes + 30) % (24 * 60);
                                            const newEndH = String(Math.floor(newEndMinutes / 60)).padStart(2, "0");
                                            const newEndM = String(newEndMinutes % 60).padStart(2, "0");
                                            const correctedEndTime = `${newEndH}:${newEndM}`;

                                            updateForm("end", combineDateTime(endDate, correctedEndTime));
                                        }
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                />
                            </div>

                            <div className="min-w-0">
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                    שעת סיום
                                </label>

                                <input
                                    type="time"
                                    value={formatTime(form?.calendarEventDto.end || '')}
                                    onChange={(e) => {
                                        const newTime = e.target.value;
                                        const datePart = formatDate(form?.calendarEventDto.start || new Date().toISOString());
                                        updateForm('end', combineDateTime(datePart, newTime));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                />
                            </div>
                        </div>
                    )}
                    {errors.time && (

                        <p className="text-red-500 text-xs text-right">{errors.time}</p>

                    )}




                    <div className="relative w-full" >

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            פרויקט
                        </label>

                        <AutoComplete
                            items={projectsList}
                            selectedItem={selectedProject}
                            onSelect={(project) => {
                                handleProjectSelect(project);
                                // update your state with project.id
                            }}
                            getItemId={(project: any) => project.id}
                            getItemLabel={(project: any) => project.name}
                            placeholder="בחר פרויקט..."
                            height={2}
                        />

                    </div>

                    <div className="relative w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            עובד<span className="text-red-500">*</span>
                        </label>
                        {form?.calendarEventDto.type !== 3 ? (
                            <>
                                <AutoComplete
                                    items={employeesList}
                                    selectedItem={selectedEmployee}
                                    onSelect={(employee) => {
                                        handleEmployeeSelect(employee);
                                        // update your state with employee.id
                                    }}
                                    getItemId={(employee: any) => employee.id}
                                    getItemLabel={(employee: any) => employee.name}
                                    placeholder="בחר עובד..."
                                    height={2}
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={selectedEmployee?.name || ''}
                                    disabled={true}
                                    className="w-full  px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent
                             disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </>
                        )}


                        {/* {errorRecipient && <p className="text-red-500 text-sm mt-1">{errorRecipient}</p>} */}
                    </div>
                    {/* פגישה חזורית */}
                    {form?.calendarEventDto.type !== 3 && (
                        <div className="border-t pt-4">
                            <div className="flex items-center mb-3">
                                <input type="checkbox"
                                    id="recurring"
                                    checked={form?.calendarEventDto.type === 1}
                                    onChange={e => {
                                        const isChecked = e.target.checked;
                                        updateForm('type', isChecked ? 1 : 0);

                                        if (isChecked && !form?.calendarEventDto.rRule) {
                                            updateForm('rRule', { freq: 'daily', dtStart: form?.calendarEventDto.start || new Date().toISOString(), range: 2, count: 1, interval: 1, byweekdays: ['SU'] });
                                        }
                                    }}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-2" />
                                <label htmlFor="recurring" className="text-sm font-medium text-gray-700"><Repeat className="inline w-4 h-4 mr-1" />פגישה מחזורית</label>
                            </div>

                            {form?.calendarEventDto.type === 1 && (
                                <div className="space-y-4 pr-6 bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">תבנית חזרה</label>
                                        <select
                                            value={form?.calendarEventDto.rRule?.freq}
                                            onChange={e => updateForm('rRule', { ...form?.calendarEventDto.rRule, freq: e.target.value as "daily" | "weekly" | "monthly" | "yearly" })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-right"
                                        >
                                            <option value="daily">יומי</option>
                                            <option value="weekly">שבועי</option>
                                            <option value="monthly">חודשי</option>
                                            <option value="yearly">שנתי</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">כל</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="99"
                                                value={form?.calendarEventDto.rRule?.interval || 1}
                                                onChange={e => updateForm('rRule', { ...form?.calendarEventDto.rRule, interval: e.target.value })}
                                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right" />

                                            <span className="text-sm text-gray-600">
                                                {form?.calendarEventDto.rRule?.freq === 'daily' && 'ימים'}
                                                {form?.calendarEventDto.rRule?.freq === 'weekly' && 'שבועות'}
                                                {form?.calendarEventDto.rRule?.freq === 'monthly' && 'חודשים'}
                                                {form?.calendarEventDto.rRule?.freq === 'yearly' && 'שנים'}
                                            </span>
                                        </div>
                                    </div>



                                    {/* בחירת ימים בשבוע - רק לחזרה שבועית */}

                                    {form?.calendarEventDto.rRule?.freq === 'weekly' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                                                חזור בימים
                                            </label>
                                            <div className="flex gap-2">
                                                {weekDays.map(day => (
                                                    <button
                                                        key={day.value}

                                                        type="button"
                                                        onClick={() => toggleRecurrenceDay(day.value)}
                                                        className={`w-10 h-10 rounded-full font-medium transition-colors ${form?.calendarEventDto.rRule?.byweekdays?.includes(day.value)
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {day.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* סיום חזרה */}
                                    <div>

                                        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                                            סיום
                                        </label>

                                        <div className="space-y-3">
                                            {/* לעולם לא */}
                                            {/* <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="never"
                                                name="recurrenceEnd"
                                                value={0}
                                                checked={form?.calendarEventDto.rRule?.range==0 }
                                                onChange={(e) => updateForm('rRule', { ...form?.calendarEventDto.rRule, range: e.target.value })}
                                                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 ml-2"
                                            />
                                            <label htmlFor="never" className="text-sm text-gray-700">
                                                לעולם לא
                                            </label>
                                        </div> */}

                                            {/* סיום בתאריך */}
                                            {/* <div className="flex items-start gap-2">
                                            <input
                                                type="radio"
                                                id="endDate"
                                                name="recurrenceEnd"
                                                value={1}
                                                checked={form?.calendarEventDto.rRule?.range==1}
                                                onChange={(e) => updateForm('rRule', { ...form?.calendarEventDto.rRule, range: e.target.value })}
                                                className="w-4 h-4 mt-2 text-blue-600 border-gray-300 focus:ring-blue-500 ml-2"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="endDate" className="block text-sm text-gray-700 mb-1 text-right">
                                                    סיום בתאריך
                                                </label>
                                                {form?.calendarEventDto.rRule?.range==1 && (
                                                   <input
  type="date"
  value={form?.calendarEventDto.rRule?.until ? form?.calendarEventDto.rRule.until.split('T')[0] : ''}
  onChange={(e) =>
    updateForm('rRule', { ...form?.calendarEventDto.rRule, until: e.target.value })
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
/>
                                                )}
                                            </div>
                                        </div> */}

                                            {/* סיום אחרי מספר מופעים */}
                                            <div className="flex items-start gap-2">
                                                {/* <input
                                                type="radio"
                                                id="occurrences"
                                                name="recurrenceEnd"
                                                value={2}
                                                checked={form?.calendarEventDto.rRule?.range==2}
                                                onChange={(e) => updateForm('rRule', { ...form?.calendarEventDto.rRule, range: e.target.value })}
                                                className="w-4 h-4 mt-2 text-blue-600 border-gray-300 focus:ring-blue-500 ml-2"
                                            /> */}
                                                <div className="flex-1">
                                                    {/* <label htmlFor="occurrences" className="block text-sm text-gray-700 mb-1 text-right">
                                                    סיום אחרי
                                                </label> */}
                                                    {/* {form?.calendarEventDto.rRule?.range==2 && ( */}

                                                    <div className="flex items-center gap-2">
                                                        <label htmlFor="occurrences" className="block text-sm text-gray-700 mb-1 text-right">
                                                            סיום אחרי
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max="999"
                                                            value={form?.calendarEventDto.rRule?.count || 1}
                                                            onChange={(e) => updateForm('rRule', {
                                                                ...form?.calendarEventDto.rRule,
                                                                count: parseInt(e.target.value, 10) || 1  // ← Convert to number
                                                            })}
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                                        />
                                                        <span className="text-sm text-gray-600">מופעים</span>
                                                    </div>
                                                    {/* )} */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                            <FileText className="inline w-4 h-4 mr-1" />
                            פירוט
                        </label>
                        <textarea
                            value={form?.calendarPartData.description || ''}
                            onChange={(e) => updateForm('description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-right"
                            placeholder="פרטים נוספים על הפגישה"
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="confidential"
                            checked={form?.calendarPartData.isPrivate}
                            onChange={(e) => updateForm('isPrivate', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-2"
                        />
                        <label htmlFor="confidential" className="text-sm text-gray-700">
                            פגישה חסויה
                        </label>
                    </div>
                    <div>
                        <div className="flex items-center mb-2">
                            <input
                                type="checkbox"
                                id="reminder"
                                checked={form?.calendarPartData.hasReminder}
                                onChange={(e) => updateForm('hasReminder', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-2"
                            />
                            <label htmlFor="reminder" className="text-sm text-gray-700">
                                <Bell className="inline w-4 h-4 mr-1" />
                                תזכורת
                            </label>
                        </div>

                        {form?.calendarPartData.hasReminder && (
                            <select
                                value={form?.calendarPartData.reminderTime || '15'}
                                onChange={(e) => updateForm('reminderTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            >
                                <option value="5">5 דקות לפני</option>
                                <option value="15">15 דקות לפני</option>
                                <option value="30">30 דקות לפני</option>
                                <option value="60">שעה לפני</option>
                                <option value="1440">יום לפני</option>
                            </select>

                        )}

                    </div>


                    {/* סטטוס הפגישה */}
                    <div className="relative mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            סטטוס הפגישה
                        </label>

                        {/* Left-side arrow icon */}
                        <div className="pt-6 pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <select
                            value={form?.calendarPartData.statusID || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                updateForm('statusID', value === '' ? null : Number(value));
                            }}
                            className="appearance-none w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="">בחר סטטוס</option>
                            {statuseList &&
                                statuseList.map((status) => (
                                    <option key={status.id} value={status.id}>
                                        {status.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* סוג הפגישה */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            סוג הפגישה
                        </label>

                        {/* Left-side arrow icon */}
                        <div className="pt-6 pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>

                        <select
                            value={form?.calendarPartData.categoryID || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                updateForm('categoryID', value === '' ? null : Number(value));
                            }}
                            className=" appearance-none w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        >
                            <option value="">בחר סוג פגישה</option>
                            {categoryList &&
                                categoryList.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                        </select>
                    </div>


                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            ביטול
                        </button>
                        <button
                            onClick={(e) => { /* updateEmployee(); */ handleBeforeSubmit(e); }}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            שמור פגישה
                        </button>
                    </div>
                </div>
            </div>
            {/* מודאל */}

            {isDeleteAllExeptions && (
                <ConfirmModal
                    message="שינוי פגישה מחזורית ימחק את כל החריגות שלה. האם אתה בטוח שברצונך להמשיך?"
                    okText="כן"
                    cancelText="לא"
                    onOk={async () => {
                        handleSubmit();
                        setIsDeleteAllExeptions(false);
                    }}
                    onCancel={() => {
                        setIsDeleteAllExeptions(false)
                        setIsOpen(false)
                    }}
                />
            )}
            {/* Delete confirmation modals */}
            {isDeleteConfirm && (
                <ConfirmModal
                    message="האם למחוק את הפגישה?"
                    okText="כן"
                    cancelText="לא"
                    onOk={async () => {
                        await deleteSingleOccurrence();
                        setIsDeleteConfirm(false);
                    }}
                    onCancel={() => setIsDeleteConfirm(false)}
                />
            )}

            {isDeleteSeriesConfirm && (
                <ConfirmModal
                    message="האם למחוק את כל הסדרה?"
                    okText="כן"
                    cancelText="לא"
                    onOk={async () => {
                        await deleteWholeSeries();
                        setIsDeleteSeriesConfirm(false);
                    }}
                    onCancel={async () => {
                        // delete single occurrence (create type=4 exception)
                        await deleteSingleOccurrence();
                        setIsDeleteSeriesConfirm(false);
                    }}
                />
            )}
        </div>

    );

}