# Meeting Module

## Overview
The Meeting module manages calendar events and meetings with support for recurring meetings, exceptions, and comprehensive meeting details.

## Module Structure

```
meeting/
├── README.md                    # This file
├── myCalander.tsx               # Calendar view component (FullCalendar)
├── meetingModalOpen.tsx         # Meeting form modal component
├── meetingStyle.css             # Custom styles for calendar
├── hooks/
│   ├── useCalendar.ts          # Business logic for calendar view
│   └── useMeetingModal.ts      # Business logic for meeting modal form
└── models/
    ├── meeting.model.ts        # Meeting data structures and interfaces
    ├── meeting.state.ts        # State management utilities
    └── meeting.validation.ts   # Validation rules
```

## Design Pattern

This module follows the **Component-Hook-Model** pattern for clean separation of concerns:

```
Components (UI)          Hooks (Logic)              Models (Data)
     ↓                        ↓                          ↓
myCalander.tsx    →    useCalendar.ts      →    meeting.model.ts
meetingModalOpen.tsx → useMeetingModal.ts  →    meeting.validation.ts
```

### Benefits
- **Maintainability**: Business logic separated from UI
- **Testability**: Hooks can be tested independently
- **Reusability**: Logic can be shared across components
- **Type Safety**: Full TypeScript coverage

## Components

### myCalander.tsx
**Purpose**: Main calendar view displaying all meetings

**Responsibilities**:
- Render FullCalendar with month/week/day views
- Display meetings from different sources (local, recurring, exceptions)
- Handle event clicks and date selection
- Open meeting modal for create/edit
- Handle drag-and-drop event updates

**Hook Used**: `useCalendar.ts`

**Key Features**:
- Multiple calendar views (month, week, day)
- Recurring meeting support with visual indicators
- Exception handling for recurring meetings
- Drag-and-drop event editing
- Color-coded events by type

### meetingModalOpen.tsx
**Purpose**: Modal form for creating and editing meetings

**Responsibilities**:
- Render meeting form fields
- Display validation errors
- Handle form submission
- Support recurring meeting configuration
- Delete operations (single occurrence or entire series)

**Hook Used**: `useMeetingModal.ts`

**Key Features**:
- Complete meeting details (title, date, time, location, link)
- Project and employee assignment
- Recurring patterns (daily, weekly, monthly, yearly)
- Exception creation for recurring meetings
- Status and category selection
- Private meeting option
- Reminder configuration
- Waze integration for locations

## Hooks

### useCalendar.ts
**Purpose**: Manages calendar view state and operations

**Exports**:
```typescript
{
  // Calendar data
  events: CalendarDataModal[];           // All calendar events
  currentDate: Date;                     // Current calendar view date
  calendarRef: RefObject;                // Reference to FullCalendar
  
  // Modal state
  isModalOpen: boolean;                  // Meeting modal visibility
  selectedEvent: CalendarDataModal;      // Event being edited
  isRecurrence: boolean;                 // Is recurring event
  
  // Event handlers
  handleEventClick: (info) => void;      // Handle event click
  handleDateSelect: (selectInfo) => void;// Handle date selection
  handleEventDrop: (info) => void;       // Handle drag-and-drop
  handleModalClose: () => void;          // Close modal
  
  // Utilities
  checkRecurrenceChild: (id) => boolean; // Check if recurring has exceptions
  refreshCalendar: () => Promise<void>;  // Reload calendar data
}
```

**Key Operations**:
- Fetches meeting data from API
- Combines regular and recurring meetings
- Handles event updates via drag-and-drop
- Manages modal state

### useMeetingModal.ts
**Purpose**: Manages meeting form state and operations

**Exports**:
```typescript
{
  // Form state
  form: CalendarDataModal;               // Current form data
  errors: Record<string, string>;        // Validation errors
  isSaving: boolean;                     // Save operation in progress
  
  // Dropdown lists
  projectsList: Project[];               // Available projects
  citiesList: Global[];                  // Available cities
  statuseList: Global[];                 // Meeting statuses
  categoryList: Global[];                // Meeting categories
  employeesList: SelectEmployeesList[];  // Available employees
  
  // Selected items
  selectedProject: Project | null;       // Selected project
  selectedCity: Global | null;           // Selected city
  selectedEmployee: SelectEmployeesList | null; // Selected employee
  
  // Confirmation dialogs
  isDeleteAllExceptions: boolean;        // Delete exceptions confirmation
  isDeleteConfirm: boolean;              // Delete single confirmation
  isDeleteSeriesConfirm: boolean;        // Delete series confirmation
  setIsDeleteAllExceptions: (val) => void;
  setIsDeleteConfirm: (val) => void;
  setIsDeleteSeriesConfirm: (val) => void;
  
  // Form handlers
  updateForm: (field, value) => void;    // Update form field
  setDateChanged: (e) => void;           // Handle date change
  updateHours: (isFullDay) => void;      // Toggle all-day event
  handleProjectSelect: (proj) => void;   // Select project
  handleCitySelect: (city) => void;      // Select city
  handleEmployeeSelect: (emp) => void;   // Select employee
  toggleRecurrenceDay: (day) => void;    // Toggle recurring day
  
  // Submit handlers
  handleBeforeSubmit: (e) => void;       // Pre-submission validation
  handleSubmit: () => Promise<void>;     // Submit form
  
  // Delete handlers
  handleDeleteClick: () => void;         // Initiate delete
  deleteSingleOccurrence: () => Promise<void>; // Delete one occurrence
  deleteWholeSeries: () => Promise<void>;      // Delete entire series
  
  // Helpers
  getMeetingTitle: () => string;         // Generate modal title
  formatDate: (date) => string;          // Format date for input
  formatTime: (date) => string;          // Format time for input
  combineDateTime: (date, time) => string; // Combine date and time
}
```

