import { X } from "lucide-react";
import { useEffect } from "react";
import type { Employee } from "../../interface/TimeHourModel";
import type { Project } from "../../interface/projectModel";
import { useHourReportModal } from './hooks/useHourReportModal';
import { useModal } from '../ModalContextType';
import ErrorMessage from "../shared/errorMessage";
import ProjectFilter from "../shared/projectsFilter";
import AutoComplete from "../shared/autoCompleteInput";
import { Skeleton } from "../shared/Skeleton";


interface Props {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  report: any;
  employee?: Employee;
  currentDay: Date;
  editingReportId: number;
  project?: Project;
}

export default function HourReportModalOpen({
  title,
  isOpen,
  onClose,
  report,
  employee,
  editingReportId,
  currentDay,
  project
}: Props) {
  const { openModal, closeModal } = useModal();
  
  const {
    report: formReport,
    reportingType,
    errors,
    isSaving,
    isLoading,
    projectsList,
    selectedProject,
    contracts,
    subContracts,
    steps,
    updateReportField,
    changeReportingType,
    handleProjectSelect,
    handleSave,
    setIsProjectSelectOpen,
  } = useHourReportModal({
    editingReportId,
    employee: employee ?? null,
    currentDay,
    isOpen,
    existingReport: report,
    initialProject: project,
    onClose,
  });

  // Lock/unlock body scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => {
        closeModal();
      };
    }
  }, [isOpen, openModal, closeModal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const success = await handleSave();
    if (success) {
      onClose();
    }
  };

  return (
        

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      {!selectedProject&&!editingReportId ? (
      <ProjectFilter
        isOpen={true}
        projectsList={projectsList}
        selectedProject={null}
        setSelectedProject={handleProjectSelect}
        handleOk={() => setIsProjectSelectOpen(false)}
        onClose={onClose}
      />
      ) : (
      <div className="text-gray-800 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {isLoading ? (
          <div className="p-6">
            <Skeleton />
          </div>
        ) : (
          <>
        {/* Header */}
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
          type="button"
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
          <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <form onSubmit={handleSubmit}>

              {/* Error Message */}
              {errors.time && (
            <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
              <ErrorMessage validateError={String(errors.time)} />
            </div>
            )}
          {/* Project Display */}
          <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">פרויקט נבחר:</div>
          <div className="text-lg font-semibold text-blue-600">{selectedProject?.name}</div>
          </div>

          {/* Date Display */}
           <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
          <input
            type="date"
            value={formReport.date ? new Date(formReport.date).toLocaleDateString('en-CA') : new Date(currentDay).toLocaleDateString('en-CA')}
            onChange={(e) => updateReportField('date', e.target.value)}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          </div>

          {/* Reporting Type Selection */}
          <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">סוג דיווח</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportingType"
              value="total"
              checked={reportingType === 'total'}
              onChange={() => changeReportingType('total')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">סה"כ שעות</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="reportingType"
              value="time-range"
              checked={reportingType === 'time-range'}
              onChange={() => changeReportingType('time-range')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">טווח שעות</span>
            </label>
          </div>
          </div>

          {/* Conditional Fields Based on Reporting Type */}
          {reportingType === 'time-range' ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שעת כניסה <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formReport.clockInTime || ''}
              onChange={(e) => updateReportField('clockInTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שעת יציאה <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formReport.clockOutTime || ''}
              onChange={(e) => updateReportField('clockOutTime', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            </div>
          </div>
          ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
            סה"כ שעות <span className="text-red-500">*</span>
            </label>
            <input
            type="time"
            value={formReport.total || ''}
            onChange={(e) => updateReportField('total', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            />
          </div>
          )}

          {/* Project-specific fields (contracts, subcontracts, steps) */}
          {contracts && contracts.length > 0 ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">חוזה</label>
            <AutoComplete
            items={contracts}
            selectedItem={contracts.find(c => c.id === formReport.contractID) || null}
            onSelect={(contract) => {
              updateReportField('contractID', contract.id);
              updateReportField('subContractID', null);
              updateReportField('stepID', null);
            }}
            getItemId={(c) => c.id}
            getItemLabel={(c) => c.name}
            placeholder="בחר חוזה..."
            height={2}
            />
          </div>
          ) : null}

          {subContracts && subContracts.length > 0 && formReport.contractID && 
           subContracts.some(sc => sc.contractID === formReport.contractID) ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תת-חוזה</label>
            <AutoComplete
            items={subContracts.filter(sc => sc.contractID === formReport.contractID)}
            selectedItem={subContracts.find(sc => sc.id === formReport.subContractID) || null}
            onSelect={(subContract) => {
              updateReportField('subContractID', subContract.id);
              updateReportField('stepID', null);
            }}
            getItemId={(sc) => sc.id}
            getItemLabel={(sc) => sc.name}
            placeholder="בחר תת-חוזה..."
            height={2}
            />
          </div>
          ) : null}
          {/* Steps field - show only if steps exist AND either: 
              1. No subcontracts exist, OR
              2. SubContractID is selected AND that ID has steps */}
          {steps && steps.length > 0 && (
            (!subContracts || subContracts.length === 0) ||
            (subContracts && subContracts.length > 0 && formReport.subContractID && 
             steps.some(step => step.subContractID === formReport.subContractID))
          ) ? (
            (() => {

              const filteredSteps = steps.filter(step =>
                !formReport.subContractID || step.subContractID === formReport.subContractID
              );
              const selected = filteredSteps.find(s => s.id === formReport.stepID) || null;
              
              return (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שלב</label>
                  <AutoComplete
                    items={filteredSteps}
                    selectedItem={selected}
                    onSelect={(step) => updateReportField('stepID', step.id)}
                    getItemId={(s) => s.id}
                    getItemLabel={(s) => s.name}
                    placeholder="בחר שלב..."
                    height={2}
                  />
                </div>
              );
            })()
          ) : null}

          {/* Notes */}
          <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
          <textarea
            value={formReport.notes}
            onChange={(e) => updateReportField('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="הזן הערות..."
          />
          </div>

              {/* Error Messages */}
              {/* {errors.time && <ErrorMessage message={errors.time} />}
              {errors.project && <ErrorMessage message={errors.project} />}
              {errors.general && <ErrorMessage message={errors.general} />} */}
             </form>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200 flex-shrink-0">
          <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 transition-colors"
          >
          ביטול
          </button>
          <button
          type="button"
          onClick={async () => {
            const success = await handleSave();
            if (success) {
              onClose();
            }
          }}
          disabled={isSaving}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
          {isSaving ? 'שומר...' : 'שמור דיווח'}
          </button>
        </div>
        </>
        )}
      </div>
      )}
    </div>
  );
}