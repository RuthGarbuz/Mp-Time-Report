import { useEffect, useState } from 'react';

import { X, Calendar, Clock, MapPin, Link2, FileText, Bell, Repeat } from 'lucide-react';
import type { CalendarDataModal, CalendarEventDto, CalendarPartData, Global } from '../../interface/meetingModel';
import type { Project } from '../../interface/interfaces';
import { getProjectsList } from '../../services/TaskService';
import ProjectFilter from '../shared/projectsFilter';
import { Bars3Icon } from '@heroicons/react/24/outline';
import meetingService from '../../services/meetingService';


interface MeetingModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onClose: () => void;
    event?: CalendarDataModal;
    isRecurrence?: boolean;

}

export default function AddMeetingModal(
    {
        isOpen,
        setIsOpen,
        onClose,
        event,
        isRecurrence
    }: MeetingModalProps) {
    const [form, setForm] = useState<CalendarDataModal | undefined>(event);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState(false);
    const [projectsList, setProjectsList] = useState<Project[]>(
        [{ id: 0, name: 'Loading...', hoursReportMethodID: 0 }]
    );
    const [isOpenProject, setIsOpenProject] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [citiesList, setCitiesList] = useState<Global[] | null>(null);
    const [statuseList, setStatuseList] = useState<Global[] | null>(null);
    const [categoryList, setCategoryList] = useState<Global[] | null>(null);
   
    const setOpenProjectList = async () => {
        const projectsData = await getProjectsList();
        if (projectsData) {
            setProjectsList(projectsData as Project[]);
        }
        setIsOpenProject(true);
    }
    useEffect(() => {
        const init = async () => {

            try {
                setForm(event);
                const storedData = localStorage.getItem("meetingDataLists");

                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setCitiesList(parsedData?.citiesList || null);
                    setStatuseList(parsedData?.statuseList || null);
                    setCategoryList(parsedData?.categoryList || null);
                    return; // ✅ already loaded, no need to fetch again
                }

                // Otherwise, fetch from API
                const dataList = await meetingService.getMeetingDataLists();

                // Save in state
                setCitiesList(dataList?.citiesList || null);
                setStatuseList(dataList?.statuseList || null);
                setCategoryList(dataList?.categoryList || null);
                // Save to localStorage for next time
                localStorage.setItem("meetingDataLists", JSON.stringify(dataList));

            } catch (err) {
                console.error("Error initializing modal:", err);
            }
        };
        if (event) init();
    }, [event]);
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
        //return new Date(`${dateStr}T${timeStr}:00`).toISOString();
        return `${dateStr}T${timeStr}:00`;
        //     if (!dateStr || !timeStr) return '';

        // const [year, month, day] = dateStr.split('-').map(Number);
        // const [hour, minute] = timeStr.split(':').map(Number);

        // // יוצר תאריך מקומי
        // const d = new Date(year, month - 1, day, hour, minute, 0);

        // // שמירה כ-UTC עם Z
        // return d.toISOString();
    };
    const handleOk = () => {
        if (selectedProject) {
            setForm((prev: any) => ({
                ...prev,
                calendarPartData: {
                    ...prev.calendarPartData,
                    projectID: selectedProject.id,
                    projectName: selectedProject.name
                }
            }));
        }
        setIsOpenProject(false);

    };

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

            if (start >= end) {
                newErrors.time = 'שעת ההתחלה חייבת להיות קטנה משעת הסיום';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.MouseEvent) => {
          e.preventDefault();

    if (isSaving) return; 
    setIsSaving(true);
        let isInserted = false;
        e.preventDefault();
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
                alert('הפגישה נוספה בהצלחה!');
            }
            onClose();
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
    // const updateForm = (field: keyof typeof form, value: any) => {
    //     const key = field as keyof typeof form;
    //     const keyStr = String(key);
    //     setForm(prev => ({ ...prev, [key]: value }));
    //     if (errors[keyStr]) {
    //         setErrors(prev => ({ ...prev, [keyStr]: '' }));
    //     }
    // };

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
        return `פגישה - ${form?.calendarEventDto.title}`;
    };
    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative pt-1 flex items-center justify-center mb-2">
                    <h2 className="text-lg font-semibold text-gray-800 text-center">{getMeetingTitle()}</h2>
                    <button
                        onClick={() => { setIsOpen(false); }}
                        className="absolute left-0  w-8 h-8 flex items-center justify-center"
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

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            יישוב
                        </label>

                        <div className="relative">
                            {/* Left-side icon */}
                            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
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
                                value={form?.calendarPartData.cityID || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    updateForm('cityID', value === '' ? null : Number(value));
                                }}
                                className="appearance-none w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                            >
                                <option value="">בחר יישוב</option>
                                {citiesList &&
                                    citiesList.map((city) => (
                                        <option key={city.id} value={city.id}>
                                            {city.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                            <Calendar className="inline w-4 h-4 mr-1" />
                            תאריך הפגישה <span className="text-red-500">*</span>
                        </label>

                        <input
                            type="date"
                            value={formatDate(form?.calendarEventDto.start || new Date().toISOString())}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                const timePart = formatTime(form?.calendarEventDto.start || new Date().toISOString());
                                updateForm('start', combineDateTime(newDate, timePart));
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
                            onChange={(e) => updateForm('allDay', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="fullDay" className="mr-2 text-sm text-gray-700">
                            יום שלם
                        </label>
                    </div>

                    {!form?.calendarEventDto.allDay && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
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
    const endDate = formatDate(form?.calendarEventDto.end || form?.calendarEventDto.start|| new Date().toISOString());

    // עדכון שעת ההתחלה
    updateForm("start", combineDateTime(startDate, newStartTime));

    // --- לוגיקה לתיקון אם זמן ההתחלה >= זמן הסיום ---
    const currentEndTime = formatTime(form?.calendarEventDto.end || form?.calendarEventDto.start|| new Date().toISOString());

    const [sH, sM] = newStartTime.split(":").map(Number);
    const [eH, eM] = currentEndTime.split(":").map(Number);

    const startMinutes = sH * 60 + sM;
    const endMinutes = eH * 60 + eM;

    if (startMinutes >= endMinutes && startDate === endDate) {
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                    שעת סיום
                                </label>

                                <input
                                    type="time"
                                    value={formatTime(form?.calendarEventDto.end || '')}
                                    onChange={(e) => {
                                        const newTime = e.target.value;
                                        const datePart = formatDate(form?.calendarEventDto.end || form?.calendarEventDto.start || new Date().toISOString());
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



                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            פרויקט
                        </label>
                        <div className="relative w-full"
                        >
                            <input
                                type="text"
                                value={form?.calendarPartData.projectName || ''}
                                placeholder="בחר פרויקט..."
                                readOnly
                                className="w-full  px-3 py-2 border border-gray-300 rounded-lg text-right focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />

                            {/* כפתור קטן בצד ימין */}
                            <button
                                type="button"
                                onClick={() => setOpenProjectList()}
                                className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
                            >
                                <Bars3Icon className="h-6 w-6" />
                            </button>
                        </div>
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
                                            // initialize rRule when turning on recurrence
                                            updateForm('rRule', { freq: 'daily', dtStart: form?.calendarEventDto.start || new Date().toISOString(), range: 2,count:1,interval:1,byweekdays:['SU']    });
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
                                                            onChange={(e) => updateForm('rRule', { ...form?.calendarEventDto.rRule, count: e.target.value })}
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
                            onClick={handleSubmit}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            שמור פגישה
                        </button>
                    </div>
                </div>
            </div>
            {/* מודאל */}
            {isOpenProject && (
                <ProjectFilter
                    isOpen={isOpenProject}
                    projectsList={projectsList}
                    selectedProject={selectedProject}
                    setSelectedProject={setSelectedProject}
                    handleOk={handleOk}
                    onClose={() => setIsOpenProject(false)}
                />
            )}
        </div>

    );

}