import React from "react";
import { Workshop } from "@/types";
import WorkshopCard from "./WorkshopCard";

interface WorkshopGridProps {
  workshops: Workshop[];
  title?: string;
  showFilter?: boolean;
}

const WorkshopGrid: React.FC<WorkshopGridProps> = ({
  workshops,
  title = "Workshops",
  showFilter = false,
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
          <div className="flex flex-wrap bg-white/5 rounded-lg p-1 backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                filter === "all"
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  filter === category
                    ? "bg-red-500/20 text-red-300"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Category Tags */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm border border-red-500/30"
            >
              {category}
            </span>
          ))}
        </div>
      </div>
      {/* Workshops Grid */}
      {filteredWorkshops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
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
