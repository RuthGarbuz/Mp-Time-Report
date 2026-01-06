# Conversations Module - ארכיטקטורה

## סקירה כללית
מודול ניהול שיחות עם לקוחות עם ארכיטקטורה נקייה ומודולרית. המבנה מבוסס על הפרדת אחריות (Separation of Concerns) ו-Custom Hooks Pattern.

## מבנה תיקיות

```
conversations/
├── models/                          # מודלים וטיפוסים
│   ├── conversation.model.ts        # ממשקי נתוני שיחה ואיש קשר
│   ├── conversationForm.state.ts    # מצבי טופס ושגיאות
│   ├── conversationValidation.ts    # ולידציה
│   └── index.ts                     # Barrel exports
├── hooks/                           # Custom React Hooks
│   ├── useConversationList.ts       # לוגיקת רשימת השיחות
│   ├── useConversationModal.ts      # לוגיקת מודאל יצירה/עריכה
│   └── useContactGrid.ts            # לוגיקת בחירת אנשי קשר
├── components/                      # רכיבי UI משותפים (עתידי)
├── ConversationList.tsx             # רכיב ראשי - רשימת שיחות
├── conversationModalOpen.tsx        # מודאל יצירה/עריכה/צפייה
└── contactGrid.tsx                  # רשת בחירת אנשי קשר
```

## ארכיטקטורה

### 1. Models Layer (`models/`)

**תפקיד:** הגדרת טיפוסים, ממשקים ופונקציות עזר pure.

#### `conversation.model.ts`
```typescript
export interface ConversationData {
  id: number;
  subject: string;
  startDate: string;
  dueDate: string;
  projectID: number;
  projectName: string;
  organizerID: number;
  recipientID: number;
  contactID: number;
  contactName: string;
  contactEmail: string;
  // ... ועוד
}

export interface Contact {
  id: number;
  name: string;
  companyName: string;
  email: string;
  contactTell: string;
  contactCell: string;
}

export interface ConversationLogType {
  id: number;
  name: string;
}
```

#### `conversationForm.state.ts`
מגדיר את מצב הטופס והערכים ההתחלתיים:
```typescript
export interface ConversationFormErrors {
  subject: string;
  time: string;
  recipient: string;
  general: string;
}
```

