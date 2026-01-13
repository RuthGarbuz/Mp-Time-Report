# Conversations Module - Architecture

## Overview
Customer conversation management module with clean and modular architecture. The structure is based on Separation of Concerns and Custom Hooks Pattern.

## Folder Structure

```
conversations/
├── models/                          # Models and types
│   ├── conversation.model.ts        # Conversation and contact data interfaces
│   ├── conversationForm.state.ts    # Form states and errors
│   ├── conversationValidation.ts    # Validation logic
│   └── index.ts                     # Barrel exports
├── hooks/                           # Custom React Hooks
│   ├── useConversationList.ts       # Conversation list logic
│   ├── useConversationModal.ts      # Create/edit modal logic
│   └── useContactGrid.ts            # Contact selection logic
├── components/                      # Shared UI components (future)
├── ConversationList.tsx             # Main component - conversation list
├── conversationModalOpen.tsx        # Create/edit/view modal
└── contactGrid.tsx                  # Contact selection grid
```

## Architecture

### 1. Models Layer (`models/`)

**Purpose:** Define types, interfaces, and pure helper functions.

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
Defines form state and initial values:
```typescript
export interface ConversationFormErrors {
  subject: string;
  time: string;
  recipient: string;
  general: string;
}
```

#### `conversationValidation.ts`
Dedicated validation class:
```typescript
export class ConversationValidator {
  static validate(conversation: ConversationData): ConversationFormErrors;
  static validateDates(startDate: string, dueDate: string): string | null;
  static validateSubject(subject: string): string | null;
  static validateRecipient(recipientID: number): string | null;
}
```

**Benefits:**
- ✅ Testable code (pure functions)
- ✅ Reusable
- ✅ Separation between business logic and UI
- ✅ Full type safety

---

### 2. Hooks Layer (`hooks/`)

**Purpose:** Manage State, Side Effects, and business logic.

#### `useConversationList.ts`
Manages the conversation list:

```typescript
export const useConversationList = (projectId?: number) => {
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<ConversationData | null>(null);
  
  // Load data
  const loadConversations = useCallback(async () => { ... }, [selectedProject]);
  
  // CRUD operations
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

**Responsibilities:**
- 📋 Manage conversation list
- 🔍 Filter by project
- 🔄 Load data from API
- 🗑️ Delete conversations
- 📝 Open create/edit modal

---

#### `useConversationModal.ts`
Manages the create/edit modal:

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
  
  // Switch between modes: view/edit/add new
  const handleEditOrAdd = (id: number) => {
    if (id === 0) {
      setIsNew(true);
      setIsReadOnly(false);
      // Reset new form
    } else {
      setIsNew(false);
      setIsReadOnly(false);
    }
  };
  
  // Save with validation
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

**Responsibilities:**
- 📝 Manage form states (read/edit/create)
- 🔍 Load lists (employees, conversation types, contacts)
- ✅ Validation
- 💾 Save to API (insert/update)
- 🎨 Manage UI states (open dropdowns, modals)

---

#### `useContactGrid.ts`
Manages contact selection:

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
  
  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.companyName.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);
  
  // Select/deselect contact
  const toggleSelect = (contact: Contact) => {
    if (isMulti) {
      // Multi-select logic
    } else {
      setSelectedContact(contact);
    }
  };
  
  // Confirm selection
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

**Responsibilities:**
- 🔍 Search contacts
- ✅ Selection (single or multi)
- 📋 Filter results
- ✔️ Confirm and save

---

### 3. Components Layer

#### `ConversationList.tsx`
Clean main component using Hook:

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

  // Initial load
  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Only JSX - no logic!
  return (
    <div className="p-6">
      {/* Project filter */}
      {/* Conversations table */}
      {/* Modal */}
    </div>
  );
}
```

**Features:**
- ✨ Clean and readable UI code
- 🔌 Easy to test
- ♻️ Reusable business logic
- 🚀 Optimal performance (minimize re-renders)

---

#### `conversationModalOpen.tsx`
Clean modal with useModal integration:

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

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Only JSX!
  return <form>...</form>;
}
```

**Features:**
- 🔒 **Scroll Locking** - Automatic page scroll lock
- 🎭 **3 Modes** - Read-only / Edit / Add New
- ✅ **Full Validation** - Required fields and dates
- 📋 **Contact Selection** - Via ContactsGrid
- 👥 **AutoComplete** - For conversation recipient selection

---

#### `contactGrid.tsx`
Contact selection grid:

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

  // Only JSX!
  return (
    <div className="modal">
      {/* Search */}
      {/* List */}
      {/* Buttons */}
    </div>
  );
}
```

---

## Improvements

### 🔧 Before Refactoring:

**ConversationList.tsx:**
- ❌ 20+ lines of `useState`
- ❌ 5 complex `useEffect`
- ❌ Logic mixed with UI
- ❌ 500+ lines of code
- ❌ Hard to test

**conversationModalOpen.tsx:**
- ❌ 25+ lines of `useState`
- ❌ 7 `useEffect` with complicated dependencies
- ❌ Validation mixed with UI
- ❌ 600+ lines of code
- ❌ Manual scroll management

