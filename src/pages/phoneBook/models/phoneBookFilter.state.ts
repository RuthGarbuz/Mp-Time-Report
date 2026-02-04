export interface PhoneBookFilterState {
  searchTerm: string;
  visibleCount: number;
   sortOrder: 'asc' | 'desc';
}

export const createInitialFilterState = (): PhoneBookFilterState => ({
  searchTerm: '',
  visibleCount: 20,
  sortOrder: 'asc',
});
