# Project Hours Module - ארכיטקטורה

## סקירה כללית
מודול דיווח שעות לפרויקטים עם ארכיטקטורה נקייה ומודולרית. המבנה מבוסס על הפרדת אחריות (Separation of Concerns) ו-Custom Hooks Pattern.

## מבנה תיקיות

```
projectHours/
├── models/                      # מודלים וטיפוסים
│   ├── hourReport.model.ts      # ממשקים ופונקציות עזר
│   ├── hourReportForm.state.ts  # מצבי טופס
│   ├── hourReportValidation.ts  # ולידציה
│   └── index.ts                 # Barrel exports
├── hooks/                       # Custom React Hooks
│   ├── useProjectHours.ts       # לוגיקת רשימת הדיווחים
│   └── useHourReportModal.ts    # לוגיקת המודאל
├── components/                  # רכיבי UI (עתידי)
├── ProjectHours.tsx             # רכיב ראשי - רשימת דיווחים
└── HourReportModalOpen.tsx      # רכיב מודאל - יצירה/עריכה
```

## ארכיטקטורה

### 1. Models Layer (`models/`)

**תפקיד:** הגדרת טיפוסים, ממשקים ופונקציות עזר pure.

#### `hourReport.model.ts`
```typescript
export interface HourReport {
  id: number;
  employeeID: number;
  projectID: number;
  date: Date;
  clockInTime?: string;
  clockOutTime?: string;
  total?: string;
  notes: string;
  // ... ועוד
}

// פונקציות עזר לחישובי זמן
export const timeToMinutes = (time: string): number => { ... }
export const minutesToTime = (minutes: number): string => { ... }
export const calculateTotalHours = (start: string, end: string): string => { ... }
```

#### `hourReportForm.state.ts`
מגדיר את מצב הטופס והערכים ההתחלתיים:
```typescript
export interface HourReportFormState {
  report: HourReportModal;
  isOpen: boolean;
  editingId: number;
  reportingType: 'total' | 'time-range';
  errors: ValidationErrors;
}
```

#### `hourReportValidation.ts`
מחלקה ייעודית לולידציה:
```typescript
export class HourReportValidator {
  validate(): ValidationErrors { ... }
  validateTimeRange(): string | null { ... }
  hasChanges(): boolean { ... }
  prepareForSubmit(): HourReport { ... }
}
```

**יתרונות:**
- ✅ קוד טסטבילי (pure functions)
- ✅ ניתן לשימוש חוזר
- ✅ הפרדה בין לוגיקה עסקית ל-UI
- ✅ Type safety מלא

---

### 2. Hooks Layer (`hooks/`)

**תפקיד:** ניהול State, Side Effects ולוגיקה עסקית.

#### `useProjectHours.ts`
מנהל את רשימת הדיווחים:

```typescript
export const useProjectHours = () => {
  const [reports, setReports] = useState<HourReport[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentDay, setCurrentDay] = useState<Date>(new Date());
  
  // טעינת נתונים
  const loadReports = useCallback(async () => { ... }, [currentDay, employee]);
  
  // ניווט בין ימים
  const navigateDay = useCallback((direction: 'prev' | 'next') => { ... }, [currentDay]);
  
  // פעולות CRUD
  const openNewReport = () => { ... };
  const openEditReport = (report: HourReport) => { ... };
  const confirmDelete = async (id: number) => { ... };
  
  // חישובים
  const totalTime = useMemo(() => getTotalTime(reports), [reports]);
  
  return { reports, employee, currentDay, totalTime, loadReports, navigateDay, ... };
};
```

**אחריות:**
- 📋 ניהול רשימת הדיווחים
- 📅 ניווט בין תאריכים
- 🔄 טעינת נתונים מה-API
- 🗑️ מחיקת דיווחים
- 🧮 חישוב סיכום שעות

---

#### `useHourReportModal.ts`
מנהל את מודאל היצירה/עריכה:

