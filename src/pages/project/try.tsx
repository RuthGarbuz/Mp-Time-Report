// import { useEffect, useState } from 'react';
// import { X, Save, Trash2 } from 'lucide-react';
// import type { ProjectDetails, ProjectModel } from '../../interface/project';
// import projectService from '../../services/projectService';

// interface UpdateProjectProps {
//   mode: 'add' | 'update';
//   project: ProjectModel;
//   onClose: () => void;
//   onSave: () => void;
// }

// export default function UpdateProject({ mode, project, onClose, onSave }: UpdateProjectProps) {
//   const [formData, setFormData] = useState<ProjectDetails>(
//      {
//           projectID: 0,
//           name: null,
//           projectNum: null,
//           startDate: new Date().toISOString().split('T')[0],
//           endDate: null,
//           isActive: true,
//           description: null,
//           officeID: null,
//           officeName: null,
//           cityID: null,
//           cityName: null,
//           statusID: null,
//           statusName: null,
//           copyingInstituteID: null,
//           copyingInstituteName: null,
//           studioDepartmentTypeID: null,
//           studioDepartmentTypeName: null,
//           address: null,
//           customerID: null,
//           customerName: null,
//           employeeID: null,
//           employeeName: null,
//           projectTypeID: null,
//           projectTypeName: null
//         }
//   );
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const handleChange = (field: keyof ProjectDetails, value: any) => {

//       setFormData({ ...formData, [field]: value });
//   };
//   const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);

//   useEffect(() => {
//     const fetchProjectDetails = async () => {
//       if (mode === 'update' && project.projectID) {
//         try {
//           const details = await projectService.getProjectByID(project.projectID);
//           setProjectDetails(details);
//           setFormData(details || formData);
//         } catch (error) {
//           console.error('Failed to fetch project details:', error);
//         }
//       }
//     };

//     fetchProjectDetails();
//   }, [project.projectID, mode]);

//   const handleSave = async () => {
//     if (!formData.name?.trim() || !formData.projectNum?.trim()) {
//       alert('שם הפרויקט ומספר הפרויקט הם שדות חובה');
//       return;
//     }

//     setIsSaving(true);
//     try {
//     //   if (mode === 'add') {
//     //     await projectService.createProject(formData);
//     //   } else {
//     //     await projectService.updateProject(formData);
//     //   }
//       onSave();
//     } catch (error) {
//       console.error('Failed to save project:', error);
//       alert('שגיאה בשמירת הפרויקט');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!confirm('האם אתה בטוח שברצונך למחוק פרויקט זה?')) return;

//     setIsDeleting(true);
//     try {
//     //   await projectService.deleteProject(formData.projectID);
//       onSave();
//     } catch (error) {
//       console.error('Failed to delete project:', error);
//       alert('שגיאה במחיקת הפרויקט');
//     } finally {
//       setIsDeleting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
//       <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
//         {/* Header */}
//         <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
//           <h2 className="text-xl font-bold">
//             {mode === 'add' ? 'הוסף פרויקט חדש' : 'עדכן פרויקט'}
//           </h2>
//           <button
//             onClick={onClose}
//             className="hover:bg-white/20 rounded-full p-1 transition-colors"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Form */}
//         <div className="p-6 space-y-4">
//           {/* Project Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               שם הפרויקט <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.name!}
//               onChange={(e) => handleChange('name', e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="הזן שם פרויקט"
//             />
//           </div>

//           {/* Project Number */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               מספר פרויקט <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.projectNum!}
//               onChange={(e) => handleChange('projectNum', e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="הזן מספר פרויקט"
//             />
//           </div>

//           {/* Customer Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               שם לקוח
//             </label>
//             <input
//               type="text"
//               value={formData.customerName!}
//               onChange={(e) => handleChange('customerName', e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="הזן שם לקוח"
//             />
//           </div>

//           {/* Name (Additional field) */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               תיאור נוסף
//             </label>
//             <input
//               type="text"
//               value={formData!}
//               onChange={(e) => handleChange('additionalDescription', e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="תיאור או הערות"
//             />
//           </div>

//           {/* Start Date */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               תאריך התחלה
//             </label>
//             <input
//               type="date"
//               value={formData.startDate.split('T')[0]}
//               onChange={(e) => handleChange('startDate', e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//           </div>

//           {/* Active Status */}
//           <div className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               id="isActive"
//               checked={formData.isActive}
//               onChange={(e) => handleChange('isActive', e.target.checked)}
//               className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//             />
//             <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
//               פרויקט פעיל
//             </label>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex gap-2">
//           {mode === 'update' && (
//             <button
//               onClick={handleDelete}
//               disabled={isDeleting}
//               className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//             >
//               <Trash2 size={18} />
//               {isDeleting ? 'מוחק...' : 'מחק'}
//             </button>
//           )}
//           <button
//             onClick={handleSave}
//             disabled={isSaving}
//             className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//           >
//             <Save size={18} />
//             {isSaving ? 'שומר...' : 'שמור'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }