import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import type { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
import type { CalendarDataModal, CalendarEventDto, CalendarPartData } from "../../interface/meetingModel";
import meetingService from "../../services/meetingService";
import "./meetingStyle.css";
import type { Employee } from "../../interface/TimeHourModel";
import timeRecordService from "../../services/timeRecordService";
import AddMeetingModal from "./meetingModalOpen";
import ConfirmModal from "../shared/confirmDeleteModal";
import { Search } from "lucide-react";
export default function MyScheduler() {
  const [events, setEvents] = useState<any[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarDataModal | undefined>(undefined);
  // const [calendarView, setCalendarView] = useState<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>('timeGridWeek');
  const calendarRef = useRef<FullCalendar | null>(null);
  const [isRecurrence, setIsRecurrence] = useState(false);
  const [clickedEventInfo, setClickedEventInfo] = useState<EventClickArg | EventApi | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    event: EventApi | null;
  }>({ x: 0, y: 0, event: null });
  const [isDeleteSeriesConfirm, setIsDeleteSeriesConfirm] = useState(false);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [deleteEvent, setDeleteEvent] = useState<EventApi | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
   const wrapperRef = useRef<HTMLDivElement>(null); 
  // const calendarRef = useRef<FullCalendar | null>(null);

  // Search handler
  const handleSearch = (query: string) => {
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
    if (results.length > 0 && calendarRef.current) {
      const firstEvent = results[0];
      const calendar = calendarRef.current.getApi();
      
      // Get event start date
      let eventDate: Date;
      if (firstEvent.start) {
        eventDate = new Date(firstEvent.start);
      } else if (firstEvent.rrule?.dtstart) {
        eventDate = new Date(firstEvent.rrule.dtstart);
      } else {
        return;
      }

      // Navigate calendar to that date
      calendar.gotoDate(eventDate);
      
      // Optionally switch to day view for better visibility
      // calendar.changeView('timeGridDay', eventDate);
    }
     };
  const handleDeleteClick = (event: EventApi) => {
    setDeleteEvent(event);
    closeContextMenu();

    const type = event.extendedProps.type;

    //recurrence
    if (type === 1) {
      setIsDeleteSeriesConfirm(true);
    }
    else {
      setIsDeleteConfirm(true);
    }
  };

  async function deleteSingleOccurrence(event: EventApi) {
    if (event.extendedProps.type == 0) {
      await meetingService.deleteMeeting(event.extendedProps as CalendarEventDto, false);
      return;
    }
    if (event.extendedProps.type == 3) {//update type=4
      await meetingService.UpdateAppointmentType(event.extendedProps.id);
      return;
    }

    let prepared = await prepareDeleteException(event);
    if (!prepared) return;
    const rRule = prepared.selected.calendarEventDto.rRule;
    const index = calculateIndexInSeries(rRule, prepared.mergedStart);
    const updatedSelected = {
      ...prepared.selected,
      calendarEventDto: {
        ...prepared.selected.calendarEventDto,
        indexInSeries: index,
        
        // start: toLocalISOString(new Date(prepared.mergedStart)),
        // end: toLocalISOString(new Date(prepared.mergedEnd)),
        type: 4 // set to deleted
      }
    };
    await meetingService.insertUpdateMeetingsData(
      updatedSelected as CalendarDataModal,
      "InsertMeetingDataAsync"
    );

  }

  const deleteWholeSeries = async (event: EventApi) => {
    await meetingService.deleteMeeting(event.extendedProps as CalendarEventDto, true);
    loadMeetings();
  };

  async function prepareDeleteException(event: EventApi) {
    const data = await meetingService.getMeetingsData(
      event.extendedProps.id
    );

    if (!data) return null;
if(event.endStr){

}
    const selected: CalendarDataModal = {
      calendarEventDto: {
        ...event.extendedProps as CalendarEventDto,
        employeeId: employee?.id,
        start: toLocalISOString(new Date(event.startStr)),
        end: toLocalISOString(new Date(event.endStr==""?event.startStr:event.endStr)),
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

  const openContextMenu = (e: MouseEvent, event: EventApi) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      event: event,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ x: 0, y: 0, event: null });
  };

  // const handleDatesSet = (arg: any) => {
  //    const view = arg.view;
  //   const startDate = view.currentStart;

  //   const formatter = new Intl.DateTimeFormat("he-IL", {
  //     month: "long",
  //     year: "numeric",
  //   });

  // };
  useEffect(() => {
    const storedEmployee = timeRecordService.getEmployee();
    if (storedEmployee) {
      setEmployee(storedEmployee);
    } else {
      setEmployee(null);
    }

  }, []);
  async function loadMeetings() {
    const data: CalendarEventDto[] = await meetingService.getMeetingsForFullCalendar(); // example
    // convert DTOs to FullCalendar format
    setDeleteEvent(null);
    const mapped = data.map(evt => {
      const cleanEvt = { ...evt };

      const eventObj: any = {
        id: evt.id,
        title: evt.title,
        allDay: evt.allDay,
      };

      // helper: normalize exDate entries to include same time-of-day as evt.start
      const normalizeExDates = (exDates?: string[] | null) => {
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
        });

      };

      if (evt.rRule) {
        eventObj.extendedProps = cleanEvt;

        try {
          const evtStartTime = new Date(evt.start);
          let dtStartDate = evt.rRule && evt.rRule.dtStart ? new Date(evt.rRule.dtStart) : new Date(evt.start);
          dtStartDate.setHours(evtStartTime.getHours(), evtStartTime.getMinutes(), evtStartTime.getSeconds(), 0);

          let untilDate: Date | null = null;
          if (evt.rRule && evt.rRule.until) {
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
          eventObj.rrule = {
            freq: evt.rRule.freq,
            dtstart: evt.allDay ? formatDate(evt.rRule.dtStart) : toLocalISOString(new Date(evt.rRule.dtStart)),
            until: evt.allDay ? formatDate(evt.rRule.until ?? evt.rRule.dtStart) : toLocalISOString(new Date(evt.rRule.until ?? evt.rRule.dtStart)),
            interval: evt.rRule.interval,
            byweekday: evt.rRule.byweekdays,
            count: evt.rRule.count,
          };
        }

        // Use ISO 8601 duration string (FullCalendar understands "PT30M")
        if (evt.end && evt.start && !evt.allDay) {
          const startDate = new Date(evt.start);
          const endDate = new Date(evt.end);
          const durationMs = endDate.getTime() - startDate.getTime();
          const durationMinutes = Math.round(durationMs / (1000 * 60));
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;

          eventObj.duration = `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:00`;

        }

        // Ensure exdate entries match dtstart/time-of-day so the recurrence engine can exclude them
        const exdates = normalizeExDates(evt.exDate);
        if (exdates) {
          eventObj.exdate = exdates;
          // also keep extendedProps.exDate normalized so other logic sees the same values
          eventObj.extendedProps = { ...eventObj.extendedProps, exDate: exdates };
        }
      } else {
        // Regular single event (including exceptions type=3)
        eventObj.extendedProps = cleanEvt;
        eventObj.start = toLocalISOString(new Date(evt.start));
        eventObj.end = toLocalISOString(new Date(evt.end ?? new Date(new Date(evt.start).getTime() + 30 * 60000)));
      }
      if (evt.allDay) {
        formatDate(evt.start);
        eventObj.start = formatDate(evt.start);
        if (eventObj.end) {
          eventObj.end = formatDate(evt.end || evt.start);
        }
      }
      return eventObj;
    });
    setEvents(mapped);
  }
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr); // קורא UTC → הופך ל־LOCAL אוטומטית
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {

    loadMeetings();
  }, []);
  useEffect(() => {
    const calendarEl = wrapperRef.current; // ← Use wrapper ref
    if (!calendarEl) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      const diffX = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (Math.abs(diffX) > threshold) {
        const calendar = calendarRef.current?.getApi();
        if (!calendar) return;

        if (diffX > 0) {
          calendar.next();
        } else {
          calendar.prev();
        }
      }

      touchStartX.current = 0;
      touchEndX.current = 0;
    };

    calendarEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    calendarEl.addEventListener('touchmove', handleTouchMove, { passive: true });
    calendarEl.addEventListener('touchend', handleTouchEnd);

    return () => {
      calendarEl.removeEventListener('touchstart', handleTouchStart);
      calendarEl.removeEventListener('touchmove', handleTouchMove);
      calendarEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // const handleViewChange = (view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth') => {
  //   setCalendarView(view);
  //   calendarRef.current?.getApi()?.changeView(view);
  // };
  function calculateIndexInSeries(rrule: any, occurrenceDate: Date): number {
    if (!rrule || !rrule.dtStart) return -1;

    const start = new Date(rrule.dtStart);
    const interval = rrule.interval ?? 1;
    const count = rrule.count ?? null;
    const freq = rrule.freq;
    const until = rrule.until ? new Date(rrule.until) : null;
    const byweekdays: string[] | null = rrule.byweekdays ?? null;

    const occurrences: Date[] = [];
    const maxIterations = 5000; // safety cap

    // map weekday strings "MO" -> JS getDay number (0=Sun..6=Sat)
    const weekdayMap: Record<string, number> = {
      SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
    };
    const byWeekDaysNums = byweekdays
      ? Array.from(new Set(byweekdays.map((b: string) => weekdayMap[b.toUpperCase()])))
        .filter((n) => n !== undefined)
        .sort((a, b) => a - b)
      : null;

    if (freq === "weekly" && byWeekDaysNums && byWeekDaysNums.length > 0) {

      let weekIndex = 0;
      let produced = 0;
      while (occurrences.length < (count ?? Infinity) && occurrences.length < maxIterations) {

        for (const wd of byWeekDaysNums) {

          const baseWeekStart = new Date(start);
          baseWeekStart.setDate(start.getDate() + weekIndex * 7 * interval);

          const diff = wd - baseWeekStart.getDay();
          const candidate = new Date(baseWeekStart);
          candidate.setDate(baseWeekStart.getDate() + diff);

          // Important: candidate might be before start if weekIndex==0 and weekday < start.day -> skip
          if (candidate < start) continue;
          if (until && candidate > until) continue;

          occurrences.push(candidate);
          produced++;
          if (count && occurrences.length >= count) break;
          if (occurrences.length >= maxIterations) break;
        }
        weekIndex++;
        if (count && occurrences.length >= count) break;
        if (until) {
          // safety: if baseWeekStart exceeds until, break
          const checkWeekStart = new Date(start);
          checkWeekStart.setDate(start.getDate() + weekIndex * 7 * interval);
          if (checkWeekStart > until) break;
        }
        if (weekIndex > maxIterations) break;
      }
    } else {
      // daily/monthly/yearly or weekly without byWeekDays
      let current = new Date(start);
      let iter = 0;
      while (true) {
        if (until && current > until) break;
        if (count && occurrences.length >= count) break;
        if (iter > maxIterations) break;

        // if byWeekDays exists but freq !== weekly, we can optionally filter (but usually byWeekDays is for weekly)
        if (!byWeekDaysNums || byWeekDaysNums.includes(current.getDay())) {
          if (current >= start) occurrences.push(new Date(current));
        }

        // advance
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
            // unknown freq: stop
            iter = maxIterations;
            break;
        }
        iter++;
      }
    }

    // normalize occurrences ordering just in case
    occurrences.sort((a, b) => a.getTime() - b.getTime());

    // find index using minute-level equality (robust to ms/timezone minor diffs)
    const idx = occurrences.findIndex(d => datesEqualByDay(d, occurrenceDate));
    // const idx = occurrences.findIndex(d => datesEqualToMinute(d, occurrenceDate));
    return idx;
  }
  function datesEqualByDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }
