import React from "react";
import { Event } from "@/types";
import EventCard from "./EventCard";

interface EventGridProps {
  events: Event[];
  title?: string;
  showFilter?: boolean;
}

const EventGrid: React.FC<EventGridProps> = ({
  events,
  title = "Events",
  showFilter = false,
}) => {
  const [filter, setFilter] = React.useState<"all" | "tech" | "non-tech">(
    "all"
  );

  const filteredEvents = React.useMemo(() => {
    if (filter === "all") return events;
    return events.filter((event) => event.type === filter);
  }, [events, filter]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-300">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"} available
          </p>
        </div>

        {/* Filter Tabs */}
        {showFilter && (
          <div className="flex bg-white/5 rounded-lg p-1 backdrop-blur-sm border border-white/10">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                filter === "all"
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("tech")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                filter === "tech"
                  ? "bg-red-500/20 text-red-300"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Tech Events
            </button>
            <button
              onClick={() => setFilter("non-tech")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                filter === "non-tech"
                  ? "bg-red-500/20 text-red-300"
                  : "text-gray-300 hover:text-white hover:bg-white/5"
              }`}
            >
              Non-Tech Events
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No events found</div>
          <p className="text-gray-500">
            {filter !== "all"
              ? `No ${filter} events are currently available.`
              : "No events are currently available."}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventGrid;
