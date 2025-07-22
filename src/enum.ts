export enum TimeType {
  Sick = 1,
  PaidLeave = 2,
  Vacation = 3,
  ArmyReserve = 4,
  Regular = 5,
  Remote = 6
}
export const TimeTypeLabels: Record<TimeType, string> = {
  [TimeType.Sick]: "מחלה",
  [TimeType.PaidLeave]: "העדרות בתשלום",
  [TimeType.Vacation]: "חופש",
  [TimeType.ArmyReserve]: "מילואים",
  [TimeType.Regular]: "רגיל",
  [TimeType.Remote]: "עבודה מהבית"
};