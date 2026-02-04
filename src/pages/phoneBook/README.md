# PhoneBook Module

This module manages the business phone book functionality with a clean separation of concerns following the established project pattern.

## Architecture

### 📁 Structure
```
phoneBook/
├── BusinessPhonebook.tsx      # Main phone book list component
├── UpdatePhoneBook.tsx         # Contact modal (add/edit) component
├── hooks/
│   ├── usePhoneBook.ts        # Business logic for phone book list
│   └── usePhoneBookModal.ts   # Business logic for contact modal
└── models/
    ├── phoneBook.model.ts     # Data models and utilities
    ├── phoneBookForm.state.ts # Form state management
    ├── phoneBookFilter.state.ts # Filter state management
    ├── phoneBookValidation.ts # Validation logic
    └── index.ts               # Exports
```

### 🎯 Design Pattern

**Separation of Concerns:**
- **Components**: Pure UI rendering (BusinessPhonebook.tsx, UpdatePhoneBook.tsx)
- **Hooks**: Business logic and state management (usePhoneBook.ts, usePhoneBookModal.ts)
- **Models**: Data structures, validation, utilities

**Benefits:**
- ✅ Cleaner, more maintainable code
- ✅ Easier testing
- ✅ Reusable business logic
- ✅ Type-safe with TypeScript
- ✅ Consistent patterns across the application

## Components

### BusinessPhonebook.tsx
Main phone book list component with search, filter, and contact management.

**Features:**
- Display contacts in a grid layout
- Search by name, company, phone
- Filter by company
- Add new contacts
- Edit existing contacts
- WhatsApp integration

**Hook**: `usePhoneBook`

### UpdatePhoneBook.tsx
Modal for adding or editing contacts.

**Features:**
- Add new contact
- Edit existing contact
- Company management (select existing or add new)
- Address with Waze integration
- Phone with WhatsApp integration
- Email validation
- Form validation and error handling

**Hook**: `usePhoneBookModal`

## Hooks

### usePhoneBook.ts
Manages business logic for the phone book list.

**Responsibilities:**
- Fetch contacts list
- Search and filter contacts
- Manage selected contact
- Handle modal state
- Company data management

**Exports:**
```typescript
{
  contacts,           // Filtered contacts list
  isLoading,         // Loading state
  searchTerm,        // Current search term
  selectedCompany,   // Selected company filter
  showModal,         // Modal visibility
  modalMode,         // 'add' | 'update'
  selectedContact,   // Contact being edited
  companiesList,     // Companies for filter
  
  handleSearch,      // Search handler
  handleCompanyFilter, // Filter handler
  handleAddContact,  // Open add modal
  handleEditContact, // Open edit modal
  handleCloseModal,  // Close modal
  handleSaveSuccess  // Refresh after save
}
```

### usePhoneBookModal.ts
Manages business logic for the contact modal form.

**Responsibilities:**
- Form state management
- Validation
- Company and city selection
- Save (add/update) operations
- Error handling

**Exports:**
```typescript
{
  editData,          // Form data
  isEditing,         // Edit mode flag
  isAddingCompany,   // Company mode flag
  isSaving,          // Saving state
  isLoading,         // Loading state
  errors,            // Validation errors
  title,             // Modal title
  companiesList,     // Available companies
  citiesList,        // Available cities
  selectedCompany,   // Selected company
  selectedCity,      // Selected city
  
  updateField,       // Update form field
  handleCompanySelect, // Select company
  handleCitySelect,  // Select city
  clearCompanyData,  // Clear company fields
  setIsAddingCompany, // Toggle company mode
  handleSave,        // Save form
  toggleEdit         // Toggle edit mode
}
```

## Models

### phoneBook.model.ts
Core data models and utilities.

**Exports:**
- `PhoneBook` interface
- `Company` interface
- `City` interface
- `PhoneBookData` interface
- `createInitialContact()` - Create empty contact
- `normalizeForWhatsApp()` - Format phone for WhatsApp

### phoneBookValidation.ts
Validation logic for contact forms.

**Exports:**
- `PhoneBookValidator.validate()` - Validate contact data

### phoneBookForm.state.ts
Form state management utilities.

### phoneBookFilter.state.ts
Filter state management utilities.

## Data Flow

### List View
```
BusinessPhonebook
    ↓ uses
usePhoneBook
    ↓ calls
phoneBookService
    ↓ fetches
API → contacts[]
```

### Modal Flow
```
UpdatePhoneBook
    ↓ uses
usePhoneBookModal
    ↓ calls
phoneBookService
    ↓ saves
API → success
    ↓ triggers
handleSaveSuccess (refresh list)
```

## Integration

### Services
- `phoneBookService.ts` - API calls for CRUD operations

### Shared Components
- `AutoComplete` - Dropdown with search
- Generic UI components

## Usage Example

```tsx
// In BusinessPhonebook.tsx
const {
  contacts,
  isLoading,
  showModal,
  modalMode,
  selectedContact,
  handleAddContact,
  handleEditContact,
  handleCloseModal,
  handleSaveSuccess
} = usePhoneBook();

return (
  <>
    {/* List UI */}
    {showModal && (
      <UpdatePhoneBook
        mode={modalMode}
        contact={selectedContact}
        onClose={handleCloseModal}
        onSave={handleSaveSuccess}
      />
    )}
  </>
);
```

## Best Practices

1. **Always use the hooks** - Don't bypass them with direct API calls
2. **Validate on the client** - Use PhoneBookValidator before saving
3. **Handle errors gracefully** - Display user-friendly error messages
4. **Keep components pure** - All logic in hooks, components only render
5. **Type everything** - Use TypeScript interfaces for all data

## Future Enhancements

- [ ] Add bulk import/export
- [ ] Add contact groups/tags
- [ ] Add contact notes
- [ ] Add contact history
- [ ] Add advanced search filters
- [ ] Add contact sharing

## Related Modules

- **Projects** - Similar architecture pattern
- **ProjectHours** - Similar architecture pattern
- **Meeting** - Similar architecture pattern
- **Conversations** - Similar architecture pattern

All modules follow the same hooks + models + components pattern for consistency and maintainability.
