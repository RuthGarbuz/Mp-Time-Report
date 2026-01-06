import type { ProjectStatus } from ".";

export interface ProjectFilterState {
  searchTerm: string;
  statusFilter: ProjectStatus | 'all';
  sortBy: 'name' | 'startDate' | 'endDate';
  sortOrder: 'asc' | 'desc';
}

export const createInitialFilterState = (): ProjectFilterState => ({
  searchTerm: '',
  statusFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
});