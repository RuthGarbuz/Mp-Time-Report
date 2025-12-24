import { useState, useEffect } from 'react';
import { X, MapPin, FileText } from 'lucide-react';
import type { IdNameDto, InsertProjectRequest, ProjectDetails } from '../../interface/project';
import projectService from '../../services/projectService';
import AutoComplete from '../shared/autoCompleteInput';
import ProjectParticipants from './projectContactsSelect';
import { useModal } from '../ModalContextType';

interface ProjectModalOpenProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  projectID: number | null;
}




export default function ProjectModalOpen({ isOpen, onClose, onSave, projectID }: ProjectModalOpenProps) {
  const [formData, setFormData] = useState<ProjectDetails>({
    projectID: 0,
    name: '',
    projectNum: null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    isActive: true,
    description: '',
    officeID: null,
    officeName: null,
    cityID: null,
    cityName: null,
    statusID: null,
    statusName: null,
    copyingInstituteID: null,
    copyingInstituteName: null,
    studioDepartmentTypeID: null,
    studioDepartmentTypeName: null,
    address: '',
    customerID: null,
    customerName: null,
    employeeID: null,
    employeeName: null,
    projectTypeID: null,
    projectTypeName: null,
    projectDataListsDto: {
      cities: [],
      employees: [],
      studios: [],
      offices: [],
      statuses: [],
      projectTypes: [],
      customers: [],
      copyingInstitutes: []
    },
    projectContacts: []
  });
  const [originalData, setOriginalData] = useState<ProjectDetails | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorNumMessage, setErrorNumMessage] = useState<string | null>(null);
  const [gridContacts, setGridContacts] = useState<IdNameDto[]>([]);

  const [isContactsOpen, setIsContactsOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { openModal, closeModal } = useModal();
  useEffect(() => {
    const fetchProjectData = async () => {
      setIsLoading(true);
      try {

        const projectData = await projectService.getProjectByID(projectID ?? 0);
        console.log('Fetched Project Data:', projectData);
        setFormData(projectData as ProjectDetails);
        setOriginalData(projectData);

      } catch (error) {
        console.error('Failed to load project data:', error);
        alert('שגיאה בטעינת נתוני הפרויקט');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchProjectData();
    }
  }, [projectID, isOpen]);


  const handleChange = (field: keyof ProjectDetails, value: any) => {
    setFormData({ ...formData, [field]: value });
  };
  // const handleAddContacts = async (contacts: IdNameDto[]) => {
  //   // Convert IdNameDto[] to ContactsToInsert[]
  //   const lastIndex=formData.projectContacts?.length||0;
  //   const contactsToInsert: ContactsToInsert[] = contacts.map((contact, index) => ({
  //     projectID: projectID || 0, // Use the projectID from props, fallback to 0 if null
  //     contactID: contact.id,
  //     orderNum: lastIndex + index + 1 // Order starts from lastIndex + 1
  //   }));

  //   // Send to API
  //   const insert = await projectService.inserProjectContacts(contactsToInsert);
  //   if(insert){
  //   // Update form data with the original contacts
  //   setFormData({
  //     ...formData,
  //     projectContacts: [...(formData.projectContacts || []), ...contacts]
  //   });
  // }
  // };

  function mapProjectDetailsToInsertRequest(
    project: ProjectDetails
  ): InsertProjectRequest {
    return {
      projectID: project.projectID,
      projectNum: project.projectNum!,
      name: project.name!,

      officeID: project.officeID!,
      cityID: project.cityID!,

      statusID: project.statusID!,
      hoursReportMethodID: 1,

      customerID: project.customerID!,
      copyingInstituteID: project.copyingInstituteID!,

      projectTypeID: project.projectTypeID!,
      isActive: project.isActive,
      startDate: new Date(project.startDate!).toISOString(),
      endDate: project.endDate ? new Date(project.endDate).toISOString() : null,

      description: project.description!,
      studioDepartmentTypeID: project.studioDepartmentTypeID!,

      blockHourReports: false,
      hourReportTypes: 1,
      employeeID: project.employeeID!,
      address: project.address ?? ''
    };
  }

  const handleSave = async (): Promise<number> => {
    let result;
    console.log('Form Data to Save:', formData.projectDataListsDto);
    if (!formData.name?.trim()) {
      setErrorMessage('שם הפרויקט הוא שדה חובה');
      if (!formData.projectNum || String(formData.projectNum).trim() === '') {
        setErrorNumMessage('מספר הפרויקט הוא שדה חובה');
      }
      return 0;
    }

    setIsSaving(true);
    try {
      if (originalData) {
        const { projectContacts: _, ...formDataWithoutContacts } = formData;
        const { projectContacts: __, ...originalDataWithoutContacts } = originalData;

        if (JSON.stringify(formDataWithoutContacts) === JSON.stringify(originalDataWithoutContacts)) {
          return formData.projectID; // Return existing ID without saving
        }
      }
      const insertRequest = mapProjectDetailsToInsertRequest(formData);

      if (formData.projectID === 0) {
        result = await projectService.insertUpdateProject(insertRequest, "InsertProjectAsync");
      } else {
        result = await projectService.insertUpdateProject(insertRequest, "UpdateProjectAsync");
      }
      return result as number;
    } catch (error) {
      console.error('Failed to save project:', error);
      return 0;
    } finally {
      setIsSaving(false);
    }
  };
  const contactsGridOpen = async () => {
    let newID = 0;
    if (projectID === 0 || projectID === null) {
      newID = await handleSave();
      if (newID == 0 || newID === undefined) return;
      const projectSaved: ProjectDetails = {
        ...formData,
        projectID: newID !== 0 ? newID : formData.projectID
      }
      setFormData(projectSaved);
    }
    const contactsList = formData.projectDataListsDto.customers.filter(customer =>
      !formData.projectContacts?.some(contact => contact.id === customer.customerID)
    );
    const contactGrid: IdNameDto[] = contactsList.map(customer => ({
      id: customer.customerID,
      name: customer.name,
    }));
    setGridContacts(contactGrid);
    openModal();
    setIsContactsOpen(true);
  }

  const closeProjectParticipants = () => {
    setIsContactsOpen(false);
    closeModal();
    setOriginalData(formData);
  }
  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="text-gray-800 bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}

        <div className="relative pt-1 flex items-center justify-between mb-2 px-4">
          <h2 className="text-lg font-semibold text-gray-800 text-center flex-1">
            {projectID === 0 || projectID === null ? 'הוסף פרויקט חדש' : `עריכת פרויקט - ${formData.name}`}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center"
          >
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

              {/* Project Name - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  שם הפרויקט <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  placeholder="הזן שם פרויקט"
                />
                {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
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
                    onChange={(e) => handleChange('projectNum', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                    placeholder=""
                  />
                  {errorNumMessage && <p className="text-red-500 text-sm mt-1">{errorNumMessage}</p>}

                </div>

                {/* Customer */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    לקוח ראשי
                  </label>
                  <AutoComplete
                    items={formData.projectDataListsDto.customers.filter(c => c.isCustomer === true)}
                    selectedItem={formData.projectDataListsDto.customers.find(c => c.customerID === formData.customerID) || null}
                    onSelect={(customer) => handleChange('customerID', customer.customerID)}
                    getItemId={(c) => c.customerID}
                    getItemLabel={(c) => c.name}
                    placeholder="בחר לקוח..."
                    height={2}
                  />
                </div>

                {/* City */}
                <div className="relative w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    ישוב
                  </label>

                  <AutoComplete
                    items={formData.projectDataListsDto.cities}
                    selectedItem={formData.cityID != null && formData.cityID > 0 ? formData.projectDataListsDto.cities.find(c => c.id === formData.cityID) : null}
                    onSelect={(city) => handleChange('cityID', city!.id)}
                    getItemId={(c) => c!.id}
                    getItemLabel={(c) => c!.name}
                    placeholder="בחר ישוב..."
                    height={2}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    כתובת
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
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
                    onSelect={(emp) => handleChange('employeeID', emp.id)}
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
                    onSelect={(studio) => handleChange('studioDepartmentTypeID', studio.id)}
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
                    onSelect={(office) => handleChange('officeID', office.id)}
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
                    onSelect={(status) => handleChange('statusID', status.id)}
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
                    onSelect={(projectType) => handleChange('projectTypeID', projectType.id)}
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
                    onSelect={(copying) => handleChange('copyingInstituteID', copying.id)}
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
                    onChange={(e) => handleChange('startDate', e.target.value)}
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
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                  />
                </div>
              </div>

              {/* Description - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                  <FileText className="inline w-4 h-4 mr-1" />
                  תיאור
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
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
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ml-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  פרויקט פעיל
                </label>
              </div>
              <div className="flex justify-center w-full">
                <button
                  onClick={contactsGridOpen}
                  type="button"
                  title='רשימת משתתפים'
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
                  onClick={async () => {
                    const success = await handleSave();
                    if (success) {
                      onSave();
                    }
                  }}
                  disabled={isSaving}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'שומר...' : 'שמור פרויקט'}
                </button>
              </div>
            </>
          )}
        </div>

        {isContactsOpen && (
          <ProjectParticipants
            selectedContacts={formData.projectContacts || []}
            setSelectedContacts={(con: any) => {
              setFormData({
                ...formData,
                projectContacts: con
              });
            }}
            availableContacts={gridContacts}
            onClose={closeProjectParticipants}
            projectID={formData.projectID}
          />
        )}
      </div>
    </div>
  );
}