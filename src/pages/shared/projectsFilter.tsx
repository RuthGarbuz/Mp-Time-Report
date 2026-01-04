import React, { useState } from "react";
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

    const [searchProject, setSearchProject] = useState("");
 const filteredProjects = projectsList.filter((p) =>
    p.name.toLowerCase().includes(searchProject.toLowerCase()))
 

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
        <div className="min-h-60 max-h-60 overflow-y-auto border-gray-300 rounded-lg">
          {filteredProjects.map((p) => (
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