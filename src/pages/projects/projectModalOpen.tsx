import { X, FileText } from 'lucide-react';
import AutoComplete from '../shared/autoCompleteInput';
import ProjectContactsSelect from './components/ProjectContactsSelect';
import { useProjectModal } from './hooks/useProjectModal';
import { useEffect } from 'react';
import { useModal } from '../ModalContextType';

interface ProjectModalOpenProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  projectID: number | null;
}

export default function ProjectModalOpen({ isOpen, onClose, onSave, projectID }: ProjectModalOpenProps) {

  const {
    formData,
    errors,
    title,
    isLoading,
    isSaving,
    hasChanges,
    isContactsOpen,
    gridContacts,
    updateField,
    handleSaveAndClose,
    openContactsModal,
    closeContactsModal,
    updateContacts,
  } = useProjectModal({
    projectID,
    isOpen,
    onClose,
    onSave,
  });
const { openModal, closeModal } = useModal();

useEffect(() => {
  if (isOpen) {
    openModal();
    return () => {
      closeModal();
    };
  }
}, [isOpen, openModal, closeModal]);
  if (!isOpen) return null;
 useEffect(() => {
    if (isOpen) {
      openModal();
      return () => {
        closeModal();
      };
    }
  }, [isOpen, openModal, closeModal]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="text-gray-800 bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="relative pt-1 flex items-center justify-between mb-2 px-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center flex-1">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  שם הפרויקט <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  placeholder="הזן שם פרויקט"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    מספר פרויקט <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.projectNum || ''}
                    onChange={(e) => updateField('projectNum', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  />
                  {errors.projectNum && <p className="text-red-500 text-sm mt-1">{errors.projectNum}</p>}
                </div>

                {/* Customer */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">לקוח ראשי</label>
                  <AutoComplete
                    items={formData.projectDataListsDto.customers.filter((c) => c.isCustomer === true)}
                    selectedItem={
                      formData.projectDataListsDto.customers.find((c) => c.customerID === formData.customerID) || null
                    }
                    onSelect={(customer) => updateField('customerID', customer.customerID)}
                    getItemId={(c) => c.customerID}
                    getItemLabel={(c) => c.name}
                    placeholder="בחר לקוח..."
                    height={2}
                  />
                </div>

                {/* Location */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    ישוב
                  </label>

                  <AutoComplete
                    items={formData.projectDataListsDto.cities}
                    selectedItem={formData.cityID != null && formData.cityID > 0 ? formData.projectDataListsDto.cities.find(c => c.id === formData.cityID) : null}
                    onSelect={(city) => updateField('cityID', city!.id)}
                    getItemId={(c) => c!.id}
                    getItemLabel={(c) => c!.name}
                    placeholder="בחר ישוב..."
                    height={2}
                  />
                </div>
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    כתובת
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => updateField('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    placeholder="הזן כתובת..."
                  />
                </div>

                {/* Employee */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    עובד אחראי
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.employees}
                    selectedItem={formData.projectDataListsDto.employees.find(e => e.id === formData.employeeID) || null}
                    onSelect={(emp) => updateField('employeeID', emp.id)}
                    getItemId={(e) => e.id}
                    getItemLabel={(e) => e.name}
                    placeholder="בחר עובד..."
                    height={2}
                  />
                </div>

                {/* Studio Department */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    מחלקה סטודיו
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.studios}
                    selectedItem={formData.projectDataListsDto.studios.find(s => s.id === formData.studioDepartmentTypeID) || null}
                    onSelect={(studio) => updateField('studioDepartmentTypeID', studio.id)}
                    getItemId={(s) => s.id}
                    getItemLabel={(s) => s.name}
                    placeholder="בחר מחלקה..."
                    height={2}
                  />
                </div>

                {/* Office */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    משרד
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.offices}
                    selectedItem={formData.projectDataListsDto.offices.find(o => o.id === formData.officeID) || null}
                    onSelect={(office) => updateField('officeID', office.id)}
                    getItemId={(o) => o.id}
                    getItemLabel={(o) => o.name}
                    placeholder="בחר משרד..."
                    height={2}
                  />
                </div>

                {/* Status */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    סטטוס פרויקט
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.statuses}
                    selectedItem={formData.projectDataListsDto.statuses.find(s => s.id === formData.statusID) || null}
                    onSelect={(status) => updateField('statusID', status.id)}
                    getItemId={(s) => s.id}
                    getItemLabel={(s) => s.name}
                    placeholder="בחר סטטוס..."
                    height={2}
                  />
                </div>

                {/* Project Type */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    סוג פרויקט
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.projectTypes}
                    selectedItem={formData.projectDataListsDto.projectTypes.find(pt => pt.id === formData.projectTypeID) || null}
                    onSelect={(projectType) => updateField('projectTypeID', projectType.id)}
                    getItemId={(pt) => pt.id}
                    getItemLabel={(pt) => pt.name}
                    placeholder="בחר סוג פרויקט..."
                    height={2}
                  />
                </div>

                {/* Copying Institute */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    מכון העתקות
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.copyingInstitutes}
                    selectedItem={formData.projectDataListsDto.copyingInstitutes.find(s => s.id === formData.copyingInstituteID) || null}
                    onSelect={(copying) => updateField('copyingInstituteID', copying.id)}
                    getItemId={(s) => s.id}
                    getItemLabel={(s) => s.name}
                    placeholder="בחר מכון..."
                    height={2}
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    תאריך התחלה
                  </label>
                  <input
                    type="date"
                    value={formData.startDate?.split('T')[0] || ''}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    תאריך סיום
                  </label>
                  <input
                    type="date"
                    value={formData.endDate?.split('T')[0] || ''}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  />
                </div>
         
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  <FileText className="inline w-4 h-4 mr-1" />
                  תיאור
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-right"
                  placeholder="הזן תיאור הפרויקט..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => updateField('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  פרויקט פעיל
                </label>
              </div>

              {/* Participants Button */}
              <div className="flex justify-center w-full">
                <button
                  onClick={openContactsModal}
                  type="button"
                  className="w-2/3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-colors shadow-md"
                >
                  רשימת משתתפים ({formData.projectContacts?.length || 0})
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSaveAndClose}
                  disabled={isSaving || !hasChanges}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'שומר...' : 'שמור פרויקט'}
                </button>
              </div>

              {errors.general && (
                <div className="text-center text-red-500 text-sm">{errors.general}</div>
              )}
            </>
          )}
        </div>

        {/* Contacts Modal */}
        {isContactsOpen && (
          <ProjectContactsSelect
            selectedContacts={formData.projectContacts || []}
            setSelectedContacts={updateContacts}
            availableContacts={gridContacts}
            onClose={closeContactsModal}
            projectID={formData.projectID}
          />
        )}
      </div>
    </div>
  );
}