**contactGrid.tsx:**
- ❌ 15+ lines of `useState`
- ❌ Search logic mixed in
- ❌ 300+ lines of code

### ✅ After Refactoring:

**ConversationList.tsx:**
- ✅ 1 simple Hook call
- ✅ 1 single `useEffect`
- ✅ 200 lines (instead of 500)
- ✅ Clean and readable UI
- ✅ Easy to test

**conversationModalOpen.tsx:**
- ✅ 2 Hook calls (useModal + useConversationModal)
- ✅ 1 `useEffect` for scroll locking
- ✅ 500 lines (instead of 600+)
- ✅ Separated validation
- ✅ Automatic scroll locking via context

**contactGrid.tsx:**
- ✅ 1 simple Hook call
- ✅ 200 lines (instead of 300)
- ✅ Optimized search with useMemo
- ✅ Easy to maintain

---

## Special Features

### 1. Scroll Locking with useModal Context

```typescript
// In modal:
const { openModal, closeModal } = useModal();

useEffect(() => {
  if (isOpen) {
    openModal(); // Locks scroll
    return () => closeModal(); // Releases
  }
}, [isOpen, openModal, closeModal]);
```

**Benefits:**
- ✅ Centralized scroll locking management
- ✅ Support for multiple modals simultaneously (counter-based)
- ✅ Automatic cleanup
- ✅ Preserves scroll position

### 2. Advanced Form States

The modal supports 3 states:
- **📖 View (Read-only)** - All fields locked, edit/add buttons
- **✏️ Edit** - Edit existing conversation
- **➕ Add New** - Create new conversation

### 3. Smart Validation

```typescript
class ConversationValidator {
  static validate(conversation: ConversationData): ConversationFormErrors {
    const errors = createInitialFormState();
    
    // Validate subject (required)
    if (!conversation.subject?.trim()) {
      errors.subject = 'Conversation subject is required';
    }
    
    // Validate dates
    if (conversation.startDate && conversation.dueDate) {
      if (new Date(conversation.dueDate) < new Date(conversation.startDate)) {
        errors.time = 'Due date must be after start date';
      }
    }
    
    // Validate recipient (required)
    if (!conversation.recipientID) {
      errors.recipient = 'Please select a conversation recipient';
    }
    
    return errors;
  }
}
```

### 4. Optimized Search

```typescript
// In useContactGrid:
const filteredContacts = useMemo(() => {
  const query = searchQuery.toLowerCase();
  if (!query) return contacts;
  
  return contacts.filter(c =>
    c.name.toLowerCase().includes(query) ||
    c.companyName.toLowerCase().includes(query)
  );
}, [contacts, searchQuery]);
```

**Benefits:**
- ✅ Recalculates only when needed
- ✅ Search by name and company
- ✅ Excellent performance

---

## Usage Patterns

### 1. Adding a New Field to Conversation

```typescript
// 1. Add to interface in model
// models/conversation.model.ts
export interface ConversationData {
  // ... existing fields
  newField: string;
}

// 2. Add validation if required
// models/conversationValidation.ts
static validate(conversation: ConversationData): ConversationFormErrors {
  // ... existing validation
  if (!conversation.newField) {
    errors.newField = 'New field is required';
  }
}

// 3. Use field in modal
<input
  value={newConversation.newField}
  onChange={(e) => setNewConversation(prev => ({
    ...prev,
    newField: e.target.value
  }))}
/>
```

### 2. Using useModal for Scroll Locking

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

## Programming Principles

### 1. Single Responsibility Principle
Each file/class/function does **one thing** only.

### 2. DRY (Don't Repeat Yourself)
- Shared helper functions in models
- Reusable Hook logic
- Single Validation class

### 3. Separation of Concerns
- **Models** - Data & Types & Validation
- **Hooks** - State & Effects & Business Logic
- **Components** - UI Only
- **Services** - API Calls

### 4. Testability
```typescript
// Testing validation
test('validates required subject', () => {
  const errors = ConversationValidator.validate({ subject: '' });
  expect(errors.subject).toBeTruthy();
});

// Testing Hook
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

### Files Replaced:
- ✅ `ConversationList.tsx` - fully refactored
- ✅ `conversationModalOpen.tsx` - fully refactored
- ✅ `contactGrid.tsx` - fully refactored

### New Files:
- 🆕 `models/conversation.model.ts`
- 🆕 `models/conversationForm.state.ts`
- 🆕 `models/conversationValidation.ts`
- 🆕 `models/index.ts`
- 🆕 `hooks/useConversationList.ts`
- 🆕 `hooks/useConversationModal.ts`
- 🆕 `hooks/useContactGrid.ts`

### Old Files (saved as backup):
- 📦 `ConversationList.old.tsx`
- 📦 `conversationModalOpen.old.tsx`
- 📦 `contactGrid.old.tsx`

---

## For Developers

When adding a new feature:

1. **Ask yourself:** Do I need new state? → Hook
2. **Ask yourself:** Do I need a type/interface? → Model
3. **Ask yourself:** Do I need business logic? → Hook or Validator
4. **Ask yourself:** Do I need UI? → Component

**Remember:** Keep it simple, keep it clean! 🚀