```typescript
export const useHourReportModal = ({ 
  editingReportId, 
  employee, 
  currentDay, 
  isOpen,
  existingReport,
  initialProject,
  onClose 
}) => {
  const [report, setReport] = useState<HourReportModal>(createInitialHourReport());
  const [reportingType, setReportingType] = useState<'total' | 'time-range'>('total');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  
  // טעינת נתוני פרויקט
  const loadProjectData = useCallback(async () => { ... }, [selectedProject]);
  
  // שינוי סוג דיווח
  const changeReportingType = (type: 'total' | 'time-range') => { ... };
  
  // עדכון שדות
  const updateReportField = (field: string, value: any) => { ... };
  
  // שמירה
  const handleSave = async () => {
    const validator = new HourReportValidator(report, ...);
    const errors = validator.validate();
    if (errors.time || errors.project) return false;
    
    const preparedReport = validator.prepareForSubmit();
    await hourReportService.save(preparedReport);
    return true;
  };
  
  return { report, reportingType, errors, selectedProject, contracts, handleSave, ... };
};
```

**אחריות:**
- 📝 ניהול מצב הטופס
- 🔍 בחירת פרויקט
- 📦 טעינת חוזים/תת-חוזים/שלבים
- ✅ ולידציה
- 💾 שמירה ל-API
- 🔄 בדיקת חפיפות זמנים

---

### 3. Components Layer

#### `ProjectHours.tsx`
רכיב ראשי נקי המשתמש ב-Hook:

```typescript
export default function ProjectHours() {
  const {
    reports,
    employee,
    currentDay,
    totalTime,
    isModalOpen,
    editingReportId,
    loadReports,
    navigateDay,
    openNewReport,
    openEditReport,
    confirmDelete,
  } = useProjectHours();

  // טעינה ראשונית
  useEffect(() => { loadReports(); }, [loadReports]);

  // רק JSX - ללא לוגיקה!
  return (
    <div className="p-6">
      {/* ניווט תאריכים */}
      {/* טבלת דיווחים */}
      {/* סטטיסטיקות */}
      {/* מודאל */}
    </div>
  );
}
```

**מאפיינים:**
- ✨ קוד UI נקי וקריא
- 🔌 קל לבדיקה
- ♻️ ניתן לשימוש חוזר בלוגיקה
- 🚀 ביצועים מיטביים (מזעור re-renders)

---

#### `HourReportModalOpen.tsx`
מודאל נקי:

```typescript
export default function HourReportModalOpen({ isOpen, onClose, ... }) {
  const {
    report: formReport,
    reportingType,
    errors,
    isSaving,
    selectedProject,
    contracts,
    subContracts,
    steps,
    updateReportField,
    changeReportingType,
    handleSave,
  } = useHourReportModal({ ... });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await handleSave();
    if (success) onClose();
  };

  // רק JSX!
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## שיפורים שבוצעו

### 🔧 לפני הרפקטור:

**ProjectHours.tsx:**
- ❌ 15+ שורות של `useState`
- ❌ 3 `useEffect` מורכבים
- ❌ לוגיקה מעורבבת עם UI
- ❌ קשה לבדיקה
- ❌ re-renders מיותרים

**HourReportModalOpen.tsx:**
- ❌ 20+ שורות של `useState`
- ❌ 5 `useEffect` עם תלויות מורכבות
- ❌ ולידציה מעורבבת עם UI
- ❌ 400+ שורות של קוד

### ✅ אחרי הרפקטור:

**ProjectHours.tsx:**
- ✅ 1 Hook call פשוט
- ✅ 1 `useEffect` יחיד
- ✅ 150 שורות (במקום 300)
- ✅ UI נקי וקריא
- ✅ קל לבדיקה

**HourReportModalOpen.tsx:**
- ✅ 1 Hook call פשוט
- ✅ 0 `useEffect` (הכל ב-Hook)
- ✅ 230 שורות (במקום 400+)
- ✅ ולידציה מופרדת
- ✅ קל לתחזוקה

---

## דפוסי שימוש

### 1. הוספת שדה חדש לדיווח

```typescript
// 1. הוסף ל-interface במודל
// models/hourReport.model.ts
export interface HourReport {
  // ... שדות קיימים
  newField: string;
}

