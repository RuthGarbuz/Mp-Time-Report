/**
 * Meeting Module - Data Models and Utilities
 * 
 * This file contains all interfaces, types, and helper functions
 * for the meeting/calendar module.
 */

import type { CalendarDataModal, CalendarEventDto, CalendarPartData } from '../../../interface/meetingModel';
import type { Employee } from '../../../interface/TimeHourModel';


// ============================================================================
// Helper Functions - Date & Time Formatting
// ============================================================================

/**
 * Converts a Date object to local ISO string format (YYYY-MM-DDTHH:mm:ss)
 * without timezone offset
 */
export function toLocalISOString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}:${s}`;
}

/**
 * Formats a date string to YYYY-MM-DD format
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string to HH:mm format
 */
export function formatTime(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Combines date (YYYY-MM-DD) and time (HH:mm) into ISO string
 */
export function combineDateTime(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) return '';
  return `${dateStr}T${timeStr}:00`;
}

/**
 * Merges date from one Date object with time from another
 */
export function mergeDateWithTime(baseDate: Date, timeSource: Date): Date {
  const d = new Date(baseDate);
  d.setHours(timeSource.getHours());
  d.setMinutes(timeSource.getMinutes());
  d.setSeconds(timeSource.getSeconds());
  d.setMilliseconds(0);
  return d;
}

/**
 * Checks if two dates are equal by day (ignores time)
 */
export function datesEqualByDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// ============================================================================
// Recurrence Logic
// ============================================================================

/**
 * Calculates the index of a specific occurrence in a recurring series
 * 
 * @param rrule - The recurrence rule object
 * @param occurrenceDate - The date of the occurrence to find
 * @returns The zero-based index of the occurrence, or -1 if not found
 */
export function calculateIndexInSeries(rrule: any, occurrenceDate: Date): number {
  if (!rrule || !rrule.dtStart) return -1;

  const start = new Date(rrule.dtStart);
  const interval = rrule.interval ?? 1;
  const count = rrule.count ?? null;
  const freq = rrule.freq;
  const until = rrule.until ? new Date(rrule.until) : null;
  const byweekdays: string[] | null = rrule.byweekdays ?? null;

  const occurrences: Date[] = [];
  const maxIterations = 5000; // safety cap

  // Map weekday strings "MO" -> JS getDay number (0=Sun..6=Sat)
  const weekdayMap: Record<string, number> = {
    SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
  };
  const byWeekDaysNums = byweekdays
    ? Array.from(new Set(byweekdays.map((b: string) => weekdayMap[b.toUpperCase()])))
      .filter((n) => n !== undefined)
      .sort((a, b) => a - b)
    : null;

  if (freq === "weekly" && byWeekDaysNums && byWeekDaysNums.length > 0) {
    // Weekly recurrence with specific weekdays
    let weekIndex = 0;
    while (occurrences.length < (count ?? Infinity) && occurrences.length < maxIterations) {
      for (const wd of byWeekDaysNums) {
        const baseWeekStart = new Date(start);
        baseWeekStart.setDate(start.getDate() + weekIndex * 7 * interval);

        const diff = wd - baseWeekStart.getDay();
        const candidate = new Date(baseWeekStart);
        candidate.setDate(baseWeekStart.getDate() + diff);

        // Skip if candidate is before start
        if (candidate < start) continue;
        if (until && candidate > until) continue;

        occurrences.push(candidate);
        if (count && occurrences.length >= count) break;
        if (occurrences.length >= maxIterations) break;
      }
      weekIndex++;
      if (count && occurrences.length >= count) break;
      if (until) {
        const checkWeekStart = new Date(start);
        checkWeekStart.setDate(start.getDate() + weekIndex * 7 * interval);
        if (checkWeekStart > until) break;
      }
      if (weekIndex > maxIterations) break;
    }
  } else {
    // Daily/monthly/yearly or weekly without byWeekDays
    let current = new Date(start);
    let iter = 0;
    while (true) {
      if (until && current > until) break;
      if (count && occurrences.length >= count) break;
      if (iter > maxIterations) break;

      if (!byWeekDaysNums || byWeekDaysNums.includes(current.getDay())) {
        if (current >= start) occurrences.push(new Date(current));
      }

      // Advance to next occurrence
      switch (freq) {
        case "daily":
          current.setDate(current.getDate() + interval);
          break;
        case "weekly":
          current.setDate(current.getDate() + 7 * interval);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + interval);
          break;
        case "yearly":
          current.setFullYear(current.getFullYear() + interval);
          break;
        default:
          iter = maxIterations;
          break;
      }
      iter++;
    }
  }

  // Normalize occurrences ordering
  occurrences.sort((a, b) => a.getTime() - b.getTime());

  // Find index using day-level equality
  const idx = occurrences.findIndex(d => datesEqualByDay(d, occurrenceDate));
  return idx;
}

// ============================================================================
// Factory Functions - Create Initial Objects
// ============================================================================

/**
 * Creates a new empty meeting with default values
 * 
 * @param employee - The employee creating the meeting
 * @param start - Optional start date/time (defaults to today 8:00 AM)
 * @param end - Optional end date/time (defaults to start + 30 minutes)
 * @param allDay - Whether this is an all-day event
 * @returns A new CalendarDataModal object
 */
export function createNewMeeting(
  employee: Employee | null,
  start?: string,
  end?: string,
  allDay: boolean = false
): CalendarDataModal {
  const now = new Date();
  now.setHours(8, 0, 0, 0);
  const endTime = new Date(now);
  endTime.setMinutes(30);

  return {
    calendarEventDto: {
      id: 0,
      parentId: null,
      title: "",
      start: start || toLocalISOString(now),
      end: end || toLocalISOString(endTime),
      rRule: null,
      exDate: null,
      allDay: allDay,
      indexInSeries: null,
      type: 0,
      recurrenceXml: null,
      employeeId: employee ? employee.id : 0,
    },
    calendarPartData: {
      cityID: null,
      projectID: null,
      projectName: null,
      statusID: null,
      categoryID: null,
      description: "",
      hasReminder: false,
      reminderTime: null,
      location: "",
      meetingLink: "",
      isPrivate: false,
    },
  };
}

/**
 * Creates an exception (modified occurrence) from a recurring meeting
 * 
 * @param selectedEvent - The original recurring event
 * @param clickedDate - The specific occurrence date clicked
 * @param isDeleted - Whether this is a deletion (type=4) or modification (type=3)
 * @returns A new CalendarDataModal representing the exception
 */
export function createExceptionFromRecurring(
  selectedEvent: CalendarDataModal,
  clickedDate: Date,
  isDeleted: boolean = false
): CalendarDataModal {
  const rrule = selectedEvent.calendarEventDto.rRule!;
  const parentStart = new Date(selectedEvent.calendarEventDto.start);
  const parentEnd = selectedEvent.calendarEventDto.end
    ? new Date(selectedEvent.calendarEventDto.end)
    : new Date(clickedDate.getTime() + 30 * 60 * 1000);

  const newStart = mergeDateWithTime(clickedDate, parentStart);
  const newEnd = mergeDateWithTime(clickedDate, parentEnd);
  
  const indexInSeries = selectedEvent.calendarEventDto.indexInSeries !== null
    ? selectedEvent.calendarEventDto.indexInSeries
    : calculateIndexInSeries(rrule, clickedDate);

  const type = isDeleted ? 4 : 3; // 4 = deleted, 3 = exception

  return {
    calendarPartData: {
      ...selectedEvent.calendarPartData
    },
    calendarEventDto: {
      ...selectedEvent.calendarEventDto,
      id: 0, // new exception
      type: type,
      start: toLocalISOString(newStart),
      end: toLocalISOString(newEnd),
      indexInSeries: indexInSeries
    }
  };
}

// ============================================================================
// Event Transformation for FullCalendar
// ============================================================================

/**
 * Normalizes exDate entries to include the same time-of-day as the event start
 */
function normalizeExDates(exDates: string[] | null | undefined, evt: CalendarEventDto): string[] | undefined {
  if (!exDates || !exDates.length) return undefined;
  const startTime = evt.start ? new Date(evt.start) : null;
  return exDates.map(ed => {
    const ex = new Date(ed);
    if (startTime) {
      if (evt.allDay) {
        return ed.split("T")[0];
      }
      ex.setHours(startTime.getHours(), startTime.getMinutes(), startTime.getSeconds(), 0);
      return toLocalISOString(ex);
    }
    return ed;
  }).filter(Boolean) as string[];
}

/**
 * Converts CalendarEventDto[] from API to FullCalendar event format
 * 
 * @param data - Array of meeting DTOs from the API
 * @returns Array of events in FullCalendar format
 */
export function transformEventsForCalendar(data: CalendarEventDto[]): any[] {
  return data.map(evt => {
    const cleanEvt = { ...evt };
    const eventObj: any = {
      id: evt.id,
      title: evt.title,
      allDay: evt.allDay,
    };

    if (evt.rRule) {
      // Recurring event
      eventObj.extendedProps = cleanEvt;

      try {
        const evtStartTime = new Date(evt.start);
        let dtStartDate = evt.rRule.dtStart ? new Date(evt.rRule.dtStart) : new Date(evt.start);
        dtStartDate.setHours(evtStartTime.getHours(), evtStartTime.getMinutes(), evtStartTime.getSeconds(), 0);

        let untilDate: Date | null = null;
        if (evt.rRule.until) {
          untilDate = new Date(evt.rRule.until);
          untilDate.setHours(evtStartTime.getHours(), evtStartTime.getMinutes(), evtStartTime.getSeconds(), 0);
        }

        const realEvtStart = new Date(evt.start);
        if (dtStartDate < realEvtStart) {
          dtStartDate = new Date(realEvtStart);
        }

        eventObj.rrule = {
          freq: evt.rRule.freq,
          dtstart: evt.allDay ? formatDate(evt.rRule.dtStart) : toLocalISOString(dtStartDate),
          until: untilDate ? (evt.allDay ? formatDate(evt.rRule.until ?? evt.rRule.dtStart) : toLocalISOString(untilDate)) : undefined,
          interval: evt.rRule.interval,
          byweekday: evt.rRule.byweekdays,
          count: evt.rRule.count,
        };
      } catch (err) {
        // Fallback in case of error
        eventObj.rrule = {
          freq: evt.rRule.freq,
          dtstart: evt.allDay ? formatDate(evt.rRule.dtStart) : toLocalISOString(new Date(evt.rRule.dtStart)),
          until: evt.allDay ? formatDate(evt.rRule.until ?? evt.rRule.dtStart) : toLocalISOString(new Date(evt.rRule.until ?? evt.rRule.dtStart)),
          interval: evt.rRule.interval,
          byweekday: evt.rRule.byweekdays,
          count: evt.rRule.count,
        };
      }

      // Duration for recurring events (ISO 8601 duration)
      if (evt.end && evt.start && !evt.allDay) {
        const startDate = new Date(evt.start);
        const endDate = new Date(evt.end);
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = Math.round(durationMs / (1000 * 60));
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        eventObj.duration = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
      }

      // Handle exclusion dates
      const exdates = normalizeExDates(evt.exDate, evt);
      if (exdates) {
        eventObj.exdate = exdates;
        eventObj.extendedProps = { ...eventObj.extendedProps, exDate: exdates };
      }
    } else {
      // Regular single event (including exceptions type=3)
      eventObj.extendedProps = cleanEvt;
      eventObj.start = toLocalISOString(new Date(evt.start));
      eventObj.end = toLocalISOString(new Date(evt.end ?? new Date(new Date(evt.start).getTime() + 30 * 60000)));
    }

    // Handle all-day events
    if (evt.allDay) {
      eventObj.start = formatDate(evt.start);
      if (eventObj.end) {
        eventObj.end = formatDate(evt.end || evt.start);
      }
    }

    return eventObj;
  });
}

// ============================================================================
// Exports
// ============================================================================

export type { CalendarDataModal, CalendarEventDto, CalendarPartData, Employee };
