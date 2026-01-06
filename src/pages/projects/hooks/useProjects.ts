import { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '../../../services/projectService';
import { ProjectValidator } from '../models/projectValidation';
import type { ProjectModel } from '../../../interface/projectModel';

export const useProjects = (openModal: () => void, closeModal: () => void) => {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectModel | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Load projects
  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const projectsData = await projectService.getProjectsModelList();
      if (projectsData) {
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = ProjectValidator.matchesSearch(project, searchTerm);
      const matchesActive = showActiveOnly ? project.isActive : true;
      return matchesSearch && matchesActive;
    });
  }, [projects, searchTerm, showActiveOnly]);

  // Visible projects (for infinite scroll)
  const visibleProjects = useMemo(() => {
    return filteredProjects.slice(0, visibleCount);
  }, [filteredProjects, visibleCount]);

  // Actions
  const openNewProject = useCallback(() => {
    setIsAddModalOpen(true);
    openModal();
  }, [openModal]);

  const openEditProject = useCallback((project: ProjectModel) => {
    setSelectedProject(project);
    openModal();
  }, [openModal]);

  const closeProjectModal = useCallback(() => {
    setSelectedProject(null);
    setIsAddModalOpen(false);
    closeModal();
  }, [closeModal]);

  const handleProjectSaved = useCallback(() => {
    closeProjectModal();
    loadProjects();
  }, [closeProjectModal, loadProjects]);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 20, filteredProjects.length));
  }, [filteredProjects.length]);

  // Reset visible count when filters change
  useEffect(() => {
    closeModal();
    setVisibleCount(20);
  }, [searchTerm, showActiveOnly, closeModal]);

  // Load on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    // State
    projects: visibleProjects,
    filteredCount: filteredProjects.length,
    searchTerm,
    showActiveOnly,
    isLoading,
    selectedProject,
    isAddModalOpen,
    hasMore: visibleCount < filteredProjects.length,

    // Actions
    setSearchTerm,
    setShowActiveOnly,
    openNewProject,
    openEditProject,
    closeProjectModal,
    handleProjectSaved,
    loadMore,
  };
};