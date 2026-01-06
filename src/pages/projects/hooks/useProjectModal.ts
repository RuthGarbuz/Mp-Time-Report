import { useState, useEffect, useCallback, useMemo } from 'react';
import projectService from '../../../services/projectService';
import { ProjectValidator } from '../models/projectValidation';
import { createInitialProject, mapProjectToInsertRequest, type ProjectDetails } from '../models/project.model';
import type { IdNameDto } from '../models/project.model';
import { useModal } from '../../ModalContextType';

type UseProjectModalProps = {
  projectID: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export const useProjectModal = ({ projectID, isOpen, onSave }: UseProjectModalProps) => {
  const [formData, setFormData] = useState<ProjectDetails>(createInitialProject());
  const [originalData, setOriginalData] = useState<ProjectDetails | null>(null);
  const [errors, setErrors] = useState({ name: '', projectNum: '', general: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [gridContacts, setGridContacts] = useState<IdNameDto[]>([]);
  const { openModal, closeModal } = useModal();

  // Title
  const title = useMemo(
    () => (projectID === 0 || projectID === null ? 'הוסף פרויקט חדש' : `עריכת פרויקט - ${formData.name}`),
    [projectID, formData.name]
  );

  // Has changes
  const hasChanges = useMemo(() => {
    if (!originalData) return true;
    return ProjectValidator.hasChanges(originalData, formData);
  }, [originalData, formData]);

  // Load project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const projectData = await projectService.getProjectByID(projectID ?? 0);
        setFormData(projectData as ProjectDetails);
        setOriginalData(projectData as ProjectDetails);
      } catch (error) {
        console.error('Failed to load project data:', error);
        setErrors(prev => ({ ...prev, general: 'שגיאה בטעינת נתוני הפרויקט' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectID, isOpen]);

  // Update field
  const updateField = useCallback((field: keyof ProjectDetails, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (field === 'name' || field === 'projectNum') {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, []);

  // Save project
  const handleSave = useCallback(async (): Promise<number> => {
    // Validate
    const validation = ProjectValidator.validate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return 0;
    }

    // Check if there are changes
    if (!hasChanges && formData.projectID !== 0) {
      return formData.projectID;
    }

    setIsSaving(true);
    try {
      const insertRequest = mapProjectToInsertRequest(formData);
      const method = formData.projectID === 0 ? "InsertProjectAsync" : "UpdateProjectAsync";
      const result = await projectService.insertUpdateProject(insertRequest, method);
      
      return result as number;
    } catch (error) {
      console.error('Failed to save project:', error);
      setErrors(prev => ({ ...prev, general: 'שגיאה בשמירת הפרויקט' }));
      return 0;
    } finally {
      setIsSaving(false);
    }
  }, [formData, hasChanges]);

  // Save and close
  const handleSaveAndClose = useCallback(async () => {
    const success = await handleSave();
    if (success) {
      onSave();
    }
  }, [handleSave, onSave]);

  // Open contacts modal
  const openContactsModal = useCallback(async () => {
    let newID = formData.projectID;
    
    // If new project, save it first
    if (formData.projectID === 0 || formData.projectID === null) {
      newID = await handleSave();
      if (newID === 0) return;
      
      setFormData(prev => ({ ...prev, projectID: newID }));
      setOriginalData(prev => prev ? { ...prev, projectID: newID } : null);
    }

    // Prepare contacts grid
    const contactsList = formData.projectDataListsDto.customers.filter(customer =>
      !formData.projectContacts?.some(contact => contact.id === customer.customerID)
    );
    
    const contactGrid: IdNameDto[] = contactsList.map(customer => ({
      id: customer.customerID,
      name: customer.name,
    }));
    
    setGridContacts(contactGrid);
    setIsContactsOpen(true);
    openModal();
  }, [formData, handleSave]);

  // Close contacts modal
  const closeContactsModal = useCallback(() => {
    setIsContactsOpen(false);
    closeModal();
  }, []);

  // Update contacts
  const updateContacts = useCallback((contacts: IdNameDto[]) => {
    setFormData(prev => ({ ...prev, projectContacts: contacts }));
  }, []);

  return {
    // State
    formData,
    errors,
    title,
    isLoading,
    isSaving,
    hasChanges,
    isContactsOpen,
    gridContacts,

    // Actions
    updateField,
    handleSave,
    handleSaveAndClose,
    openContactsModal,
    closeContactsModal,
    updateContacts,
  };
};