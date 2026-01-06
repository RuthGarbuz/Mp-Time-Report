# Report Module

## Overview

The Report module manages weekly time reports for employees. It provides a comprehensive interface for creating, editing, viewing, and deleting time records with features like week navigation, time validation, overlap detection, and statistics tracking.

This module has been refactored to follow clean architecture principles with separation of concerns between UI components, business logic (hooks), and data models.

## Architecture

```
src/pages/report/
├── models/                    # Data models, types, and utilities
│   ├── report.model.ts       # Core interfaces and helper functions
│   ├── reportValidation.ts  # Validation logic
│   ├── reportForm.state.ts  # Form state management
│   └── index.ts              # Barrel export
├── hooks/                     # Custom React hooks
│   ├── useReportList.ts      # List management logic
│   ├── useReportModal.ts     # Modal form logic
│   └── index.ts              # Barrel export
├── ReportList.tsx            # Main list component
└── createUpdateReportModal.tsx # Modal form component
```

## Components

### ReportList.tsx

Main component for displaying and managing weekly time reports.

**Features:**
- **Week Navigation**: Navigate between weeks (previous/next/today)
- **Report Grid**: Displays all reports for the current week with:
  - Date and weekday
  - Report type (work, vacation, sick leave, etc.)
  - Clock in/out times
  - Total hours
- **Statistics**: Shows weekly totals (total hours, days worked, standard hours)
- **CRUD Operations**: Add, edit, and delete reports with permissions
- **Context Menu**: Quick access to edit/delete actions
- **Permission-Based Access**: Respects user and employee permissions

**Props:** None (self-contained)

**Example Usage:**
```tsx
import ReportList from './pages/report/ReportList';

function App() {
  return <ReportList />;
}
```

### createUpdateReportModal.tsx

Modal form for creating and updating time reports.

**Features:**
- **Date Selection**: Date picker with week range validation
- **Type Selection**: Dropdown for report types (work, vacation, etc.)
- **Time Entry**: Clock in/out time inputs with validation
- **Auto-Calculation**: Automatically calculates total hours
- **Validation**: Real-time validation of time entries
- **Scroll Locking**: Prevents background scroll when open
- **Error Display**: Shows validation errors inline

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `title: string` - Modal title
- `newReport: TimeRecord` - Report data being edited
- `setNewReport: Function` - Update report data
- `typeReports: TimeHourReportsType[]` - Available report types
- `closeModal: Function` - Close modal callback
- `handleSubmit: Function` - Form submission handler
- `currentWeek: Date` - Current week for validation
- `errorMessage: string` - External error message

**Example Usage:**
```tsx
<ReportModal
  isOpen={isModalOpen}
  title="הוספת דיווח חדש"
  newReport={newReport}
  setNewReport={setNewReport}
  typeReports={typeReports}
  closeModal={handleCloseModal}
  handleSubmit={handleSubmit}
  currentWeek={currentWeek}
  errorMessage={errorMessage}
/>
```

## Models

### report.model.ts

Core data models and utility functions for time reports.

**Interfaces:**
- `TimeRecord` - Individual time report entry
- `Employee` - Employee information
- `TimeHourReportsType` - Report type definition
- `WeekRange` - Week start and end dates
- `ReportFormErrors` - Form validation errors

**Helper Functions:**
- `timeToMinutes(time: string): number` - Convert HH:MM to minutes
- `minutesToTime(minutes: number): string` - Convert minutes to HH:MM
- `calculateTotalHours(start, end): string` - Calculate duration
- `getTotalTime(reports): string` - Sum total hours from multiple reports
- `getReportedDaysCount(reports): number` - Count unique reported days
- `formatDateShort(date): string` - Format as DD/MM/YY
- `formatDateOnly(date): string` - Format as YYYY-MM-DD
- `toDateString(date): string` - Convert to ISO date string
- `getWeekRange(date): WeekRange` - Calculate week boundaries
- `formatWeekRange(date): string` - Format week range for display
- `createInitialReport(date, hours?): TimeRecord` - Create new report with defaults

### reportValidation.ts

Validation logic for time reports.

**Class: TimeRecordValidator**

Static methods:
- `validateTimes(clockIn, clockOut): string` - Validate time order
- `validateOverlappingReports(reports, current?): string[]` - Detect time overlaps
- `validateWeekRange(date, start, end): string` - Validate date within week
- `validate(report, allReports, weekStart?, weekEnd?): ValidationResult` - Comprehensive validation

**Example Usage:**
```typescript
const result = TimeRecordValidator.validate(
  newReport,
  existingReports,
  weekStart,
  weekEnd
);

if (!result.isValid) {
  console.log(result.timeError);
  console.log(result.overlapErrors);
}
```

### reportForm.state.ts

Form state management utilities.

**Functions:**
- `createInitialFormErrors(): ReportFormErrors` - Create empty errors
- `resetFormErrors(): ReportFormErrors` - Reset all errors
- `hasFormErrors(errors): boolean` - Check if any errors exist

## Hooks

### useReportList

Custom hook managing the report list component state and logic.

**Returns:**
- **State:**
  - `employee: Employee | null` - Current employee data
  - `reports: TimeRecord[]` - All reports
  - `filteredReports: TimeRecord[]` - Filtered reports for display
  - `typeReports: TimeHourReportsType[]` - Available report types
  - `currentWeek: Date` - Current week being viewed
  - `totalTime: string` - Total hours for the week
  - `totalDay: number` - Number of days worked
  - `editPermission: boolean` - User has edit permission
  - `allowAddReport: boolean` - User can add reports
  - Modal states (isModalOpen, newReport, errorMessage, etc.)
  - Delete confirmation states (isConfirmOpen, itemToDelete, etc.)

- **Actions:**
  - `navigateWeek(direction)` - Navigate to prev/next/today
  - `openNewReport()` - Open modal for new report
  - `openEditReport(id)` - Open modal to edit existing report
  - `closeReportModal()` - Close the report modal
  - `handleSubmit(e)` - Submit form (create or update)
  - `onDeleteClick(id)` - Show delete confirmation
  - `confirmDelete()` - Execute delete
  - `cancelDelete()` - Cancel delete
  - `getReportTypeStyle(type)` - Get CSS classes for report type badge

**Example Usage:**
```typescript
const {
  employee,
  filteredReports,
  currentWeek,
  navigateWeek,
  openNewReport,
  handleSubmit
} = useReportList();

return (
  <div>
    <button onClick={() => navigateWeek('prev')}>Previous Week</button>
    <button onClick={openNewReport}>Add Report</button>
    {filteredReports?.map(report => (
      <ReportRow key={report.id} report={report} />
    ))}
  </div>
);
```

### useReportModal

Custom hook managing the report modal form state and logic.

**Parameters:**
- `isOpen: boolean` - Modal open state
- `newReport: TimeRecord` - Current report data
- `setNewReport: Function` - Update report function
- `currentWeek: Date` - Current week for validation

**Returns:**
- `error: string` - Current validation error
- `weekRange: WeekRange` - Week boundaries for date validation
- `handleClockInChange(value)` - Handle clock in time change
- `handleClockOutChange(value)` - Handle clock out time change
- `handleDateChange(value)` - Handle date change
- `handleTypeChange(value)` - Handle report type change
- `handleNotesChange(value)` - Handle notes change

**Features:**
- Real-time time validation
- Automatic total hours calculation via useEffect
- Week range enforcement
- Error state management

**Example Usage:**
```typescript
const {
  error,
  weekRange,
  handleClockInChange,
  handleClockOutChange
} = useReportModal({
  isOpen,
  newReport,
  setNewReport,
  currentWeek
});

return (
  <form>
    <input
      type="time"
      value={newReport.clockInTime}
      onChange={(e) => handleClockInChange(e.target.value)}
    />
    {error && <p>{error}</p>}
  </form>
);
```

## Services Used

The module integrates with the following services:

- `authService` - User authentication and permissions
- `timeRecordService` - Time record CRUD operations
  - `getEmployee()` - Get current employee data
  - `getTimeRecordsData(week)` - Fetch reports for week
  - `insertTimeRecord(report, action)` - Create or update report
  - `deleteTimeRecord(id)` - Delete report

## Permission System

The module respects two levels of permissions:

