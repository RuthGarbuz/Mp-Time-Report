/**
 * useCalendar Hook
 * 
 * Manages all calendar state and logic:
 * - Loading and transforming meeting events
 * - Event selection and editing
 * - Event deletion (single occurrence and series)
 * - Recurrence exception handling
 * - Search functionality
 * - Context menu operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { EventClickArg, EventApi, DateSelectArg } from '@fullcalendar/core';
import type { CalendarDataModal, CalendarEventDto, CalendarPartData } from '../../../interface/meetingModel';
import type { Employee } from '../../../interface/TimeHourModel';
import meetingService from '../../../services/meetingService';
import timeRecordService from '../../../services/timeRecordService';
import {
  transformEventsForCalendar,
  createNewMeeting,
  createExceptionFromRecurring,
  toLocalISOString,
  mergeDateWithTime,
  calculateIndexInSeries,
  datesEqualByDay
} from '../models';

export function useCalendar() {
  // ============================================================================
  // State - Events and Employee
  // ============================================================================
  
  const [events, setEvents] = useState<any[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  // ============================================================================
  // State - Modal Management
  // ============================================================================
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarDataModal | undefined>(undefined);
  const [isRecurrence, setIsRecurrence] = useState(false);
  const [clickedEventInfo, setClickedEventInfo] = useState<EventClickArg | EventApi | null>(null);
  
  // ============================================================================
  // State - Confirmation Dialogs
  // ============================================================================
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(false);
  const [isDeleteSeriesConfirm, setIsDeleteSeriesConfirm] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<EventApi | null>(null);
  
  // ============================================================================
  // State - Search
  // ============================================================================
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  // ============================================================================
  // State - Context Menu
  // ============================================================================
  
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    event: EventApi | null;
  }>({ x: 0, y: 0, event: null });
  
  // ============================================================================
  // Refs
  // ============================================================================
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  
  // ============================================================================
  // Load Employee (on mount)
  // ============================================================================
  
  useEffect(() => {
    const storedEmployee = timeRecordService.getEmployee();
    if (storedEmployee) {
      setEmployee(storedEmployee);
    } else {
      setEmployee(null);
    }
  }, []);
  
  // ============================================================================
  // Load Meetings from API
  // ============================================================================
  
  const loadMeetings = useCallback(async () => {
    const data: CalendarEventDto[] = await meetingService.getMeetingsForFullCalendar();
    setDeleteEvent(null);
    const mapped = transformEventsForCalendar(data);
    setEvents(mapped);
  }, []);
  
  // ============================================================================
  // Search Handler
  // ============================================================================
  
  const handleSearch = useCallback((query: string, calendarRef: any) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Filter events by title (case-insensitive)
    const results = events.filter((event) =>
      event.title?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);

    // Navigate to first result
    if (results.length > 0 && calendarRef?.current) {
      const firstEvent = results[0];
      const calendar = calendarRef.current.getApi();
      
      let eventDate: Date;
      if (firstEvent.start) {
        eventDate = new Date(firstEvent.start);
      } else if (firstEvent.rrule?.dtstart) {
        eventDate = new Date(firstEvent.rrule.dtstart);
      } else {
        return;
      }

      calendar.gotoDate(eventDate);
    }
  }, [events]);
  
  // ============================================================================
  // Context Menu Operations
  // ============================================================================
  
  const openContextMenu = useCallback((e: MouseEvent, event: EventApi) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      event: event,
    });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu({ x: 0, y: 0, event: null });
  }, []);
  
  // ============================================================================
  // Delete Operations
  // ============================================================================
  
  const handleDeleteClick = useCallback((event: EventApi) => {
    setDeleteEvent(event);
    closeContextMenu();

    const type = event.extendedProps.type;

    // Recurring series
    if (type === 1) {
      setIsDeleteSeriesConfirm(true);
    } else {
      setIsDeleteConfirm(true);
    }
  }, [closeContextMenu]);

  const deleteSingleOccurrence = useCallback(async (event: EventApi) => {
    // Type 0: Single meeting - delete directly
    if (event.extendedProps.type === 0) {
      await meetingService.deleteMeeting(event.extendedProps as CalendarEventDto, false);
      return;
    }
    
    // Type 3: Exception - mark as deleted (type=4)
    if (event.extendedProps.type === 3) {
      await meetingService.UpdateAppointmentType(event.extendedProps.id);
      return;
    }

    // Type 1: Recurring - create deletion exception
    const prepared = await prepareDeleteException(event);
    if (!prepared) return;
    
    const rRule = prepared.selected.calendarEventDto.rRule;
    const index = calculateIndexInSeries(rRule, prepared.mergedStart);
    
    const updatedSelected = {
      ...prepared.selected,
      calendarEventDto: {
        ...prepared.selected.calendarEventDto,
        indexInSeries: index,
        type: 4 // Mark as deleted
      }
    };
    
    await meetingService.insertUpdateMeetingsData(
      updatedSelected as CalendarDataModal,
      "InsertMeetingDataAsync"
    );
  }, [employee]);

  const deleteWholeSeries = useCallback(async (event: EventApi) => {
    await meetingService.deleteMeeting(event.extendedProps as CalendarEventDto, true);
    await loadMeetings();
  }, [loadMeetings]);

  async function prepareDeleteException(event: EventApi) {
    const data = await meetingService.getMeetingsData(event.extendedProps.id);
    if (!data) return null;

    const selected: CalendarDataModal = {
      calendarEventDto: {
        ...event.extendedProps as CalendarEventDto,
        employeeId: employee?.id,
        start: toLocalISOString(new Date(event.startStr)),
        end: toLocalISOString(new Date(event.endStr === "" ? event.startStr : event.endStr)),
      },
      calendarPartData: data as CalendarPartData
    };
    
    const clickedDate = new Date(event.start!);
    const parentStart = new Date(selected.calendarEventDto.start);
    const parentEnd = new Date(selected.calendarEventDto.end
      ? selected.calendarEventDto.end
      : clickedDate.getTime() + 30 * 60 * 1000);

    const mergedStart = mergeDateWithTime(clickedDate, parentStart);
    const mergedEnd = mergeDateWithTime(clickedDate, parentEnd);

    return { selected, mergedStart, mergedEnd, clickedEvent: event };
  }
  
  // ============================================================================
  // Create New Meeting
  // ============================================================================
  
  const createNewMeetingAction = useCallback(() => {
    const newEvent = createNewMeeting(employee);
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  }, [employee]);
  
  // ============================================================================
  // Date Selection Handler (create new meeting on calendar)
  // ============================================================================
  
  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const currentView = selectInfo.view.type;
    const isMonthView = currentView === "dayGridMonth";

    const startDate = new Date(selectInfo.startStr);
    const endDate = new Date(selectInfo.endStr);

    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    if (selectInfo.allDay) {
      endDay.setDate(endDay.getDate() - 1);
    }

    // Block multi-day selections
    if (!datesEqualByDay(startDay, endDay)) {
      return selectInfo.view.calendar.unselect();
    }

    let start: string;
    let end: string;
    let allDay: boolean;

    if (isMonthView) {
      // Force non-allDay event with default time 08:00–08:30
      const clickedDate = new Date(selectInfo.startStr);
      clickedDate.setHours(8, 0, 0, 0);
      const endDate = new Date(clickedDate);
      endDate.setMinutes(30);

      start = toLocalISOString(clickedDate);
      end = toLocalISOString(endDate);
      allDay = false;
    } else {
      // Use original selection (week/day view)
      start = toLocalISOString(new Date(selectInfo.startStr));
      end = toLocalISOString(new Date(selectInfo.endStr));
      allDay = selectInfo.allDay ?? false;
    }

    const newEvent = createNewMeeting(employee, start, end, allDay);
    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  }, [employee]);
  
  // ============================================================================
  // Event Click Handler (edit existing meeting)
  // ============================================================================
  
  const handleEventClick = useCallback(async (clickInfo: EventClickArg) => {
    setClickedEventInfo(clickInfo);
    setIsRecurrence(clickInfo.event.extendedProps.type === 1);
    
    const data = await meetingService.getMeetingsData(clickInfo.event.id);
    let dataModal: CalendarDataModal = {
      calendarEventDto: clickInfo.event.extendedProps as CalendarEventDto,
      calendarPartData: data as CalendarPartData
    };

    dataModal = {
      calendarEventDto: {
        ...dataModal.calendarEventDto,
        employeeId: employee?.id || 0,
        start: toLocalISOString(new Date(clickInfo.event.extendedProps.start)),
        end: toLocalISOString(new Date(clickInfo.event.extendedProps.end)),
      },
      calendarPartData: dataModal.calendarPartData
    };

    let selected: CalendarDataModal | undefined;
    if (Array.isArray(dataModal)) {
      selected = dataModal.length > 0 ? dataModal[0] : undefined;
    } else {
      selected = dataModal ?? undefined;
    }
    
    if (!selected) return;
    setSelectedEvent(selected);
    
    if (selected.calendarEventDto.type === 1) {
      // Recurring event - show confirmation
      setPendingEvent(true);
      setShowConfirm(true);
    } else {
      setIsModalOpen(true);
    }
  }, [employee]);
  
  // ============================================================================
  // Event Drag/Resize Handlers
  // ============================================================================
  
  const handleEventDrop = useCallback((dropInfo: any) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === dropInfo.event.id
          ? { 
              ...e, 
              start: toLocalISOString(new Date(dropInfo.event.startStr)), 
              end: toLocalISOString(new Date(dropInfo.event.endStr)) 
            }
          : e
      )
    );
  }, []);

  const handleEventResize = useCallback((resizeInfo: any) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === resizeInfo.event.id
          ? { 
              ...e, 
              start: toLocalISOString(new Date(resizeInfo.event.startStr)), 
              end: toLocalISOString(new Date(resizeInfo.event.endStr)) 
            }
          : e
      )
    );
  }, []);
  
  // ============================================================================
  // Exception Handling
  // ============================================================================
  
  const setExceptionMeetingData = useCallback(async (isDeleted: boolean): Promise<CalendarDataModal | undefined> => {
    if (!selectedEvent || !clickedEventInfo) return;

    const eventApi: EventApi | null =
      ('event' in clickedEventInfo ? (clickedEventInfo as EventClickArg).event : (clickedEventInfo as EventApi)) || null;
    
    if (!eventApi || !eventApi.start) return;
    
    const clickedDateStart = new Date(eventApi.start);
    const exceptionDto = createExceptionFromRecurring(selectedEvent, clickedDateStart, isDeleted);
    
    setSelectedEvent(exceptionDto);
    return exceptionDto;
  }, [selectedEvent, clickedEventInfo]);

  const onCancelConfirm = useCallback(() => {
    if (pendingEvent && selectedEvent && clickedEventInfo) {
      setExceptionMeetingData(false);
      setIsModalOpen(true);
    }
    setShowConfirm(false);
  }, [pendingEvent, selectedEvent, clickedEventInfo, setExceptionMeetingData]);

  const checkRecurrenceChild = useCallback((recurrenceId?: string): boolean => {
    const hasChild = events.some(ev => 
      ev.extendedProps.recurrenceId === recurrenceId && 
      (ev.extendedProps.type === 3 || ev.extendedProps.type === 4)
    );
    return hasChild;
  }, [events]);
  
  // ============================================================================
  // Modal Close Handler
  // ============================================================================
  
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    loadMeetings();
  }, [loadMeetings]);
  
  // ============================================================================
  // Return Public API
  // ============================================================================
  
  return {
    // State
    events,
    employee,
    isModalOpen,
    selectedEvent,
    isRecurrence,
    searchQuery,
    searchResults,
    contextMenu,
    deleteEvent,
    showConfirm,
    pendingEvent,
    isDeleteSeriesConfirm,
    isDeleteConfirm,
    
    // Refs
    touchStartX,
    touchEndX,
    
    // Actions
    loadMeetings,
    handleSearch,
    handleDateSelect,
    handleEventClick,
    handleEventDrop,
    handleEventResize,
    createNewMeetingAction,
    handleDeleteClick,
    deleteSingleOccurrence,
    deleteWholeSeries,
    openContextMenu,
    closeContextMenu,
    closeModal,
    checkRecurrenceChild,
    
    // Confirmation handlers
    setShowConfirm,
    setIsModalOpen,
    setSelectedEvent,
    onCancelConfirm,
    setIsDeleteSeriesConfirm,
    setIsDeleteConfirm,
  };
}
