import React from "react";
import { Event, SelectedItem } from "@/types";
import EventCard from "./EventCard";

interface EventGridProps {
  events: Event[];
  title?: string;
  showFilter?: boolean;
  selectedEvents?: SelectedItem[];
  selectedNonTechEvents?: SelectedItem[];
  onSelectEvent?: (event: Event) => void;
  onSelectNonTechEvent?: (event: Event) => void;
}

const EventGrid: React.FC<EventGridProps> = ({
  events,
  title = "Events",
  showFilter = false,
  selectedEvents = [],
  selectedNonTechEvents = [],
  onSelectEvent,
  onSelectNonTechEvent,
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
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer ${
                filter === "all"
                  ? "bg-red-600/35 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                  : "bg-red-950/15 border-red-600/40 text-red-200/90 hover:bg-red-600/25 hover:border-red-500/75 hover:text-white"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter("tech")}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer ${
                filter === "tech"
                  ? "bg-red-600/35 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                  : "bg-red-950/15 border-red-600/40 text-red-200/90 hover:bg-red-600/25 hover:border-red-500/75 hover:text-white"
              }`}
            >
              Tech Events
            </button>
            <button
              onClick={() => setFilter("non-tech")}
              className={`px-5 py-2 text-sm font-medium rounded-full border transition-all duration-300 cursor-pointer ${
                filter === "non-tech"
                  ? "bg-red-600/35 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                  : "bg-red-950/15 border-red-600/40 text-red-200/90 hover:bg-red-600/25 hover:border-red-500/75 hover:text-white"
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
            <EventCard 
              key={event.id} 
              event={event} 
              isSelected={
                event.type === "tech"
                  ? selectedEvents.some((e) => e.id === event.id)
                  : selectedNonTechEvents.some((e) => e.id === event.id)
              }
              onSelect={event.type === "tech" ? onSelectEvent : onSelectNonTechEvent}
            />
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
