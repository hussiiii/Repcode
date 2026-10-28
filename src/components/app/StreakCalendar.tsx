import { cssColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useContext, useMemo } from 'react';
import { useQuery } from 'react-query';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { Tooltip as ReactTooltip } from "react-tooltip";
import { AuthContext } from '@/auth/AuthContext';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

const StreakCalendar = ({ currentYear }: { currentYear: number }) => {
  const { user } = useContext(AuthContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch activity days from API for the displayed year
  const displayedYear = currentMonth.getFullYear();
  
  const fetchActivityDays = async () => {
    const response = await authenticatedFetch(`/api/getActivityDays?year=${displayedYear}`);
    if (!response.ok) {
      throw new Error('Failed to fetch activity days');
    }
    return response.json();
  };

  const { data: activityData, isLoading } = useQuery(
    ['activityDays', user?.email, displayedYear],
    fetchActivityDays,
    {
      enabled: !!user?.email,
    }
  );

  // Create a Set for O(1) lookups
  const activeDatesSet = useMemo(() => new Set(activityData?.activeDates || []), [activityData]);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground text-sm">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Month Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-md hover:bg-calendar-inactive text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-md hover:bg-calendar-inactive text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day of Week Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day, i) => (
          <div key={i} className="text-center text-muted-foreground text-sm font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const isActive = activeDatesSet.has(formattedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              data-tooltip-id="streak-calendar-tooltip"
              data-tooltip-content={`${format(day, 'MMM d, yyyy')}${isActive ? ' • Active' : ''}`}
              className="flex items-center justify-center"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-150 cursor-default
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${isTodayDate ? 'ring-2 ring-app-action-end ring-offset-2 ring-offset-calendar-offset' : ''}
                  ${isActive 
                    ? 'bg-calendar-active text-foreground'
                    : 'bg-calendar-inactive text-muted-foreground hover:bg-calendar-hover'
                  }
                `}
              >
                {isActive ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  format(day, 'd')
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-calendar-inactive"></div>
            <span className="text-muted-foreground text-sm">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-calendar-active flex items-center justify-center">
              <Check size={9} strokeWidth={3} className="text-foreground" />
            </div>
            <span className="text-muted-foreground text-sm">Activity</span>
          </div>
        </div>
        <div className="text-muted-foreground text-sm">
          {activityData?.totalActiveDays || 0} days
        </div>
      </div>

      <ReactTooltip
        id="streak-calendar-tooltip"
        place="top"
        style={{ backgroundColor: cssColor('tooltip-background'), fontSize: "12px", borderRadius: "6px" }}
      />
    </div>
  );
};

export default StreakCalendar;