**Key Operations**:
- Form initialization and state management
- Validation (subject, date, time constraints)
- API calls for create/update/delete
- Recurring meeting logic
- Exception handling for recurring meetings
- Data list loading (projects, employees, cities, etc.)

## Models

### meeting.model.ts
Defines TypeScript interfaces and types:
- `CalendarEventDto`: Core meeting data
- `CalendarPartData`: Additional meeting details
- `CalendarDataModal`: Combined meeting structure
- `RRule`: Recurring pattern configuration
- `Global`: Generic dropdown items (cities, statuses, categories)

### meeting.state.ts
State management utilities:
- Initial state generators
- State transformers
- Local storage helpers

### meeting.validation.ts
Validation rules and error messages:
- Required field validation
- Date/time constraint validation
- Recurring pattern validation

## Data Flow

### Creating a Meeting
```
User clicks date → useCalendar opens modal → 
meetingModalOpen renders form → User fills form → 
useMeetingModal validates → API call → 
Calendar refreshes → Modal closes
```

### Editing a Meeting
```
User clicks event → useCalendar opens modal with event data → 
meetingModalOpen renders form → User edits → 
useMeetingModal validates → API call (update or insert exception) → 
Calendar refreshes → Modal closes
```

### Deleting a Meeting
```
User clicks delete → Confirmation modal → 
useMeetingModal determines if single/series → 
API call (delete or create type=4 exception) → 
Calendar refreshes → Modal closes
```

## Usage Example

### Using Calendar View
```tsx
import MyScheduler from './pages/meeting/myCalander';

function App() {
  return (
    <MyScheduler 
      userID={currentUserId} 
      userName="John Doe"
    />
  );
}
```

### Using Meeting Modal Standalone
```tsx
import AddMeetingModal from './pages/meeting/meetingModalOpen';

function CustomComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  return (
    <AddMeetingModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      event={selectedEvent}
      userID={currentUserId}
      checkRrecurrenceChild={(recId) => {
        // Check if recurring meeting has exceptions
        return false; // Your logic here
      }}
    />
  );
}
```

## Meeting Types

The module supports four meeting types:

1. **Type 0: Regular Meeting**
   - Single occurrence
   - No recurring pattern
   - Can be edited/deleted freely

2. **Type 1: Recurring Meeting (Master)**
   - Has recurring pattern (RRule)
   - Generates multiple occurrences
   - Editing affects all future occurrences

3. **Type 3: Exception (Modified Occurrence)**
   - Modified instance of recurring meeting
   - References parent via `recurrenceId`
   - Independent from parent changes

4. **Type 4: Deleted Occurrence**
   - Marks occurrence as deleted
   - Hides from calendar
   - Maintains series integrity

## Recurring Patterns

Supported patterns via RRule:
- **Daily**: Every N days
- **Weekly**: Every N weeks on specific days (Sun-Sat)
- **Monthly**: Every N months
- **Yearly**: Every N years

Configuration options:
- `freq`: Pattern frequency (daily/weekly/monthly/yearly)
- `interval`: Every N occurrences
- `count`: Number of total occurrences
- `byweekdays`: Days of week (for weekly pattern)
- `dtStart`: Recurring start date/time

## Best Practices

### When Creating/Editing Meetings
1. Always validate date/time constraints (end > start)
2. Check for recurring exceptions before editing series
3. Use appropriate confirmation dialogs for delete operations
4. Handle loading states during API calls
5. Provide clear feedback for validation errors

### When Working with Recurring Meetings
1. Differentiate between single occurrence and series edits
2. Always show confirmation before deleting exceptions
3. Update `recurrenceId` when creating exceptions
4. Use type=4 for soft-deleting occurrences
5. Refresh calendar after recurring operations

### State Management
1. Keep form state in hook, not component
2. Use localStorage for dropdown list caching
3. Validate before API calls
4. Handle errors gracefully
5. Reset state on modal close

## Future Enhancements

Potential improvements:
- [ ] Timezone support for international meetings
- [ ] Meeting attendees management
- [ ] Email notifications for meeting changes
- [ ] Conflict detection (overlapping meetings)
- [ ] Meeting templates for common patterns
- [ ] Export to iCal/Google Calendar
- [ ] Meeting notes and attachments
- [ ] Video conference integration (Zoom, Teams)
- [ ] Meeting analytics and reports
