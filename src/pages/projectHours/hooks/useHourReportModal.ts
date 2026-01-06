import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Employee } from '../../../interface/TimeHourModel';
import type { Project } from '../../../interface/projectModel';
import type { 
  HourReportModal, 
  Contract, 
  SubContract, 
  Step,
  CheckHoursOverlapQuery 
} from '../models';
import { createInitialHourReport, addTime, normalizeTimeFormat } from '../models';
import { HourReportValidator } from '../models/hourReportValidation';
import hourReportService, { 
  getHourReportStepsModal, 
  getStepsList, 
  insertProjectHourReport 
} from '../../../services/hourReportService';
import { getProjectsList } from '../../../services/TaskService';

type UseHourReportModalProps = {
  editingReportId: number | null;
  employee: Employee | null;
  currentDay: Date;
  isOpen: boolean;
  existingReport?: HourReportModal | null;
  initialProject?: Project | null;
  onClose: () => void;
};

export const useHourReportModal = ({
  editingReportId,
  employee,
  currentDay,
  isOpen,
  existingReport,
  initialProject,
  onClose,
}: UseHourReportModalProps) => {
  const [report, setReport] = useState<HourReportModal>(
    createInitialHourReport(employee?.id ?? 0, currentDay)
  );
  const [originalReport, setOriginalReport] = useState<HourReportModal | null>(null);
  const [reportingType, setReportingType] = useState<'total' | 'time-range'>('total');
  const [errors, setErrors] = useState({ time: '', project: '', general: '' });
  const [isSaving, setIsSaving] = useState(false);
  
  // Project related
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject ?? null);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
  
  // Steps related
  const [contracts, setContracts] = useState<Contract[] | null>(null);
  const [subContracts, setSubContracts] = useState<SubContract[] | null>(null);
  const [steps, setSteps] = useState<Step[] | null>(null);
  
  // Calculated values
  const [calculateClockOutTime, setCalculateClockOutTime] = useState("");

  const title = useMemo(
    () => (editingReportId ? 'עריכת דיווח שעות' : 'הוספת דיווח חדש'),
    [editingReportId]
  );

  const hasChanges = useMemo(() => {
    if (!originalReport) return true;
    return HourReportValidator.hasChanges(originalReport, report);
  }, [originalReport, report]);

  // Load projects list
  useEffect(() => {
    const loadProjects = async () => {
      const projectsData = await getProjectsList();
      if (projectsData) {
        setProjectsList(projectsData as Project[]);
      }
    };

    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  // Load project-specific data (contracts, steps, etc.)
  const loadProjectData = useCallback(async (project: Project) => {
    if (project.hoursReportMethodID === 5) {
      const hourReportStepsData = await getHourReportStepsModal(project.id);
      if (hourReportStepsData) {
        setContracts(hourReportStepsData.contractsList || null);
        setSubContracts(hourReportStepsData.subContractsList || null);
        
        if (hourReportStepsData.stepsList.length > 0) {
          setSteps(hourReportStepsData.stepsList);
          setReport(prev => ({ ...prev, stepID: hourReportStepsData.stepsList[0].id }));
        }
      }
    } else if (project.hoursReportMethodID === 3) {
      setContracts(null);
      setSubContracts(null);
      setSteps(null);
    } else {
      const stepList = await getStepsList(project.id);
      if (stepList && stepList.length > 0) {
        setSteps(stepList);
        setReport(prev => ({ ...prev, stepID: stepList[0].id }));
      }
      setContracts(null);
      setSubContracts(null);
    }
  }, []);

  // Initialize report data
  useEffect(() => {
    const initReport = async () => {
   //     console.log("existingReport", existingReport)
      if (existingReport) {

        // Normalize time formats for existing report
        const normalizedReport = {
          ...existingReport,
          clockInTime: normalizeTimeFormat(existingReport.clockInTime),
          clockOutTime: normalizeTimeFormat(existingReport.clockOutTime),
          // Use existing total or fallback to employee default
          total: normalizeTimeFormat(existingReport.total || employee?.minutesHoursAmount),
        };
        setReport(normalizedReport);
        setOriginalReport(normalizedReport);
        
        if (existingReport.clockInTime && existingReport.clockOutTime) {
          setReportingType('time-range');
        }

        // Load the project for the existing report
        if (existingReport.projectID && projectsList.length > 0) {
          const project = projectsList.find(p => p.id === existingReport.projectID);
          if (project) {
            setSelectedProject(project);
            await loadProjectData(project);
          }
        } else if (initialProject) {
          setSelectedProject(initialProject);
          await loadProjectData(initialProject);
        }
      } else {
        // Create new report with employee default time
        const newReport = createInitialHourReport(employee?.id ?? 0, currentDay);
        newReport.total = normalizeTimeFormat(employee?.minutesHoursAmount);
        
        if (initialProject) {
          setSelectedProject(initialProject);
          newReport.projectID = initialProject.id;
          newReport.hourReportMethodID = initialProject.hoursReportMethodID;
          await loadProjectData(initialProject);
        }

        setReport(newReport);
      }
    };

    if (isOpen && projectsList.length > 0) {
      initReport();
    }
  }, [isOpen, existingReport, employee, currentDay, initialProject, projectsList, loadProjectData]);

  // Calculate clock out time
  useEffect(() => {
    if (employee?.minutesHoursAmount) {
      const calc = addTime("08:00", employee.minutesHoursAmount);
      setCalculateClockOutTime(calc);
    }
  }, [employee?.minutesHoursAmount]);

  // Handle project selection
  const handleProjectSelect = useCallback(async (project: Project) => {
    setSelectedProject(project);
    setReport(prev => ({
      ...prev,
      projectID: project.id,
      hourReportMethodID: project.hoursReportMethodID,
    }));
    
    await loadProjectData(project);
    setIsProjectSelectOpen(false);
  }, [loadProjectData]);

  // Update report field
  const updateReportField = useCallback((field: keyof HourReportModal, value: any) => {
    setReport(prev => ({ ...prev, [field]: value }));
    
    // Clear relevant error
    if (field === 'clockInTime' || field === 'clockOutTime') {
      setErrors(prev => ({ ...prev, time: '' }));
    } else if (field === 'projectID') {
      setErrors(prev => ({ ...prev, project: '' }));
    }
  }, []);

  // Change reporting type
  const changeReportingType = useCallback((type: 'total' | 'time-range') => {
    setReportingType(type);
    
    if (type === 'total') {
      setReport(prev => ({ 
        ...prev, 
        clockInTime: undefined, 
        clockOutTime: undefined 
      }));
    } else {
      setReport(prev => ({
        ...prev,
        clockInTime: "08:00",
        clockOutTime: calculateClockOutTime || "17:00"
      }));
    }
  }, [calculateClockOutTime]);

  // Save report
  const handleSave = useCallback(async () => {
    // Validate
    const validation = HourReportValidator.validate(report, reportingType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return false;
    }

    // Check for time overlap if using time-range
    if (reportingType === 'time-range') {
      const overlapQuery: CheckHoursOverlapQuery = {
        clockInTime: report.clockInTime || '',
        clockOutTime: report.clockOutTime || '',
        date: report.date,
        projectID: report.projectID || 0,
        employeeID: employee?.id || 0,
        hourReportID: editingReportId || 0,
      };

      const hasOverlap = await hourReportService.CheckHoursOverlapAsync(overlapQuery);
      if (hasOverlap) {
        setErrors(prev => ({ ...prev, time: 'יש דיווחים החופפים בשעות' }));
        return false;
      }
    }

    // Prepare and save
    setIsSaving(true);
    try {
      const preparedReport = HourReportValidator.prepareForSubmit(report, reportingType);
      const method = editingReportId ? "UpdateProjectHourReportAsync" : "InsertProjectHourReportAsync";
      
      const result = await insertProjectHourReport(preparedReport, method);
      
      if (result === null) {
        setErrors(prev => ({ ...prev, general: 'אירעה שגיאה בשמירת הדוח. אנא נסה/י שוב.' }));
        return false;
      }

      onClose();
      return true;
    } catch (error) {
      console.error('Failed to save report:', error);
      setErrors(prev => ({ ...prev, general: 'אירעה שגיאה בשמירת הדוח' }));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [report, reportingType, editingReportId, employee, onClose]);

  return {
    // State
    report,
    reportingType,
    errors,
    title,
    isSaving,
    hasChanges,
    
    // Project state
    projectsList,
    selectedProject,
    isProjectSelectOpen,
    
    // Steps state
    contracts,
    subContracts,
    steps,
    
    // Calculated values
    calculateClockOutTime,

    // Actions
    updateReportField,
    changeReportingType,
    handleProjectSelect,
    handleSave,
    setIsProjectSelectOpen,
  };
};