// 2. הוסף לפונקצית היצירה
export const createInitialHourReport = (): HourReportModal => ({
  // ... שדות קיימים
  newField: '',
});

// 3. השתמש ב-updateReportField
<input
  value={formReport.newField}
  onChange={(e) => updateReportField('newField', e.target.value)}
/>
```

### 2. הוספת ולידציה חדשה

```typescript
// models/hourReportValidation.ts
export class HourReportValidator {
  validate(): ValidationErrors {
    const errors: ValidationErrors = {};
    
    // הוסף ולידציה חדשה
    if (!this.validateNewField()) {
      errors.newField = 'שדה חדש לא תקין';
    }
    
    return errors;
  }
  
  private validateNewField(): boolean {
    // לוגיקת ולידציה
    return true;
  }
}
```

### 3. הוספת פעולה חדשה

```typescript
// hooks/useProjectHours.ts
export const useProjectHours = () => {
  // ... state קיים
  
  const newAction = useCallback(async () => {
    try {
      // לוגיקה
      await someService.doSomething();
      await loadReports(); // רענון
    } catch (error) {
      console.error(error);
    }
  }, [dependencies]);
  
  return { 
    // ... exports קיימים
    newAction 
  };
};
```

---

## עקרונות תכנות

### 1. Single Responsibility Principle
כל קובץ/מחלקה/פונקציה עושים **דבר אחד** בלבד:
- `hourReport.model.ts` - רק טיפוסים ופונקציות עזר
- `hourReportValidation.ts` - רק ולידציה
- `useProjectHours.ts` - רק ניהול רשימה
- Components - רק UI

### 2. DRY (Don't Repeat Yourself)
- פונקציות עזר ב-models משותפות
- Hook logic ניתן לשימוש חוזר
- Validation class אחת

### 3. Separation of Concerns
- **Models** - Data & Logic
- **Hooks** - State & Effects
- **Components** - UI
- **Services** - API

### 4. Testability
כל חלק ניתן לבדיקה בנפרד:
```typescript
// בדיקת פונקצית עזר
test('calculateTotalHours', () => {
  expect(calculateTotalHours('09:00', '17:00')).toBe('08:00');
});

// בדיקת ולידציה
test('HourReportValidator validates time range', () => {
  const validator = new HourReportValidator(report, ...);
  const errors = validator.validate();
  expect(errors.time).toBeNull();
});

// בדיקת Hook
test('useProjectHours loads reports', async () => {
  const { result } = renderHook(() => useProjectHours());
  await act(() => result.current.loadReports());
  expect(result.current.reports).toHaveLength(5);
});
```

---

## Dependencies

- React 18+
- TypeScript 5+
- Services: `hourReportService`, `authService`, `TaskService`
- UI: Tailwind CSS, lucide-react icons

---

## Migration Notes

### קבצים שהוחלפו:
- ✅ `ProjectHours.tsx` - refactored לחלוטין
- ✅ `HourReportModalOpen.tsx` - refactored לחלוטין

### קבצים חדשים:
- 🆕 `models/hourReport.model.ts`
- 🆕 `models/hourReportForm.state.ts`
- 🆕 `models/hourReportValidation.ts`
- 🆕 `models/index.ts`
- 🆕 `hooks/useProjectHours.ts`
- 🆕 `hooks/useHourReportModal.ts`

### קבצים ישנים (ניתן להסרה):
- ⚠️ `interface/HourReportModal.ts` - עכשיו ב-`models/`

---

## למפתחים

כשמוסיפים פיצ'ר חדש:

1. **שאל את עצמך:** האם צריך state חדש? → Hook
2. **שאל את עצמך:** האם צריך טיפוס/ממשק? → Model
3. **שאל את עצמך:** האם צריך לוגיקה עסקית? → Hook או Model
4. **שאל את עצמך:** האם צריך UI? → Component

**זכור:** Keep it simple, keep it clean! 🚀
