// Central exports for all phoneBook models
export type { PhoneBook, Company, City, PhoneBookData } from './phoneBook.model';
export type { PhoneBookFormState } from './phoneBookForm.state';
export type { PhoneBookFilterState } from './phoneBookFilter.state';
export type { PhoneBookValidationErrors, PhoneBookValidationResult } from './phoneBookValidation';

export { createInitialContact, normalizeForWhatsApp } from './phoneBook.model';
export { createInitialFormState, resetFormErrors } from './phoneBookForm.state';
export { createInitialFilterState } from './phoneBookFilter.state';
export { PhoneBookValidator } from './phoneBookValidation';
