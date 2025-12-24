import { useEffect, useRef, useState } from 'react';
import { Briefcase, Plus, Search, X } from 'lucide-react';
import { useModal } from '../ModalContextType';
import type { ProjectModel } from '../../interface/project';
import projectService from '../../services/projectService';
import UpdateProject from './projectModelOpen';

export default function ProjectList() {
  const [selectedProject, setSelectedProject] = useState<ProjectModel | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(20);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { openModal, closeModal } = useModal();

  const getData = async () => {
    try {
      const projectsData = await projectService.getProjectsModelList();
      if (projectsData) {
        setProjectsList(projectsData);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    closeModal();
    setVisibleCount(20);
  }, [searchTerm, showActiveOnly]);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredProjects.length));
    }
  };

  const filteredProjects = projectsList.filter((project) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      project.projectName.toLowerCase().includes(term) ||
      project.projectNum.toLowerCase().includes(term) ||
      project.customerName.toLowerCase().includes(term) ||
      project.name.toLowerCase().includes(term);

    const matchesActive = showActiveOnly ? project.isActive : true;

    return matchesSearch && matchesActive;
  });

  const visibleProjects = filteredProjects.slice(0, visibleCount);

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 relative w-full">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-1 relative w-full ">
              <input
                type="text"
                placeholder="חפש לפי שם פרויקט, מספר ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 w-full pr-4 pl-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"

              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute  left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"

                >
                  <X size={18} />
                </button>
              ) : (
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              )}
            </div>

            {/* Active Filter Toggle */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">הצג פרויקטים פעילים בלבד</span>
              </label>
              <span className="text-xs text-gray-500">
                ({filteredProjects.length} פרויקטים)
              </span>
            </div>
          </div>
        </div>

        {/* Update Project Modal */}
        {selectedProject && (
          <UpdateProject
            isOpen={true}
            projectID={selectedProject.projectID}
            onClose={() => {
              setSelectedProject(null);
              closeModal();
            }}
            onSave={() => {
              setSelectedProject(null);
              getData();
              closeModal();
            }}
          />
        )}

        {/* Add Project Modal */}
        {isAddModalOpen && (
          <UpdateProject
            isOpen={true}
            projectID={0}
            onClose={() => {
              setIsAddModalOpen(false);
              closeModal();
            }}
            onSave={() => {
              setIsAddModalOpen(false);
              getData();
              closeModal();
            }}
          />
        )}

        {/* Projects List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-220px)] overflow-y-auto rounded-2xl shadow-2xl bg-white/10"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-2">
            {visibleProjects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>לא נמצאו פרויקטים</p>
              </div>
            ) : (
              visibleProjects.map((project) => (
                <div
                  key={project.projectID}
                  className="backdrop-blur-lg border-b border-white/20 py-6 mx-4 text-white flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2"
                  onClick={() => {
                    setSelectedProject(project);
                    openModal();
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-lg font-semibold text-gray-800">
                        {project.projectName}
                      </div>
                      {!project.isActive && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          לא פעיל
                        </span>
                      )}
                      {project.isActive && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                          פעיל
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      מספר פרויקט: <span className="font-medium">{project.projectNum}</span>
                    </div>
                    {/* <div className="text-sm text-gray-600 mb-1">
                      לקוח: <span className="font-medium">{project.customerName}</span>
                    </div> */}
                    {/* {project.name && (
                      <div className="text-sm text-gray-500">{project.name}</div>
                    )} */}
                    <div className="text-xs text-gray-400 mt-2">
                      תאריך פתיחה: {new Date(project.startDate).toLocaleDateString('he-IL')}
                    </div>
                  </div>

                  {/* <div className="flex items-center">
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div> */}
                </div>
              ))
            )}
            {visibleCount < filteredProjects.length && (
              <div className="text-center text-sm text-gray-500 py-4">טוען עוד...</div>
            )}
          </div>
        </div>

        {/* Floating Add Button */}
        <div className="fixed bottom-20 right-6 z-40 group">
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              openModal();
            }}
            className="bg-gradient-to-r from-blue-400 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-6 h-6" />
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            הוסף פרויקט
          </span>
        </div>
      </div>
    </div>
  );
}