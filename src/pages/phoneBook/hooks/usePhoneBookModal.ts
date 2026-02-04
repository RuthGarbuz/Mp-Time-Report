import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  getPhoneBookCompanyList, 
  addCompany, 
  updateCompany, 
  addPhoneBookContact, 
  updatePhoneBookContact 
} from '../../../services/phoneBookService';
import { PhoneBookValidator } from '../models/phoneBookValidation';
import {  type Company, type City, type PhoneBook } from '../models';
import type { Global } from '../../../interface/meetingModel';

type UsePhoneBookModalProps = {
  mode: 'add' | 'update';
  initialContact: PhoneBook;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
};

export const usePhoneBookModal = ({ 
  mode, 
  initialContact, 
  isOpen, 
  onSave 
}: UsePhoneBookModalProps) => {
  const [editData, setEditData] = useState<PhoneBook>(initialContact);
  const [isEditing, setIsEditing] = useState(mode === 'add');
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    firstName: '',
    company: '',
    email: '',
    general: '',
  });

  const [companiesList, setCompaniesList] = useState<Company[]>([]);
  const [citiesList, setCitiesList] = useState<City[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Global | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Title
  const title = useMemo(() => {
    if (mode === 'add') return 'הוסף איש קשר';
    return isEditing ? 'עריכת איש קשר' : 'פרטי איש קשר';
  }, [mode, isEditing]);

  // Load companies and cities
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const phoneBookData = await getPhoneBookCompanyList();
        if (phoneBookData) {
          setCompaniesList(phoneBookData.companies);
          setCitiesList(phoneBookData.cities);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen]);

  // Set initial data
  useEffect(() => {
    if (initialContact) {
      setEditData(initialContact);
      setIsEditing(mode === 'add');
      setIsAddingCompany(false);
    }
  }, [initialContact, mode]);

  // Update selected company
  useEffect(() => {
    if (companiesList.length > 0 && editData.selectedCompanyId) {
      const company = companiesList.find(c => c.id === editData.selectedCompanyId);
      if (company) {
        setSelectedCompany({ id: company.id, name: company.name });
      }
    }
  }, [companiesList, editData.selectedCompanyId]);

  // Update selected city
  useEffect(() => {
    if (citiesList.length > 0 && editData.companyCityID) {
      const city = citiesList.find(c => c.id === editData.companyCityID);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [citiesList, editData.companyCityID]);

  // Update field
  const updateField = useCallback((field: keyof PhoneBook, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (field === 'firstName' || field === 'company' || field === 'email') {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, []);

  // Handle company select
  const handleCompanySelect = useCallback((company: Global) => {
    setSelectedCompany(company);
    setEditData(prev => ({ ...prev, selectedCompanyId: Number(company.id) }));
  }, []);

  // Handle city select
  const handleCitySelect = useCallback((city: City) => {
    setSelectedCity(city);
    setEditData(prev => ({ ...prev, companyCityID: city.id ?? 0 }));
  }, []);

  // Clear company data
  const clearCompanyData = useCallback(() => {
    setEditData(prev => ({
      ...prev,
      company: '',
      companyAddress: '',
      companyPhone: '',
      companyCityID: undefined,
    }));
  }, []);

  // Validate
  const validate = useCallback((): boolean => {
    const validation = PhoneBookValidator.validate(editData, editData.selectedCompanyId,mode);
    
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, ...validation.errors }));
      return false;
    }
    
    setErrors({ firstName: '', company: '', email: '', general: '' });
    return true;
  }, [editData]);

  // Save company data - returns the company ID (or null if no company operation)
  const saveCompanyData = useCallback(async (): Promise<number | null> => {
    if (editData.selectedCompanyId) {
      // Use existing company
      const selectedCompany = companiesList.find(c => c.id === editData.selectedCompanyId);
      if (selectedCompany) {
        setEditData(prev => ({
          ...prev,
          company: selectedCompany.name || '',
          companyAddress: selectedCompany.address || '',
          companyPhone: selectedCompany.phoneNum || '',
        }));
      }
      return editData.selectedCompanyId;
    }
   else if (isAddingCompany && editData.company) {
      // Add new company
      const newCompany: Company = {
        id: Date.now(),
        name: editData.company,
        address: editData.companyAddress ?? '',
        phoneNum: editData.companyPhone ?? '',
        cityID: editData.companyCityID
      };
      
      const newCompanyID = await addCompany(newCompany);
      if (newCompanyID && newCompanyID > 0) {
        setEditData(prev => ({ ...prev, selectedCompanyId: newCompanyID }));
        return newCompanyID;
      }
      return null;
    }  
    
    return null;
  }, [isAddingCompany, editData, companiesList]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      // Save company first if needed - get the company ID directly
      const companyID = await saveCompanyData();
      if (companyID === null && isAddingCompany && editData.company) {
        // Company save failed
        setErrors(prev => ({ ...prev, general: 'שגיאה בשמירת פרטי החברה' }));
        return;
      }

      // Use the company ID from saveCompanyData if available, otherwise use editData
      const finalCompanyID = companyID ?? editData.selectedCompanyId;
      
      // Create contact data with the correct company ID
      const contactData: PhoneBook = {
        ...editData,
        selectedCompanyId: finalCompanyID
      };
     // let updatCompany;
      let success;
      // if(mode==='update'&&(contactData.id===undefined||contactData.id===0)&&contactData.firstName===''){
      //    if (isAddingCompany && editData.company && finalCompanyID) {
      //     const companyData: Company = {
      //       id: finalCompanyID,
      //       name: editData.company,
      //       address: editData.companyAddress ?? '',
      //       phoneNum: editData.companyPhone ?? '',
      //       cityID: editData.companyCityID
      //     };
      //     updatCompany= await updateCompany(companyData);
      //     success = await addPhoneBookContact(contactData);
      //    }
      // }
      if (mode === 'add') {
        success = await addPhoneBookContact(contactData);
      } else {
      
        // Update company if editing
        if (isAddingCompany && editData.company && finalCompanyID) {
          const companyData: Company = {
            id: finalCompanyID,
            name: editData.company,
            address: editData.companyAddress ?? '',
            phoneNum: editData.companyPhone ?? '',
            cityID: editData.companyCityID
          };
      await updateCompany(companyData);
        }
        if(contactData.id===undefined||contactData.id===0){
          if(contactData.firstName!=''){
           success = await addPhoneBookContact(contactData);
          }
          else success=true;
        }
        else{
        success = await updatePhoneBookContact(contactData);
        }
      }

      if (success) {
        onSave();
      } else {
        setErrors(prev => ({ ...prev, general: 'שגיאה בשמירת איש הקשר' }));
      }
    } catch (error) {
      console.error('Failed to save contact:', error);
      setErrors(prev => ({ ...prev, general: 'שגיאה בשמירת איש הקשר' }));
    } finally {
      setIsSaving(false);
    }
  }, [validate, saveCompanyData, mode, isAddingCompany, editData, onSave]);

  // Toggle edit
  const toggleEdit = useCallback(() => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
      setIsAddingCompany(false);
    }
  }, [isEditing, handleSave]);

  return {
    // State
    editData,
    isEditing,
    isAddingCompany,
    isSaving,
    isLoading,
    errors,
    title,
    companiesList,
    citiesList,
    selectedCompany,
    selectedCity,

    // Actions
    updateField,
    handleCompanySelect,
    handleCitySelect,
    clearCompanyData,
    setIsAddingCompany,
    handleSave,
    toggleEdit,
  };
};
