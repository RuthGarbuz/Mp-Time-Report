import { useRef } from 'react';
import { Briefcase, Search, X } from 'lucide-react';
import { useModal } from '../ModalContextType';
import { useProjects } from './hooks/useProjects';
import ProjectModalOpen from './projectModalOpen';

export default function ProjectList() {
  const listRef = useRef<HTMLDivElement | null>(null);
  const { openModal, closeModal } = useModal();

  const {
    projects,
    filteredCount,
    searchTerm,
    showActiveOnly,
    isLoading,
    selectedProject,
    isAddModalOpen,
    hasMore,
    setSearchTerm,
    setShowActiveOnly,
    openNewProject,
    openEditProject,
    closeProjectModal,
    handleProjectSaved,
    refreshProjects,
    loadMore,
  } = useProjects(openModal, closeModal);

  const handleScroll = () => {
    if (!listRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMore();
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Input */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-3 relative w-full">

              <input
                type="text"
                placeholder="חפש לפי שם פרויקט, מספר ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-gray-600 w-full pr-4 pl-12 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
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
                ({filteredCount} פרויקטים)
              </span>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="h-[calc(100vh-220px)] overflow-y-auto rounded-2xl shadow-2xl bg-white/10"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-2">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">טוען...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>לא נמצאו פרויקטים</p>
              </div>
            ) : (
              <>
                {projects.map((project) => (
                  <div
                    key={project.projectID}
                    className="border-b border-white/20 py-6 mx-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2"
                    onClick={() => openEditProject(project)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-lg font-semibold text-gray-800">
                          {project.projectName}
                        </div>
                        {project.isActive ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            פעיל
                          </span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                            לא פעיל
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        מספר פרויקט: <span className="font-medium">{project.projectNum}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        תאריך פתיחה: {new Date(project.startDate).toLocaleDateString('he-IL')}
                      </div>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <div className="text-center text-sm text-gray-500 py-4">טוען עוד...</div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Floating Add Button */}
        <div className="fixed bottom-20 right-6 z-40 group">
          <button
            onClick={openNewProject}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group"

          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            הוסף פרויקט
          </span>
        </div>

        {/* Modals */}
        {selectedProject && (
          <ProjectModalOpen
            isOpen={true}
            projectID={selectedProject.projectID}
            onClose={closeProjectModal}
            onSave={handleProjectSaved}
            onBackgroundSave={refreshProjects}
          />
        )}

        {isAddModalOpen && (
          <ProjectModalOpen
            isOpen={true}
            projectID={0}
            onClose={closeProjectModal}
            onSave={handleProjectSaved}
            onBackgroundSave={refreshProjects}
          />
        )}
      </div>
    </div>
  );
}