const createNewMeeting = () => {
const now = new Date();
          now.setHours(8, 0, 0, 0);
          const endTime = new Date(now);
          endTime.setMinutes(30);

          const newEvent: CalendarDataModal = {
            calendarEventDto: {
              id: 0,
              parentId: null,
              title: "",
              start: toLocalISOString(now),
              end: toLocalISOString(endTime),
              rRule: null,
              exDate: null,
              allDay: false,
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

          setSelectedEvent(newEvent);
          setIsModalOpen(true);
}
  // ...existing code...
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const currentView = selectInfo.view.type; // "dayGridMonth", "timeGridWeek", "timeGridDay"
    const isMonthView = currentView === "dayGridMonth";

    let start: string;
    let end: string;
    let allDay: boolean;
    const startDate = new Date(selectInfo.startStr);
    const endDate = new Date(selectInfo.endStr);

    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    //const diffInDays = Math.floor((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
    if (selectInfo.allDay) {
      endDay.setDate(endDay.getDate() - 1);
    }
    // Block multi-day all-day selections (diffInDays > 1 means 2+ days apart)
    // if (selectInfo.allDay && diffInDays > 1) {
    //   return selectInfo.view.calendar.unselect();
    // }
    if (!datesEqualByDay(startDay, endDay)) {
      return selectInfo.view.calendar.unselect();
    }

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

    const newEvent: CalendarDataModal = {
      calendarEventDto: {
        id: 0,
        parentId: null,
        title: "",
        start: start,
        end: end,
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

    setSelectedEvent(newEvent);
    setIsModalOpen(true);
  };
  // ...existing code...


  const handleEventClick = async (clickInfo: EventClickArg) => {
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
        employeeId: employee?.id || 0,//display just employees meetings
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
      setPendingEvent(true);
      setShowConfirm(true); // show the confirmation dialog
    } else {
      setIsModalOpen(true);
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    setEvents(prev =>
      prev.map(e =>
        e.id === dropInfo.event.id
          ? { ...e, start: toLocalISOString(new Date(dropInfo.event.startStr)), end: toLocalISOString(new Date(dropInfo.event.endStr)) }
          : e
      )
    );
  };
  function mergeDateWithTime(baseDate: Date, timeSource: Date): Date {
    const d = new Date(baseDate);

    d.setHours(timeSource.getHours());
    d.setMinutes(timeSource.getMinutes());
    d.setSeconds(timeSource.getSeconds());
    d.setMilliseconds(0);
    return d;
  }
  function toLocalISOString(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d}T${h}:${min}:${s}`;
  }
  const setExeptionMeetingData = async (isDeleted: boolean): Promise<CalendarDataModal | undefined> => {
    if (!selectedEvent || !clickedEventInfo) return;
    const rrule = selectedEvent.calendarEventDto.rRule!;
    // normalize clickedEventInfo to an EventApi instance (handles EventClickArg | EventApi)
    const eventApi: EventApi | null =
      ('event' in clickedEventInfo ? (clickedEventInfo as EventClickArg).event : (clickedEventInfo as EventApi)) || null;
    if (!eventApi || !eventApi.start) return;
    const clickedDateStart = new Date(eventApi.start);

    const parentStart = new Date(selectedEvent.calendarEventDto.start);
    const parentEnd = selectedEvent.calendarEventDto.end
      ? new Date(selectedEvent.calendarEventDto.end)
      : new Date(clickedDateStart.getTime() + 30 * 60 * 1000);

    const newStart = mergeDateWithTime(clickedDateStart, parentStart);
    const newEnd = mergeDateWithTime(clickedDateStart, parentEnd || parentStart);
    let indexInSeries = selectedEvent.calendarEventDto.indexInSeries !== null ?
      selectedEvent.calendarEventDto.indexInSeries :
      calculateIndexInSeries(rrule, clickedDateStart)


    let type = isDeleted ? 4 : 3
    const exceptionDto: CalendarDataModal = {
      calendarPartData: {
        ...selectedEvent.calendarPartData
      },
      calendarEventDto: {
        ...selectedEvent.calendarEventDto,
        id: 0, // new exception
        type: type,                    // חריגה או מחיקה מסדרה
        start: toLocalISOString(newStart),
        end: toLocalISOString(newEnd),
        indexInSeries: indexInSeries
      }
    };

    setSelectedEvent(exceptionDto);
    return exceptionDto;
  }
  const onCancelConfirm = () => {
    if (pendingEvent && selectedEvent && clickedEventInfo) {
      setExeptionMeetingData(false);

      setIsModalOpen(true);
    }
    setShowConfirm(false);
    // setPendingEvent(false);
  }
  const checkRrecurrenceChild = (recurrenceId?: string): boolean => {
    const hasChild = events.some(ev => ev.extendedProps.recurrenceId === recurrenceId && (ev.extendedProps.type === 3 || ev.extendedProps.type === 4));
    return hasChild;
  }
  const handleEventResize = (resizeInfo: any) => {
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
};
  return (
    <div className="bg-white text-gray-600 p-2 rounded-lg shadow ">
      <h2 className="text-center text-xl font-semibold">📅 יומן הפגישות של {employee?.name}</h2>

      {/* <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          calendarRef.current?.getApi().prev();
          setCurrentTitle(calendarRef.current?.getApi().view.title || "");
        }}
        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
      >
        ←
      </button>
      <button
        onClick={() => {
          calendarRef.current?.getApi().next();
          setCurrentTitle(calendarRef.current?.getApi().view.title || "");
        }}
        className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
      >
        →
      </button>
      <button
        onClick={() => calendarRef.current?.getApi().today()}
        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        היום
      </button>
    </div>

    <div dir="rtl" className="text-center">
     
      <p className="text-gray-500 font-semibold">{currentTitle}</p> 
    </div>

    <div className="flex items-center gap-2">
      <select
        id="viewSelect"
        value={calendarView}
        onChange={(e) => handleViewChange(e.target.value as any)}
        className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="timeGridDay">יומי</option>
        <option value="timeGridWeek">שבועי</option>
        <option value="dayGridMonth">חודשי</option>
      </select>
    </div>
  </div> */}
 {/* Search bar */}
      <div className="my-4 px-2">
        <div className="relative" style={{ display: 'none' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="חפש פגישה לפי כותרת..."
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="rtl"
          />
          {searchQuery ? (
            <button
              onClick={() => handleSearch("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          )}
        </div>
        
        {/* Search results counter */}
        {searchQuery && (
          <p className="text-sm text-gray-500 mt-2">
            {searchResults.length > 0
              ? `נמצאו ${searchResults.length} פגישות`
              : "לא נמצאו תוצאות"}
          </p>
        )}
      </div>
    <div ref={wrapperRef}>
       <FullCalendar
      ref={calendarRef}
      timeZone="local"
      slotDuration="00:30:00"
      eventStartEditable={false}
      eventDurationEditable={false}
      direction="rtl"
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
      initialView={"timeGridDay"}
      selectable={true}
      editable={false}
      eventDrop={handleEventDrop}
      eventResize={handleEventResize}
      select={handleDateSelect}
      eventClick={handleEventClick}
      events={events}
      
      longPressDelay={500}
      eventLongPressDelay={500}
      selectLongPressDelay={500}
      
      dragScroll={true}
      stickyHeaderDates={true}
      
      eventDidMount={(info) => {
        // Enable keyboard focus for better hover/focus styling
        info.el.tabIndex = 0;
        info.el.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          openContextMenu(e, info.event);
        });
      }}
      
      eventContent={(info) => {
        const type = info.event.extendedProps.type;
        const isRecurring = type === 1;
        const isException = type === 3;

        return (
          <div className="fc-event-custom flex items-center gap-1">
         <span>{info.event.title}</span>
         {isRecurring && !isException && <span className="recurring-symbol">🔄</span>}
         {isException && <span className="recurring-symbol">⚡</span>}
          </div>
        );
      }}

      height="80vh"
      locale="he"
      firstDay={0}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridDay,timeGridWeek,dayGridMonth",
      }}
      buttonText={{
        today: "היום",
        month: "חודש",
        week: "שבוע",
        day: "יום",
      }}
      dayHeaderContent={(arg) => {
        const date = arg.date;
        const dayNames = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
        const dayName = dayNames[date.getDay()];
        const day = String(date.getDate()).padStart(2, "0");
        return `${dayName} ${day}`;
      }}
      
      handleWindowResize={true}
      windowResizeDelay={100}
       />
     </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          createNewMeeting();
        }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group"
        title="הוסף פגישה חדשה"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 🟢 Modal */}
      {isModalOpen && (
        <AddMeetingModal
          isOpen={isModalOpen}
          // setIsOpen={setIsModalOpen}
          setIsOpen={() => { setIsModalOpen(false); loadMeetings(); }}
          event={selectedEvent}
          isRecurrence={isRecurrence}
          userID={employee ? employee.id : 0}
          checkRrecurrenceChild={checkRrecurrenceChild}
        />
      )}
      {isDeleteSeriesConfirm && deleteEvent && (
        <ConfirmModal
          message="האם למחוק את כל הסדרה?"
          okText="כן"
          cancelText="לא"
          onOk={async () => {
            deleteWholeSeries(deleteEvent);
            setIsDeleteSeriesConfirm(false);
            loadMeetings();
          }}
          onCancel={async () => {
            // ← זה מחיקה רק של occurrence יחיד
            await deleteSingleOccurrence(deleteEvent);
            setIsDeleteSeriesConfirm(false);
            loadMeetings();
          }}
        />
      )}
      {isDeleteConfirm && deleteEvent && (
        <ConfirmModal
          message="האם למחוק את הפגישה?"
          okText="כן"
          cancelText="לא"
          onOk={async () => {
            await deleteSingleOccurrence(deleteEvent);
            setIsDeleteConfirm(false);
            loadMeetings();
          }}
          onCancel={() => setIsDeleteConfirm(false)}
        />
      )}
      {showConfirm && (
        <ConfirmModal
          okText="כן"
          cancelText="לא"
          message="האם לפתוח את כל הסדרה?"
          onOk={() => {
            if (pendingEvent) {
              setSelectedEvent(prev =>
                prev
                  ? {
                    ...prev,
                    calendarEventDto: { ...prev.calendarEventDto, type: 1 },
                  }
                  : prev
              );
              setIsModalOpen(true);
            }
            setShowConfirm(false);
          }}
          onCancel={() => {
            onCancelConfirm();
          }}
        />)}
      {contextMenu.event && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "white",
            border: "1px solid #ccc",
            padding: "5px 10px",
            borderRadius: "5px",
            zIndex: 9999,
            cursor: "pointer",
          }}
          onMouseLeave={closeContextMenu}
        >
          <div
            onClick={() => handleDeleteClick(contextMenu.event!)}
            style={{ padding: "5px" }}
          >
            מחק
          </div>
        </div>
      )}
      <style>
        {`
          .fc .fc-event,
          .fc .fc-event-main {
            transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
          }
          .fc .fc-event:hover,
          .fc .fc-event:focus,
          .fc .fc-event:focus-visible {
            filter: brightness(1.08);
            box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
            z-index: 10 !important;
          }
          .fc .fc-event:focus-visible {
            outline: 2px solid #2563eb;
            outline-offset: 2px;
          }
        `}
      </style>
    </div>
  );
}
