import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, } from 'recharts';
import type { ManagerCardModalProps, ProjectAnalyses, StatusCategory } from '../../interface/ManagerAnalisesModel';

const ProjectAnalysesDashboard: React.FC<ManagerCardModalProps> = ({ isOpen, onClose, managerDataCard, officeName }) => {
  const [statusData, setStatusData] = useState<StatusCategory[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  if (!isOpen) return null;

  useEffect(() => {
    if (managerDataCard) {
      const statusData = buildStatusCards(managerDataCard as ProjectAnalyses);
      setStatusData(statusData);
    } else {
      setStatusData(statusData);
    }
  }, [managerDataCard]);

  function buildStatusCards(data: ProjectAnalyses): StatusCategory[] {
    const categories: StatusCategory[] = [];

    if (data.projectStatusList) {
      categories.push({
        title: 'סטטוס פרויקטים',
        total: data.projectStatusList.reduce((sum, p) => sum + p.count, 0),
        color: '#9333ea',
        projects: data.projectStatusList.map(p => ({
          name: p.name ?? 'לא מוגדר',
          count: p.count
        }))
      });
    }

    if (data.projectEmployeeList) {
      categories.push({
        title: 'עובדים אחראיים',
        total: data.projectEmployeeList.reduce((sum, p) => sum + p.count, 0),
        color: '#22c55e',
        projects: data.projectEmployeeList.map(p => ({
          name: p.name ?? 'לא מוגדר',
          count: p.count
        }))
      });
    }

    if (data.projectTypeList) {
      categories.push({
        title: 'סוג פרויקטים',
        total: data.projectTypeList.reduce((sum, p) => sum + p.count, 0),
        color: '#3b82f6',
        projects: data.projectTypeList.map(p => ({
          name: p.name ?? 'לא מוגדר',
          count: p.count
        }))
      });
    }

    if (data.projectStudioList) {
      categories.push({
        title: 'סטודיו / שלב עבודה',
        total: data.projectStudioList.reduce((sum, p) => sum + p.count, 0),
        color: '#f97316',
        projects: data.projectStudioList.map(p => ({
          name: p.name ?? 'לא מוגדר',
          count: p.count
        }))
      });
    }

    return categories;
  }

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Create pie data for each category

  const createPieData = (category: StatusCategory) => {
    const sortedProjects = [...category.projects].sort((a, b) => b.count - a.count);
    const top4 = sortedProjects.slice(0, 4);
    const others = sortedProjects.slice(4);

    const pieData = top4.map((project, index) => ({
      name: project.name,
      value: project.count,
      color: generateColor(category.color, index)
    }));



    if (others.length > 0) {
      const othersSum = others.reduce((sum, p) => sum + p.count, 0);
      pieData.push({
        name: 'אחר',
        value: othersSum,
        color: '#9ca3af'
      });

    }

    return pieData;
  };



  // Generate color variations

  const generateColor = (baseColor: string, index: number) => {
    const colors = {
      '#9333ea': ['#9333ea', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
      '#22c55e': ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'],
      '#3b82f6': ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
      '#f97316': ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5']
    };

    return colors[baseColor as keyof typeof colors]?.[index] || baseColor;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {payload[0].value} פרויקטים
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 text-color-gray-800" dir="rtl">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="relative pt-1 flex items-center justify-center mb-2  border-b">
          <h2 className="text-lg font-semibold text-gray-800 text-center">פילוח פרויקטים - {officeName}</h2>
          <button
            onClick={() => onClose()}
            className="absolute left-0 w-8 h-8 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="pr-8 text-lg text-gray-600">
          פרויקטים פעילים: <span className="font-bold">{managerDataCard.projectsCount.toLocaleString('he-IL')}</span>
        </p>
        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">

          {/* Cards Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1  gap-6">
            {statusData.map((category, index) => {
              const isExpanded = expandedIndex === index;
              const pieData = createPieData(category);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border-r-8  shadow-lg hover:shadow-xl transition-all duration-300 p-6 animate-fade-in`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    borderRightColor: category.color,
                  }}
                >
                  {/* Title */}
                  <div className="mb-0">
                    <h3 className="text-lg font-bold text-gray-800">
                      {category.title}
                    </h3>
                  </div>
                  {/* Pie Chart */}
                  <div className="h-60 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(props) => {
                            const percent = (props as any).percent ?? 0;
                            return `${(percent * 100).toFixed(0)}%`;
                          }}
                          outerRadius={80}
                          innerRadius={0}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={800}
                          animationBegin={index * 100 + 300}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          height={50}
                          formatter={(value: any) => {
                            const truncated = value.length > 9 ? value.substring(0, 9) + '...' : value;
                            return <span className="text-sm text-gray-700">{truncated}</span>;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Expand Button */}
                  <button
                    onClick={() => toggleExpand(index)}
                    className="w-full flex items-center justify-center gap-2 mt py-3 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {isExpanded ? 'הסתר פרטים נוספים' : 'הצג פרטים נוספים'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    )}

                  </button>

                  {/* Expandable List - All Projects (No Chart) */}
                  {isExpanded && (
                    <div className="mt-4 space-y-2 animate-slide-down">
                      {category.projects.map((project, pIndex) => (
                        <div
                          key={pIndex}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <span className="text-sm text-gray-700 flex-1">{project.name}</span>
                          <span
                            className="text-base font-bold px-3 py-1 rounded-full ml-2"
                            style={{
                              backgroundColor: category.color + '20',
                              color: category.color
                            }}
                          >
                            {project.count} פר'
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
  opacity: 0;
}
@keyframes slide-down {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}
.animate-slide-down {
  animation: slide-down 0.3s ease-out forwards;
}
`}</style>
    </div>
  );
};

export default ProjectAnalysesDashboard;