#### `conversationValidation.ts`
מחלקה ייעודית לולידציה:
```typescript
export class ConversationValidator {
  static validate(conversation: ConversationData): ConversationFormErrors;
  static validateDates(startDate: string, dueDate: string): string | null;
  static validateSubject(subject: string): string | null;
  static validateRecipient(recipientID: number): string | null;
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

#### `useConversationList.ts`
מנהל את רשימת השיחות:

```typescript
export const useConversationList = (projectId?: number) => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  
  // טעינת נתונים
  const loadConversations = useCallback(async () => { ... }, [selectedProject]);
  
  // פעולות CRUD
  const openNewConversation = () => { ... };
  const openConversation = (conversation: ConversationData) => { ... };
  const deleteConversation = async (id: number) => { ... };
  
  return { 
    conversations, 
    projects, 
    selectedProject, 
    isModalOpen,
    selectedConversation,
    loadConversations, 
    openNewConversation,
    openConversation,
    deleteConversation,
    ... 
  };
};
```

**אחריות:**
- 📋 ניהול רשימת השיחות
- 🔍 סינון לפי פרויקט
- 🔄 טעינת נתונים מה-API
- 🗑️ מחיקת שיחות
- 📝 פתיחת מודאל יצירה/עריכה

---

#### `useConversationModal.ts`
מנהל את מודאל היצירה/עריכה:

```typescript
export const useConversationModal = ({
  conversation,
  setConversation,
  onSave,
  onClose,
  userID
}) => {
  const [isReadOnly, setIsReadOnly] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [errors, setErrors] = useState<ConversationFormErrors>(createInitialFormState());
  const [employeesList, setEmployeesList] = useState<SelectEmployeesList[]>([]);
  const [logTypes, setLogTypes] = useState<ConversationLogType[]>([]);
  const [contactsList, setContactsList] = useState<Contact[]>([]);
  
  // מעבר בין מצבים: צפייה/עריכה/הוספה חדשה
  const handleEditOrAdd = (id: number) => {
    if (id === 0) {
      setIsNew(true);
      setIsReadOnly(false);
      // איפוס טופס חדש
    } else {
      setIsNew(false);
      setIsReadOnly(false);
    }
  };
  
  // שמירה עם ולידציה
  const handleSave = async () => {
    const validationErrors = ConversationValidator.validate(conversation);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return false;
    }
    
    const success = isNew 
      ? await insertConverstion(conversation)
      : await updateConverstion(conversation);
      
    if (success) {
      setIsReadOnly(true);
      onSave();
      return true;
    }
    return false;
  };
  
  return { 
    isReadOnly, 
    isNew, 
    errors, 
    employeesList, 
    logTypes,
    handleEditOrAdd, 
    handleSave, 
    ... 
  };
};
```

**אחריות:**
- 📝 ניהול מצבי הטופס (קריאה/עריכה/יצירה)
- 🔍 טעינת רשימות (עובדים, סוגי שיחה, אנשי קשר)
- ✅ ולידציה
- 💾 שמירה ל-API (insert/update)
- 🎨 ניהול UI states (פתיחת dropdowns, modals)

---

#### `useContactGrid.ts`
מנהל את בחירת אנשי הקשר:

```typescript
export const useContactGrid = ({
  contacts,
  onSelect,
  onClose,
  isMulti = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  
  // סינון אנשי קשר לפי חיפוש
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.companyName.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);
  
  // בחירה/ביטול בחירה
  const toggleSelect = (contact: Contact) => {
    if (isMulti) {
      // לוגיקת multi-select
    } else {
      setSelectedContact(contact);
    }
  };
  
  // אישור הבחירה
  const handleConfirm = async () => {
    const selected = isMulti ? selectedContacts : selectedContact;
    await onSelect(selected);
    onClose();
  };
  
  return { 
    searchQuery, 
    setSearchQuery, 
    filteredContacts, 
    toggleSelect, 
    handleConfirm,
    ... 
  };
};
```

**אחריות:**
- 🔍 חיפוש אנשי קשר
- ✅ בחירה (יחיד או מרובה)
- 📋 סינון תוצאות
- ✔️ אישור ושמירה

---

### 3. Components Layer

#### `ConversationList.tsx`
רכיב ראשי נקי המשתמש ב-Hook:

```typescript
export default function ConversationList() {
  const {
    conversations,
    projects,
    selectedProject,
    isModalOpen,
    selectedConversation,
    loadConversations,
    openNewConversation,
    openConversation,
    handleProjectChange,
  } = useConversationList();

  // טעינה ראשונית
  useEffect(() => { loadConversations(); }, [loadConversations]);

  // רק JSX - ללא לוגיקה!
  return (
    <div className="p-6">
      {/* סינון פרויקטים */}
      {/* טבלת שיחות */}
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

#### `conversationModalOpen.tsx`
מודאל נקי עם אינטגרציה ל-useModal:

```typescript
export default function ConversationModalOpen({ 
  isOpen, 
  newConversation, 
  setNewConversation,
  saveConversation,
  userID 
}) {
  const { openModal, closeModal } = useModal();
  
  const {
    isReadOnly,
    errors,
    employeesList,
    logTypes,
    handleEditOrAdd,
    handleSave,
    openContactList,
    ...
  } = useConversationModal({
    conversation: newConversation,
    setConversation: setNewConversation,
    onSave: saveConversation,
    onClose: resetNewConversation,
    userID
  });

  // נעילת scroll כשהמודאל פתוח
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  // רק JSX!
  return <form>...</form>;
}
```

**תכונות:**
- 🔒 **Scroll Locking** - נעילה אוטומטית של גלילת הדף
- 🎭 **3 מצבים** - צפייה בלבד / עריכה / הוספה חדשה
- ✅ **ולידציה מלאה** - שדות חובה ותאריכים
- 📋 **בחירת אנשי קשר** - דרך ContactsGrid
- 👥 **AutoComplete** - לבחירת מקבל השיחה

---

#### `contactGrid.tsx`
רשת בחירת אנשי קשר:

```typescript
export default function ContactsGrid({ 
  contacts, 
  onClose, 
  handleSelectContact 
}) {
  const {
    searchQuery,
    setSearchQuery,
    filteredContacts,
    selectedCount,
    toggleSelect,
    handleConfirm,
  } = useContactGrid({
    contacts,
    onSelect: handleSelectContact,
    onClose,
    isMulti: false
  });

  // רק JSX!
  return (
    <div className="modal">
      {/* חיפוש */}
      {/* רשימה */}
      {/* כפתורים */}
    </div>
  );
}
```

---

## שיפורים שבוצעו

### 🔧 לפני הרפקטור:

**ConversationList.tsx:**
- ❌ 20+ שורות של `useState`
- ❌ 5 `useEffect` מורכבים
- ❌ לוגיקה מעורבבת עם UI
- ❌ 500+ שורות קוד
- ❌ קשה לבדיקה

**conversationModalOpen.tsx:**
- ❌ 25+ שורות של `useState`
- ❌ 7 `useEffect` עם תלויות מסובכות
- ❌ ולידציה מעורבבת עם UI
- ❌ 600+ שורות של קוד
- ❌ ניהול scroll ידני

**contactGrid.tsx:**
- ❌ 15+ שורות של `useState`
- ❌ לוגיקת חיפוש מעורבבת
- ❌ 300+ שורות קוד

### ✅ אחרי הרפקטור:

**ConversationList.tsx:**
- ✅ 1 Hook call פשוט
- ✅ 1 `useEffect` יחיד
- ✅ 200 שורות (במקום 500)
- ✅ UI נקי וקריא
- ✅ קל לבדיקה

**conversationModalOpen.tsx:**
- ✅ 2 Hook calls (useModal + useConversationModal)
- ✅ 1 `useEffect` לscroll locking
- ✅ 500 שורות (במקום 600+)
- ✅ ולידציה מופרדת
- ✅ scroll locking אוטומטי דרך context

**contactGrid.tsx:**
- ✅ 1 Hook call פשוט
- ✅ 200 שורות (במקום 300)
- ✅ חיפוש מיטבי עם useMemo
- ✅ קל לתחזוקה

---

## תכונות מיוחדות

### 1. Scroll Locking עם useModal Context

```typescript
// במודאל:
const { openModal, closeModal } = useModal();

useEffect(() => {
  if (isOpen) {
    openModal(); // נועל scroll
    return () => closeModal(); // משחרר
  }
}, [isOpen, openModal, closeModal]);
```

**יתרונות:**
- ✅ ניהול מרכזי של scroll locking
- ✅ תמיכה במספר מודלים במקביל (counter-based)
- ✅ ניקיון אוטומטי (cleanup)
- ✅ שמירת מיקום scroll

### 2. מצבי טופס מתקדמים

המודאל תומך ב-3 מצבים:
- **📖 צפייה (Read-only)** - כל השדות נעולים, כפתורי עריכה/הוספה
- **✏️ עריכה** - עריכת שיחה קיימת
- **➕ הוספה חדשה** - יצירת שיחה חדשה

### 3. ולידציה חכמה

```typescript
class ConversationValidator {
  static validate(conversation: ConversationData): ConversationFormErrors {
    const errors = createInitialFormState();
    
    // ולידציה של נושא (חובה)
    if (!conversation.subject?.trim()) {
      errors.subject = 'נושא השיחה הוא שדה חובה';
    }
    
    // ולידציה של תאריכים
    if (conversation.startDate && conversation.dueDate) {
      if (new Date(conversation.dueDate) < new Date(conversation.startDate)) {
        errors.time = 'תאריך חזרה צריך להיות אחרי תאריך הפניה';
      }
    }
    
    // ולידציה של מקבל (חובה)
    if (!conversation.recipientID) {
      errors.recipient = 'יש לבחור מקבל לשיחה';
    }
    
    return errors;
  }
}
```

### 4. חיפוש מיטבי

```typescript
// ב-useContactGrid:
const filteredContacts = useMemo(() => {
  const query = searchQuery.toLowerCase();
  if (!query) return contacts;
  
  return contacts.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.companyName.toLowerCase().includes(query)
  );
}, [contacts, searchQuery]);
```

**יתרונות:**
- ✅ חישוב מחדש רק כשנדרש
- ✅ חיפוש בשם ובחברה
- ✅ ביצועים מצוינים

---

## דפוסי שימוש

### 1. הוספת שדה חדש לשיחה

```typescript
// 1. הוסף ל-interface במודל
// models/conversation.model.ts
export interface ConversationData {
  // ... שדות קיימים
  newField: string;
}

// 2. הוסף ולידציה אם נדרש
// models/conversationValidation.ts
static validate(conversation: ConversationData): ConversationFormErrors {
  // ... ולידציה קיימת
  if (!conversation.newField) {
    errors.newField = 'שדה חדש הוא שדה חובה';
  }
}

// 3. השתמש בשדה במודאל
<input
  value={newConversation.newField}
  onChange={(e) => setNewConversation(prev => ({
    ...prev,
    newField: e.target.value
  }))}
/>
```

### 2. שימוש ב-useModal לנעילת scroll

```typescript
import { useModal } from '../ModalContextType';

function MyModal({ isOpen }) {
  const { openModal, closeModal } = useModal();
  
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
  
  return <div>...</div>;
}
```

---

## עקרונות תכנות

### 1. Single Responsibility Principle
כל קובץ/מחלקה/פונקציה עושים **דבר אחד** בלבד.

### 2. DRY (Don't Repeat Yourself)
- פונקציות עזר ב-models משותפות
- Hook logic ניתן לשימוש חוזר
- Validation class אחת

### 3. Separation of Concerns
- **Models** - Data & Types & Validation
- **Hooks** - State & Effects & Business Logic
- **Components** - UI Only
- **Services** - API Calls

### 4. Testability
```typescript
// בדיקת ולידציה
test('validates required subject', () => {
  const errors = ConversationValidator.validate({ subject: '' });
  expect(errors.subject).toBeTruthy();
});

// בדיקת Hook
test('useContactGrid filters contacts', () => {
  const { result } = renderHook(() => useContactGrid({...}));
  act(() => result.current.setSearchQuery('john'));
  expect(result.current.filteredContacts).toHaveLength(1);
});
```

---

## Dependencies

- React 18+
- TypeScript 5+
- Services: `employeeService`, `TaskService`
- UI: Tailwind CSS, lucide-react, heroicons
- Context: `ModalContextType` (useModal)

---

## Migration Notes

### קבצים שהוחלפו:
- ✅ `ConversationList.tsx` - refactored לחלוטין
- ✅ `conversationModalOpen.tsx` - refactored לחלוטין
- ✅ `contactGrid.tsx` - refactored לחלוטין

### קבצים חדשים:
- 🆕 `models/conversation.model.ts`
- 🆕 `models/conversationForm.state.ts`
- 🆕 `models/conversationValidation.ts`
- 🆕 `models/index.ts`
- 🆕 `hooks/useConversationList.ts`
- 🆕 `hooks/useConversationModal.ts`
- 🆕 `hooks/useContactGrid.ts`

### קבצים ישנים (שמורים כגיבוי):
- 📦 `ConversationList.old.tsx`
- 📦 `conversationModalOpen.old.tsx`
- 📦 `contactGrid.old.tsx`

---

## למפתחים

כשמוסיפים פיצ'ר חדש:

1. **שאל את עצמך:** האם צריך state חדש? → Hook
2. **שאל את עצמך:** האם צריך טיפוס/ממשק? → Model
3. **שאל את עצמך:** האם צריך לוגיקה עסקית? → Hook או Validator
4. **שאל את עצמך:** האם צריך UI? → Component

**זכור:** Keep it simple, keep it clean! 🚀
