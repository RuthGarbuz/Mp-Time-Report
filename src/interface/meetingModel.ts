export interface RRuleDto {
  freq: "daily" | "weekly" | "monthly" | "yearly";
  dtStart: string; // ISO date string
  until?: string; // ISO date string
  count?: number | null;
  interval?: number;
  byweekdays?: string[] | null;
  range?: number | null;
}

export interface CalendarEventDto {
  id: number;
  recurrenceId?: string | null;
  parentId?: string | null;
  title: string;
  start: string; // ISO string (e.g. "2025-05-12T08:00:00")
  end?: string | null;
  rRule?: RRuleDto | null;
  exDate?: string[] | null;
  allDay: boolean;
  indexInSeries?: number | null;
  type: number;
  recurrenceXml?: string | null;
}
export interface CalendarDataModal {
  calendarEventDto:CalendarEventDto;
  calendarPartData:CalendarPartData;
}
export interface CalendarPartData {
  cityID?: number | null;
  // cityName?:string|null;
  projectID?: number | null;
  projectName?:string|null;
  statusID?: number | null;
  // statusName?:string|null;
  categoryID?: number | null;
 // categoryName?:string|null;
  description?: string | null;
  hasReminder: boolean;
  reminderTime?: number | null;
  location?: string | null;
  meetingLink?: string | null;
  isPrivate?:boolean;
  // isRecurring?:boolean;
 

}
export interface Global {
  id: number;
  name: string;
}
export interface MeetingDataLists  {
  citiesList?:Global[];
  statuseList?:Global[];
  categoryList?:Global[]; 
}