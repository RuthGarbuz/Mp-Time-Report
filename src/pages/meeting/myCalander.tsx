import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import type { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
import type { CalendarDataModal, CalendarEventDto, Global } from "../../interface/meetingModel";
import meetingService from "../../services/meetingService";
import "./meetingStyle.css";
import type { Employee } from "../../interface/interfaces";
import timeRecordService from "../../services/timeRecordService";
import AddMeetingModal from "./meetingModalOpen";
import ConfirmModal from "../shared/confirmDeleteModal";
import { ConciergeBell } from "lucide-react";

export default function MyScheduler() {
  const [events, setEvents] = useState<any[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarDataModal | undefined>(undefined);
  const [calendarView, setCalendarView] = useState<'timeGridDay' | 'timeGridWeek' | 'dayGridMonth'>('timeGridWeek');
  const calendarRef = useRef<FullCalendar|null>(null);
  const [currentTitle, setCurrentTitle] = useState("");
const [isRecurrence, setIsRecurrence] = useState(false);
const [clickedEventInfo, setClickedEventInfo] = useState<EventClickArg|EventApi | null>(null);
const [contextMenu, setContextMenu] = useState<{
  x: number;
  y: number;
  event: EventApi | null;
}>({ x: 0, y: 0, event: null });
const [isDeleteSeriesConfirm, setIsDeleteSeriesConfirm] = useState(false);
const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

const [deleteEvent, setDeleteEvent] = useState<EventApi | null>(null);

const handleDeleteClick = (event: EventApi) => {
  setDeleteEvent(event);
  closeContextMenu();

  const type = event.extendedProps.type;

  //recurrence
  if (type === 1) {
    setIsDeleteSeriesConfirm(true);
  }
  else{
    setIsDeleteConfirm(true);
  }
};
async function deleteException(prepared: any) {
  const rRule = prepared.selected.calendarEventDto.rRule;

  const index = calculateIndexInSeries(rRule, prepared.mergedStart);

  const dto = {
    ...prepared.selected.calendarEventDto,
    type: 4,
    start: prepared.mergedStart.toISOString(),
    end: prepared.mergedEnd.toISOString(),
    indexInSeries: index
  };

  await meetingService.insertUpdateMeetingsData(dto, "UpdateMeetingDataAsync");
}
async function deleteSingleOccurrence(event: EventApi) {
  if(event.extendedProps.type == 0){
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
    start: prepared.mergedStart.toISOString(),
    end: prepared.mergedEnd.toISOString(),
    type: 4 // set to deleted
  }
};
await meetingService.insertUpdateMeetingsData(
  updatedSelected as CalendarDataModal,
  "InsertMeetingDataAsync"
);

}
// const deleteMeeting = async (event: EventApi) => {
//    if (event.extendedProps.type === 3) {
//     // exeption
//      const result = await prepareDeleteSingleException(event);
//     if (!result) return;

//     await deleteSingleException(result.selected, result.clicked, true);
//       loadMeetings();
//     return;
//   //  SetDeleteSingleException(event);
//   //  deleteSingleException(true);
//    }
//   else {
//     // regular
//       await deleteSingleMeeting(event);
//   loadMeetings();
//   //  deleteSingleMeeting(event);
//   }
// }
// const deleteSingleMeeting = async (event: EventApi) => {
//    await meetingService.deleteMeeting(event.extendedProps as CalendarEventDto, false);

//   loadMeetings() ;
// };
const deleteWholeSeries = async (event: EventApi) => {
   await meetingService.deleteMeeting(event.extendedProps as CalendarEventDto, true);
loadMeetings() ;
};
// const deleteSingleException = async (
//   selected: CalendarDataModal,
//   clicked: EventApi,
//   isUpdate: boolean
// ) => {
//   const dto = {
//     calendarPartData:{
//       ...selected.calendarPartData,

//     } ,
//     calendarEventDto:
//     {
//       ...selected.calendarEventDto,
    
//     type: 4,
//     indexInSeries: calculateIndexInSeries(selected, clicked.start!)
//     }
//   };

//   const result = await meetingService.insertUpdateMeetingsData(
//     dto,
//     isUpdate ? "UpdateMeetingDataAsync" : "InsertMeetingDataAsync"
//   );

//   return result;
// };
// const deleteSingleException = async (isUpdateExeption:boolean) => {
//   let insertDelete:any=null;
//   let deleteSelected:CalendarDataModal = await setExeptionMeetingData(true)||selectedEvent!;
//   if(!isUpdateExeption){
//       insertDelete=  await meetingService.insertUpdateMeetingsData(deleteSelected,"InsertMeetingDataAsync");
//   }
//   else{
//       insertDelete=  await meetingService.insertUpdateMeetingsData(selectedEvent!,"UpdateMeetingDataAsync");
//   }
// if(insertDelete){
//   loadMeetings();
// }
// }
async function prepareDeleteException(event: EventApi) {
  const data = await meetingService.getMeetingsData(
    event.extendedProps as CalendarEventDto
  );

  if (!data) return null;

  const selected = data as CalendarDataModal;
  const clickedDate = new Date(event.start!);

  // מיזוג תאריכים לתיקוני type=3
  const parentStart = new Date(selected.calendarEventDto.start);
  const parentEnd = new Date(selected.calendarEventDto.end
       ? selected.calendarEventDto.end
      : clickedDate.getTime() + 30 * 60 * 1000);

  const mergedStart = mergeDateWithTime(clickedDate, parentStart);
  const mergedEnd = mergeDateWithTime(clickedDate, parentEnd);

  return { selected, mergedStart, mergedEnd, clickedEvent: event };
}
const SetDeleteSingleException = async (event: EventApi) => {

  const data = await meetingService.getMeetingsData(
    event.extendedProps as CalendarEventDto
  ) as CalendarDataModal | CalendarDataModal[] | null;

  if (!data) return null;
  setSelectedEvent(data as CalendarDataModal);
  setClickedEventInfo(event );



 
};
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

const handleDatesSet = (arg: any) => {
   const view = arg.view;
  const startDate = view.currentStart;

  const formatter = new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  });

  setCurrentTitle(formatter.format(startDate));
  //setCurrentTitle(arg.view.title);//full format
};
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
        const eventObj: any = {
          id: evt.id,
          title: evt.title,
          allDay: evt.allDay,
          extendedProps: evt,
        };

        if (evt.rRule) {
          // Fix rrule structure
          eventObj.rrule = {
            freq: evt.rRule.freq,
            dtstart: evt.rRule.dtStart,
            until: evt.rRule.until,
            interval: evt.rRule.interval,
            byweekday: evt.rRule.byweekdays,
            count: evt.rRule.count,
          };

          // Use duration instead of static end
          if (evt.end && evt.start) {
            const startDate = new Date(evt.start);
            const endDate = new Date(evt.end);

            const durationMs = endDate.getTime() - startDate.getTime();
            const durationMinutes = Math.round(durationMs / (1000 * 60));
            eventObj.duration = `PT${durationMinutes}M`;
            //eventObj.duration = moment.duration(durationMs).toISOString();
          }
        } else {
          // Regular single event
          eventObj.start = evt.start;
          eventObj.end = evt.end;
        }

        // Fix exdate: must match start time exactly
        if (evt.exDate?.length) {
          eventObj.exdate = evt.exDate.map(d => d.split("T")[0] + "T" + evt.start.split("T")[1]);
        }

        return eventObj;
      });
      setEvents(mapped);
    }
  useEffect(() => {
    
    loadMeetings();
  }, []);
  useEffect(() => {
  if (calendarRef.current) {
    calendarRef.current.getApi().refetchEvents(); // או כל פעולה אחרת
  }
}, [events]);
const handleViewChange = (view: 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth') => {
  setCalendarView(view);
  calendarRef.current?.getApi()?.changeView(view);
};
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
    // Weekly with specific weekdays
    // We'll iterate weekIndex = 0,1,2,... and for each week produce dates for the requested weekdays.
    // Anchor weeks relative to the start date.
    let weekIndex = 0;
    let produced = 0;
    while (occurrences.length < (count ?? Infinity) && occurrences.length < maxIterations) {
      // for each weekday in the week produce the date
      for (const wd of byWeekDaysNums) {
        // compute date for this weekIndex and weekday:
        // baseWeekStart = start + (weekIndex * 7 * interval) days
        const baseWeekStart = new Date(start);
        baseWeekStart.setDate(start.getDate() + weekIndex * 7 * interval);

        // compute candidate day in that week that has weekday 'wd'
        // find difference from baseWeekStart.getDay() to wd
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
  const idx = occurrences.findIndex(d => datesEqualToMinute(d, occurrenceDate));
  return idx;
}
function datesEqualToMinute(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes()
  );
}
  const handleDateSelect = (selectInfo: DateSelectArg) => {

    const start = selectInfo.startStr;
    const end = selectInfo.endStr;
    const newEvent: CalendarDataModal = {

      calendarEventDto: {
        id: 0, // generate temporary unique id
        parentId: null,
        title: "חדשה", // default title
        start: start,
        end: end,
        rRule: null,
        exDate: null,
        allDay: selectInfo.allDay ?? false,
        indexInSeries: null,
        type: 0, // 0 = regular meeting (you can change)
        recurrenceXml: null,
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

  const handleEventClick = async (clickInfo: EventClickArg) => {
      setClickedEventInfo(clickInfo); 
      setIsRecurrence(clickInfo.event.extendedProps.type === 1);
    //   const start = clickInfo.event.startStr;
    // const end = clickInfo.event.endStr;
    // getListsData();
    // meetingService.getMeetingsData may return a single object, an array, or null — normalize to a single CalendarDataModal | undefined
    const data = await meetingService.getMeetingsData(clickInfo.event.extendedProps as CalendarEventDto) as CalendarDataModal | CalendarDataModal[] | null;

    let selected: CalendarDataModal | undefined;
    if (Array.isArray(data)) {
      selected = data.length > 0 ? data[0] : undefined;
    } else {
      selected = data ?? undefined;
    }
    if (!selected) return;
      setSelectedEvent(selected);
    if (selected.calendarEventDto.type === 1) {
      setPendingEvent(true);
      setShowConfirm(true); // show the confirmation dialog
    } else {
      setIsModalOpen(true);
    }


    // if (window.confirm(`למחוק את "${clickInfo.event.title}"?`)) {
    //   setEvents(events.filter((e) => e.id !== clickInfo.event.id));
    // }
  };

const handleEventDrop = (dropInfo: any) => {
  setEvents(prev =>
    prev.map(e =>
      e.id === dropInfo.event.id
        ? { ...e, start: dropInfo.event.startStr, end: dropInfo.event.endStr }
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
    let indexInSeries=selectedEvent.calendarEventDto.indexInSeries!==null?
    selectedEvent.calendarEventDto.indexInSeries:
    calculateIndexInSeries(rrule, clickedDateStart)
    
    
let type=isDeleted?4:3
   const exceptionDto:CalendarDataModal = {
    calendarPartData:{
      ...selectedEvent.calendarPartData
    },
    calendarEventDto: {
      ...selectedEvent.calendarEventDto,
              type: type,                    // חריגה או מחיקה מסדרה
              start: toLocalISOString(newStart),
              end: toLocalISOString(newEnd),    
              indexInSeries: indexInSeries   
    }
  };
    // setSelectedEvent(prev =>
    //   prev
    //     ? {
    //         ...prev,
    //           calendarEventDto: {
    //           ...prev.calendarEventDto,
    //           type: type,                          
    //           start: toLocalISOString(newStart),
    //           end: toLocalISOString(newEnd),    
    //           indexInSeries: indexInSeries      
    //         }
    //       }
    //     : prev
    // );
    setSelectedEvent(exceptionDto);
    return exceptionDto;
}
const onCancelConfirm = () => {
    if (pendingEvent && selectedEvent && clickedEventInfo) {
    setExeptionMeetingData(false);
    // const rrule = selectedEvent.calendarEventDto.rRule!;
    // const clickedDateStart = new Date(clickedEventInfo.event.start!);

    //  const parentStart = new Date(selectedEvent.calendarEventDto.start);
    // const parentEnd = selectedEvent.calendarEventDto.end
    //   ? new Date(selectedEvent.calendarEventDto.end)
    //   : new Date(clickedDateStart.getTime() + 30 * 60 * 1000);

    // const newStart = mergeDateWithTime(clickedDateStart, parentStart);
    // const newEnd = mergeDateWithTime(clickedDateStart, parentEnd || parentStart);
    // const indexInSeries = calculateIndexInSeries(rrule, clickedDateStart);

    // setSelectedEvent(prev =>
    //   prev
    //     ? {
    //         ...prev,
    //           calendarEventDto: {
    //           ...prev.calendarEventDto,
    //           type: 3,                          
    //           start: toLocalISOString(newStart),
    //           end: toLocalISOString(newEnd),    
    //           indexInSeries: indexInSeries      
    //         }
    //       }
    //     : prev
    // );

    setIsModalOpen(true);
  }
  setShowConfirm(false);
  // setPendingEvent(false);
}
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

      <FullCalendar
        // ref={calendarRef}
        eventStartEditable={false}
        direction="rtl"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]} // 👈 הוספת כאן
       initialView={calendarView}
        selectable={true}
        editable={true}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={events}
        // headerToolbar={false}
        eventDidMount={(info) => {
  info.el.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    openContextMenu(e, info.event); // 👈 נקרא לפונקציה
  });
}}
       eventContent={(info) => {
  const type = info.event.extendedProps.type;
  const isRecurring = type === 1;   // מחזורית
  const isException = type === 3;   // חריגה

  return (
    <div className="fc-event-custom flex items-center gap-1">
      <span>{info.event.title}</span>

      {isRecurring && !isException && (
        <span className="recurring-symbol">🔄</span>
      )}

      {isException && (
        <span className="exception-symbol">⚡</span>
      )}
    </div>
  );
}}

        height="80vh"
        locale="he"
        firstDay={0} // שבוע מיום ראשון
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth", // ✅ הוספנו תצוגת יום
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
          //const month = String(date.getMonth() + 1).padStart(2, "0");
          return `${dayName} ${day}`;
        }}
        datesSet={handleDatesSet}
      />
      {/* 🟢 Modal */}
      {isModalOpen && (
        <AddMeetingModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onClose={() => {setIsModalOpen(false);loadMeetings();}}
          event={selectedEvent}
          isRecurrence={isRecurrence}

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
    </div>
  );
}