1. **Edit Permission** (`editPermission`)
   - Loaded from `authService.getCurrentEmployee()`
   - Controls visibility of edit/delete buttons
   - Required for modifying any reports

2. **Allow Add Report** (`allowAddReport`)
   - Loaded from `authService.getCurrentUser()`
   - Controls visibility of "Add Report" button
   - Required for creating new reports

Both permissions must be true for full access to CRUD operations.

## Validation Rules

### Time Validation
- Clock out time must be after clock in time
- Empty times are allowed for certain report types (e.g., vacation)
- Time format: HH:MM (24-hour)

### Overlap Detection
- Reports are grouped by date
- Time ranges are checked for overlaps on the same day
- Overlapping entries generate error messages with details

### Week Range Validation
- Report dates must fall within the current week being viewed
- Week starts on Sunday (day 0)
- Week ends on Saturday (day 6)

### Report Types
- **Type 5**: Regular Work - requires times, counts toward totals
- **Type 6**: Work from Home - requires times, counts toward totals
- **Type 3**: Vacation - times disabled/optional, doesn't count toward totals
- **Type 1**: Sick Leave - tracked separately
- **Type 4**: Military Reserve - tracked separately
- **Type 2**: Paid Absence - tracked separately

## Statistics Calculation

### Total Hours
- Sums hours from all Type 5 and Type 6 reports
- Ignores other report types
- Format: HH:MM

### Days Worked
- Counts unique dates with Type 5 or Type 6 reports
- Multiple reports on same day count as one day

### Standard Hours
- Loaded from employee profile (`minutesHoursAmount`)
- Displayed for reference
- Used as default duration for new reports

## State Management

The module uses:
- **Custom Hooks**: Encapsulate business logic
- **useState**: Component-level state
- **useEffect**: Side effects (data loading, filtering)
- **useModal**: Global scroll locking context

## Styling

- **Tailwind CSS**: All styling via utility classes
- **Responsive Design**: Mobile-first approach with md: breakpoints
- **Color Coding**: Different colors for report types
- **Gradients**: Modern gradient backgrounds
- **Animations**: Hover effects and transitions

## Error Handling

- **Validation Errors**: Displayed inline near relevant fields
- **Overlap Errors**: Shown at top of form
- **Network Errors**: Console logging (could be enhanced)
- **User Feedback**: Alert for closing form with errors

## Future Improvements

1. **Loading States**: Add loading indicators for async operations
2. **Optimistic Updates**: Update UI before server confirmation
3. **Undo/Redo**: Allow reverting recent changes
4. **Bulk Operations**: Select and modify multiple reports
5. **Export**: Export reports to Excel/PDF
6. **Filters**: Filter by type, date range, etc.
7. **Search**: Search in notes or by date
8. **Pagination**: For large datasets
9. **Caching**: Cache reports to reduce server calls
10. **Offline Support**: Work offline with sync later

## Migration Notes

### From Old Implementation

The refactored version maintains 100% functional compatibility while improving:

1. **Separation of Concerns**
   - Business logic moved from components to hooks
   - Validation logic moved to dedicated validator class
   - Helper functions moved to model files

2. **Type Safety**
   - All functions properly typed
   - Consistent interfaces throughout

3. **Maintainability**
   - Smaller, focused files
   - Clear file organization
   - Comprehensive documentation

4. **Testability**
   - Pure functions in models
   - Hooks can be tested independently
   - Components are simpler to test

### Breaking Changes

None - API and behavior remain identical.

### Deprecated Patterns

- Inline validation functions
- Scattered helper functions
- Mixed concerns in components

## Testing

Recommended test coverage:

1. **Unit Tests**
   - All helper functions in models
   - Validation logic
   - Time calculations

2. **Hook Tests**
   - useReportList actions
   - useReportModal validation
   - State updates

3. **Integration Tests**
   - Full report creation flow
   - Edit and delete flows
   - Week navigation

4. **E2E Tests**
   - Complete user workflows
   - Permission-based access
   - Error scenarios

## Dependencies

- React 18+
- TypeScript
- Tailwind CSS
- lucide-react (icons)
- date-fns or native Date API

## License

Internal use only.
