/**
 * AddMeetingModal Component - Meeting Form Modal
 * 
 * Displays a modal for creating and editing calendar meetings with:
 * - Meeting details (title, date, time, location, link)
 * - Project and employee assignment
 * - Recurring meeting configuration
 * - Status and category selection
 * - Private meeting option
 * - Reminder configuration
 * - Delete operations (single or series)
 * 
 * All business logic extracted to useMeetingModal hook
 * This component handles only UI rendering
 */

import { X, Calendar, Clock, MapPin, Link2, FileText, Bell, Repeat, Trash2 } from 'lucide-react';
import type { CalendarDataModal } from '../../interface/meetingModel';
import ConfirmModal from '../shared/confirmDeleteModal';
import AutoComplete from "../shared/autoCompleteInput";
import { useMeetingModal } from './hooks/useMeetingModal';

interface MeetingModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    checkRrecurrenceChild: (recurrenceId?: string) => boolean;
    event?: CalendarDataModal;
    isRecurrence?: boolean;
    userID?: number;
}

export default function AddMeetingModal({
    isOpen,
    setIsOpen,
    checkRrecurrenceChild,
    event,
    isRecurrence,
    userID
}: MeetingModalProps) {
    
    // ==========================================================================
    // Hook - All business logic extracted
    // ==========================================================================
    
    const {
        // Form state
        form,
        errors,
        isSaving,
        
        // Dropdown lists
        projectsList,
        citiesList,
        statuseList,
        categoryList,
        employeesList,
        
        // Selected items
        selectedProject,
        selectedCity,
        selectedEmployee,
        
        // Confirmation dialogs
        isDeleteAllExceptions,
        isDeleteConfirm,
        isDeleteSeriesConfirm,
        setIsDeleteAllExceptions,
        setIsDeleteConfirm,
        setIsDeleteSeriesConfirm,
        
        // Form handlers
        updateForm,
        setDateChanged,
        updateHours,
        handleProjectSelect,
        handleCitySelect,
        handleEmployeeSelect,
        toggleRecurrenceDay,
        
        // Submit handlers
        handleBeforeSubmit,
        handleSubmit,
        
        // Delete handlers
        handleDeleteClick,
        deleteSingleOccurrence,
        deleteWholeSeries,
        
        // Helpers
        getMeetingTitle,
        formatDate,
        formatTime,
        combineDateTime,
    } = useMeetingModal({
        event,
        isRecurrence,
        userID,
        isOpen,
        setIsOpen,
        checkRrecurrenceChild
    });
    
    
    const weekDays = [
        { value: 'SU', label: 'א' },
        { value: 'MO', label: 'ב' },
        { value: 'TU', label: 'ג' },
        { value: 'WE', label: 'ד' },
        { value: 'TH', label: 'ה' },
        { value: 'FR', label: 'ו' },
        { value: 'SA', label: 'ש' }
    ];
    
    // ==========================================================================
    // Render
    // ==========================================================================
    
    if (!isOpen) return null;
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
                            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                <p className="text-red-500 text-xs mt-1 text-right">{errors.subject}</p>
                            </div>

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

                        {errors.date &&
                            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                                (
                                <p className="text-red-500 text-xs mt-1 text-right">{errors.date}</p>
                                )</div>}
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
                    {errors.time &&
                        <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                            <p className="text-red-500 text-xs text-right">{errors.time}</p>
                        </div>}




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
         {statuseList && (
                            <AutoComplete
                                items={statuseList}
                                selectedItem={form?.calendarPartData.statusID != null && form?.calendarPartData.statusID > 0 ? statuseList?.find(c => c.id === form?.calendarPartData.statusID) : null}
                                onSelect={(status) => updateForm('statusID', status!.id)}
                                getItemId={(c) => c!.id}
                                getItemLabel={(c) => c!.name}
                                placeholder="בחר סטטוס פגישה..."
                                height={2}
                            />
                        )}
                    </div>

                    {/* סוג הפגישה */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            סוג הפגישה
                        </label>
                        {categoryList && (
                            <AutoComplete
                                items={categoryList}
                                selectedItem={form?.calendarPartData.categoryID != null && form?.calendarPartData.categoryID > 0 ? categoryList?.find(c => c.id === form?.calendarPartData.categoryID) : null}
                                onSelect={(category) => updateForm('categoryID', category!.id)}
                                getItemId={(c) => c!.id}
                                getItemLabel={(c) => c!.name}
                                placeholder="בחר סוג פגישה..."
                                height={2}
                            />
                        )}

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
                            disabled={isSaving}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'שומר...' : 'שמור פגישה'}
                        </button>
                    </div>
                </div>
            </div>
            {/* מודאל */}

            {isDeleteAllExceptions && (
                <ConfirmModal
                    message="שינוי פגישה מחזורית ימחק את כל החריגות שלה. האם אתה בטוח שברצונך להמשיך?"
                    okText="כן"
                    cancelText="לא"
                    onOk={async () => {
                        await handleSubmit();
                        setIsDeleteAllExceptions(false);
                    }}
                    onCancel={() => {
                        setIsDeleteAllExceptions(false);
                        setIsOpen(false);
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