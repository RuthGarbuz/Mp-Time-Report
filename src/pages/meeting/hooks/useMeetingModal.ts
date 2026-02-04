/**
 * useMeetingModal Hook
 * 
 * Manages meeting modal form state and logic:
 * - Form state management
 * - Validation
 * - Save/update operations
 * - Delete operations
 * - Recurrence configuration
 * - AutoComplete selections
 */

import { useState, useEffect, useCallback } from 'react';
import type { CalendarDataModal, CalendarEventDto, CalendarPartData, Global } from '../../../interface/meetingModel';
import type { Project } from '../../../interface/projectModel';
import type { SelectEmployeesList } from '../../../interface/MaimModel';
import { getProjectsList } from '../../../services/TaskService';
import meetingService from '../../../services/meetingService';
import employeeService from '../../../services/employeeService';
import { 
  formatDate, 
  formatTime, 
  combineDateTime,
  MeetingValidator,
  type MeetingFormErrors,
  resetFormErrors,
  hasFormErrors
} from '../models';

interface UseMeetingModalProps {
  event?: CalendarDataModal;
  isRecurrence?: boolean;
  userID?: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  checkRrecurrenceChild: (recurrenceId?: string) => boolean;
}

export function useMeetingModal({
  event,
  isRecurrence,
  userID,
  setIsOpen,
  checkRrecurrenceChild
}: UseMeetingModalProps) {
  // ============================================================================
  // State - Form Data
  // ============================================================================
  
  const initialForm = event;
  const [form, setForm] = useState<CalendarDataModal | undefined>(event);
  const [errors, setErrors] = useState<MeetingFormErrors>(resetFormErrors());
  const [isSaving, setIsSaving] = useState(false);
  
  // ============================================================================
  // State - Dropdown Lists
  // ============================================================================
  
  const [projectsList, setProjectsList] = useState<Project[]>([
    { id: 0, name: 'Loading...', hoursReportMethodID: 0 }
  ]);
  const [citiesList, setCitiesList] = useState<Global[]>([]);
  const [statuseList, setStatuseList] = useState<Global[] | null>(null);
  const [categoryList, setCategoryList] = useState<Global[] | null>(null);
  const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>([]);
  
  // ============================================================================
  // State - Selected Items (for AutoComplete)
  // ============================================================================
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCity, setSelectedCity] = useState<Global | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectEmployeesList | null>(null);
  
  // ============================================================================
  // State - Confirmation Dialogs
  // ============================================================================
  
  const [isDeleteAllExceptions, setIsDeleteAllExceptions] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isDeleteSeriesConfirm, setIsDeleteSeriesConfirm] = useState(false);
  
  // ============================================================================
  // Load Data on Mount
  // ============================================================================
  
  useEffect(() => {
    const init = async () => {
      try {
        setForm(event);
        
        // Load projects
        const projectsData = await getProjectsList();
        if (projectsData) {
          setProjectsList(projectsData as Project[]);
        }
        
        // Load employees
        const employeeData: SelectEmployeesList[] = await employeeService.getEmployeesList();
        if (employeeData) {
          setEmployeesList(employeeData);
        }
        
        // Load cities/statuses/categories from localStorage or API
        const storedData = localStorage.getItem("meetingDataLists");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setCitiesList(parsedData?.citiesList || []);
          setStatuseList(parsedData?.statuseList || null);
          setCategoryList(parsedData?.categoryList || null);
        } else {
          const dataList = await meetingService.getMeetingDataLists();
          setCitiesList(dataList?.citiesList || []);
          setStatuseList(dataList?.statuseList || null);
          setCategoryList(dataList?.categoryList || null);
          localStorage.setItem("meetingDataLists", JSON.stringify(dataList));
        }
      } catch (err) {
        console.error("Error initializing modal:", err);
      }
    };
    
    if (event) init();
  }, [event]);
  
  // ============================================================================
  // Sync Selected Items with Form (AutoComplete)
  // ============================================================================
  
  useEffect(() => {
    setSelectedCity(
      form?.calendarPartData.cityID
        ? citiesList.find(c => c.id === form.calendarPartData.cityID) || null
        : null
    );
  }, [citiesList, form?.calendarPartData.cityID]);

  useEffect(() => {
    setSelectedEmployee(
      form?.calendarEventDto.employeeId
        ? employeesList.find(e => e.id === form.calendarEventDto.employeeId) || null
        : userID
          ? employeesList.find(e => e.id === userID) || null
          : null
    );
  }, [employeesList, form?.calendarEventDto.employeeId, userID]);

  useEffect(() => {
    setSelectedProject(
      form?.calendarPartData.projectID
        ? projectsList.find(p => p.id === form.calendarPartData.projectID) || null
        : null
    );
  }, [projectsList, form?.calendarPartData.projectID]);
  
  // ============================================================================
  // Form Update Handlers
  // ============================================================================
  
  const updateForm = useCallback((field: keyof CalendarEventDto | keyof CalendarPartData, value: any) => {
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
     if (field === 'title' ) {
      setErrors(prev => ({ ...prev, ['subject']: '' }));
    }
     if (field==='start' || field==='end') {
      setErrors(prev => ({ ...prev, ['time']: '' }));
    }
  }, [form]);

  const setDateChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate === "") return;
    
    const timePart = formatTime(form?.calendarEventDto.start || new Date().toISOString());
    updateForm('start', combineDateTime(newDate, timePart));
    
    const timeEndPart = formatTime(form?.calendarEventDto.end || new Date().toISOString());
    updateForm('end', combineDateTime(newDate, timeEndPart));
    
    if (form?.calendarEventDto.type === 1) {
      const timeRulePart = formatTime(
        form?.calendarEventDto.rRule?.dtStart || form?.calendarEventDto.start || new Date().toISOString()
      );
      updateForm('rRule', { 
        ...form?.calendarEventDto.rRule, 
        dtStart: combineDateTime(newDate, timeRulePart) 
      });
    }
  }, [form, updateForm]);

  const updateHours = useCallback((isFullDay: boolean) => {
    if (!isFullDay) {
      updateForm('start', combineDateTime(
        formatDate(form?.calendarEventDto.start || new Date().toISOString()), 
        "08:00"
      ));
      updateForm('end', combineDateTime(
        formatDate(form?.calendarEventDto.start || new Date().toISOString()), 
        "08:30"
      ));
    } else {
      updateForm('start', formatDate(form?.calendarEventDto.start || new Date().toISOString()));
      updateForm('end', formatDate(form?.calendarEventDto.start || new Date().toISOString()));
    }
  }, [form, updateForm]);
  
  // ============================================================================
  // AutoComplete Handlers
  // ============================================================================
  
  const handleProjectSelect = useCallback((project: Project) => {
    setSelectedProject(project);
    setForm((prev: any) => ({
      ...prev,
      calendarPartData: {
        ...prev.calendarPartData,
        projectID: project.id,
        projectName: project.name
      }
    }));
  }, []);

  const handleCitySelect = useCallback((city: Global) => {
    setSelectedCity(city);
    setForm((prev) => prev ? ({
      ...prev,
      calendarPartData: {
        ...prev.calendarPartData,
        cityID: city.id ?? 0,
      }
    }) : prev);
  }, []);

  const handleEmployeeSelect = useCallback((emp: SelectEmployeesList) => {
    updateForm('employeeId', emp.id || userID);
    setSelectedEmployee(emp ? emp : null);
  }, [updateForm, userID]);
  
  // ============================================================================
  // Recurrence Handlers
  // ============================================================================
  
  const toggleRecurrenceDay = useCallback((day: string) => {
    setForm(prev => prev ? ({
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
  }, []);
  
  // ============================================================================
  // Validation
  // ============================================================================
  
  const validateForm = useCallback((): boolean => {
    const newErrors = MeetingValidator.validate(form);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  }, [form]);
  
  // ============================================================================
  // Save Handler
  // ============================================================================
  
  const hasChanges = useCallback(() => {
    return JSON.stringify(form) !== JSON.stringify(initialForm);
  }, [form, initialForm]);

  const handleBeforeSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      setIsOpen(false);
      return;
    }

    if (form?.calendarEventDto.recurrenceId && form?.calendarEventDto.type === 1) {
      const hasChild = checkRrecurrenceChild(form?.calendarEventDto.recurrenceId);
      if (hasChild) {
        setIsDeleteAllExceptions(true);
        return;
      }
    }
    
    handleSubmit();
  }, [form, hasChanges, checkRrecurrenceChild, setIsOpen]);

  const handleSubmit = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);

    if (validateForm()) {
      let isInserted = false;

      if (form?.calendarEventDto.id && 
          form.calendarEventDto.id > 0 && 
          form.calendarEventDto.type !== 4) {
        if (form.calendarEventDto.type === 3 && isRecurrence) {
          isInserted = true;
        } else {
          isInserted = false;
        }
      } else {
        isInserted = true;
      }

      const data = isInserted
        ? await meetingService.insertUpdateMeetingsData(form!, "InsertMeetingDataAsync")
        : await meetingService.insertUpdateMeetingsData(form!, "UpdateMeetingDataAsync");

      if (!data) {
        alert('הפגישה נכשלה בהוספה!');
      }
      
      setIsOpen(false);
    }

    setIsSaving(false);
  }, [isSaving, form, validateForm, isRecurrence, setIsOpen]);
  
  // ============================================================================
  // Delete Handlers
  // ============================================================================
  
  const handleDeleteClick = useCallback(() => {
    const type = event?.calendarEventDto.type;
    if (type === 1) {
      setIsDeleteSeriesConfirm(true);
    } else {
      setIsDeleteConfirm(true);
    }
  }, [event]);

  const deleteSingleOccurrence = useCallback(async () => {
    if (!event) return;
    const dto = event.calendarEventDto;

    if (dto.type === 0) {
      // Single meeting
      await meetingService.deleteMeeting(dto, false);
      setIsOpen(false);
      return;
    }

    if (dto.type === 3) {
      if (event.calendarEventDto.id > 0) {
        await meetingService.UpdateAppointmentType(event.calendarEventDto.id);
      } else {
        // Exception -> change to type=4
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
  }, [event, setIsOpen]);

  const deleteWholeSeries = useCallback(async () => {
    if (!event) return;
    await meetingService.deleteMeeting(event.calendarEventDto, true);
    setIsOpen(false);
  }, [event, setIsOpen]);
  
  // ============================================================================
  // Helper Functions
  // ============================================================================
  
  const getMeetingTitle = useCallback(() => {
    if (form?.calendarEventDto.type === 3) return `פגישה חריגה - ${form.calendarEventDto.title}`;
    if (form?.calendarEventDto.type === 1) return `פגישה מחזורית - ${form.calendarEventDto.title}`;
    if (form?.calendarEventDto.title === "") return `פגישה חדשה `;
    return `פגישה - ${form?.calendarEventDto.title}`;
  }, [form]);
  
  // ============================================================================
  // Return Public API
  // ============================================================================
  
  return {
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
  };
}
