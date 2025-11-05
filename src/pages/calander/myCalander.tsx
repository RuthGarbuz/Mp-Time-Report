import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventApi } from "@fullcalendar/core";
interface MyEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
}
export default function MyScheduler() {
  const [events, setEvents] = useState<MyEvent[]>([
    {
      id: "1",
      title: "פגישה עם דני",
      start: "2025-11-05T10:00:00",
      end: "2025-11-05T11:00:00",
 
    
    },
    {
      id: "2",
      title: "ישיבת צוות",
      start: "2025-11-06T09:00:00",
      end: "2025-11-06T10:30:00",
    },
  ]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt("שם האירוע:");
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      const newEvent = {
        id: String(events.length + 1),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (window.confirm(`למחוק את "${clickInfo.event.title}"?`)) {
      setEvents(events.filter((e) => e.id !== clickInfo.event.id));
    }
  };

  const handleEventDrop = (dropInfo: any) => {
    const updated = events.map((e) =>
      e.id === dropInfo.event.id
        ? { ...e, start: dropInfo.event.startStr, end: dropInfo.event.endStr }
        : e
    );
    setEvents(updated);
  };

  return (
    <div className="bg-white text-gray-600 p-2 rounded-lg shadow ">
      <h2 className="text-xl font-semibold mb-4 text-center">📅 יומן הפגישות שלי</h2>
      <FullCalendar
        direction="rtl"
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        selectable={true}
        editable={true}
        eventDrop={handleEventDrop}
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={events}
        height="80vh"
        locale="he"
        firstDay={0} // שבוע מיום ראשון
        buttonText={{
          today: "היום",
          month: "חודש",
          week: "שבוע",
          day: "יום",
        }}
      />
    </div>
  );
}
