import React from "react";
import { Workshop, SelectedItem } from "@/types";
import WorkshopCard from "./WorkshopCard";

interface WorkshopGridProps {
  workshops: Workshop[];
  title?: string;
  showFilter?: boolean;
  selectedWorkshops?: SelectedItem[];
  onSelectWorkshop?: (workshop: Workshop) => void;
}

const WorkshopGrid: React.FC<WorkshopGridProps> = ({
  workshops,
  title = "Workshops",
  showFilter = false,
  selectedWorkshops = [],
  onSelectWorkshop,
}) => {
  const [filter, setFilter] = React.useState<string>("all");

  const categories = React.useMemo(() => {
    return [...new Set(workshops.map((workshop) => workshop.category))];
  }, [workshops]);

  const filteredWorkshops = React.useMemo(() => {
    if (filter === "all") return workshops;
    return workshops.filter((workshop) => workshop.category === filter);
  }, [workshops, filter]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {title}
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-300">
            <span>
              {filteredWorkshops.length}{" "}
              {filteredWorkshops.length === 1 ? "workshop" : "workshops"}{" "}
              available
            </span>
            <span className="hidden sm:inline">•</span>
            <span>{categories.length} categories</span>
          </div>
        </div>{" "}
        {/* Filter Tabs */}
        {showFilter && (
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer ${
                filter === "all"
                  ? "bg-red-600/35 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                  : "bg-red-950/15 border-red-600/40 text-red-200/90 hover:bg-red-600/25 hover:border-red-500/75 hover:text-white"
              }`}
            >
              All Workshops
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-5 py-2 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer ${
                  filter === category
                    ? "bg-red-600/35 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                    : "bg-red-950/15 border-red-600/40 text-red-200/90 hover:bg-red-600/25 hover:border-red-500/75 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Workshops Grid */}
      {filteredWorkshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <WorkshopCard 
              key={workshop.id} 
              workshop={workshop} 
              isSelected={selectedWorkshops.some((w) => w.id === workshop.id)}
              onSelect={onSelectWorkshop}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No workshops found</div>
          <p className="text-gray-500">
            {filter !== "all"
              ? `No ${filter} workshops are currently available.`
              : "No workshops are currently available."}
          </p>
        </div>
      )}{" "}
      {/* Quick Stats */}
      {/* <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {workshops.length}
          </div>
          <div className="text-gray-300 text-sm">Total Workshops</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {categories.length}
          </div>
          <div className="text-gray-300 text-sm">Categories</div>
        </div>
      </div> */}
    </div>
  );
};

export default WorkshopGrid;
