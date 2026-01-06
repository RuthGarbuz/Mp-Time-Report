export interface PhoneBookFilterState {
  searchTerm: string;
  visibleCount: number;
}

export const createInitialFilterState = (): PhoneBookFilterState => ({
  searchTerm: '',
  visibleCount: 20,
});
