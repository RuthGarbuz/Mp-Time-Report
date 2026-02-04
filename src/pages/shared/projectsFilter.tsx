import React, { useState, useRef, useEffect } from "react";
import type { Project } from "../../interface/projectModel";



interface ProjectFilterProps {
  isOpen: boolean;
  projectsList: Project[];
  selectedProject: Project | null;
  setSelectedProject: (p: Project) => void;
  handleOk: () => Promise<void> | void;
  onClose: () => void;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
  isOpen,
  projectsList,
  selectedProject,
  setSelectedProject,
  handleOk,
  onClose,
}) => {

  if (!isOpen) return null; // אם המודאל סגור - לא מחזירים כלום

  const listRef = useRef<HTMLDivElement | null>(null);
  const [searchProject, setSearchProject] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredProjects = projectsList.filter((p) => {
    const normalizedName = p.name.toLowerCase().replace(/['"'״׳]/g, '');
    const normalizedSearch = searchProject.toLowerCase().replace(/['"'״׳]/g, '');
    return normalizedName.includes(normalizedSearch);
  });

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  const loadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, filteredProjects.length));
  };

  const handleScroll = () => {
    if (!listRef.current || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMore();
    }
  };

  // Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(20);
  }, [searchProject]);

  return (
    <div className="text-gray-800 min-h-40 fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4">
        <h2 className="text-lg font-semibold mb-3">בחר פרויקט</h2>

        {/* חיפוש */}
       <input
              // ref={(input) => input?.focus()}
              type="text"
              placeholder="חיפוש..."
              value={searchProject}
              onChange={(e) => setSearchProject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-3"
            />

        {/* רשימת פרויקטים */}
        <div 
          ref={listRef}
          onScroll={handleScroll}
          className="min-h-60 max-h-60 overflow-y-auto border-gray-300 rounded-lg"
        >
          {visibleProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedProject(p)}
              onDoubleClick={async () => {
                setSelectedProject(p);
                await handleOk();
              }}
              className={`p-2 cursor-pointer hover:bg-purple-100 ${
                selectedProject?.id === p.id ? "bg-purple-200" : ""
              }`}
            >
              {p.name}
            </div>
          ))}
          {hasMore && (
            <div className="text-center text-sm text-gray-500 py-2">טוען עוד...</div>
          )}
        </div>

        {/* כפתורים */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300"
          >
            ביטול
          </button>
          <button
            onClick={async () => await handleOk()}
            className="px-4 py-2 rounded-lg  bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition"
          >
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilter;