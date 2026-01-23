import React, { useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { X, Calendar, Clock, BarChart3, Tag, Percent, ArrowRight, RefreshCw, PieChart, AlertTriangle } from 'lucide-react';
import Badge from '../ui/Badge';
import DonutChart from './DonutChart';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProblemStatsModal = ({ isOpen, onClose, problem }: { isOpen: boolean, onClose: () => void, problem: any }) => {
  // Handle keyboard events (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render the modal content if problem is null
  if (!problem) return null;

  // Prepare data for DonutChart format
  const chartLabels = ['Again', 'Hard', 'Good', 'Easy'];
  const chartData = [problem.againCount, problem.hardCount, problem.goodCount, problem.easyCount];
  const chartColors = ['#FF395F', '#FFBF1A', '#87cf3a', '#59FF00'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatInterval = (interval: number) => {
    return `${Math.round(interval / (60 * 24))} days`;
  };

  const isDataEmpty = chartData.every((value) => value === 0);

  const StatItem = ({
    icon,
    label,
    value,
    className,
    customValue,
  }: {
    icon: React.ReactNode
    label: string
    value?: string | number
    className?: string
    customValue?: React.ReactNode
  }) => (
    <div className={`flex items-start gap-3 ${className || ''}`}>
      <div className="mt-0.5 p-2 rounded-md bg-[#1E232C] text-[#3b82f6]">{icon}</div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-primary">{label}</p>
        {customValue ? (
          customValue
        ) : (
          <p className="text-base font-semibold text-sm text-[#8A94A6]">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Modal Container - Centered with animation */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-500 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {/* Modal */}
        <div
          className={`w-full max-w-4xl rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] 
                     transition-all duration-500 max-h-[90vh] overflow-hidden
                     bg-gradient-to-b from-[#2A303C] to-[#252B38] border border-[#3A4150]/50 text-primary
                     relative ${isOpen ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-[40px]"}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative accent line at top */}
          <div className="h-1 w-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6]"></div>

          {/* Scrollable content area */}
          <div className="overflow-y-auto max-h-[calc(90vh-1px)]">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight">{problem.name}</h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full hover:bg-[#3A4150]/70 transition-colors duration-200 flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Stats Information */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <StatItem 
                        icon={<Calendar className="h-4 w-4" />} 
                        label="Date Created" 
                        value={formatDate(problem.creationDate)} 
                      />
                      <StatItem 
                        icon={<Clock className="h-4 w-4" />} 
                        label="Next Due" 
                        value={formatDate(problem.originalDueDate || problem.dueDate)} 
                      />
                      <StatItem 
                        icon={<BarChart3 className="h-4 w-4" />} 
                        label="Difficulty"
                        customValue={<Badge type="difficulty" value={problem.difficulty} />}
                      />
                      <StatItem 
                        icon={<Tag className="h-4 w-4" />} 
                        label="Type" 
                        customValue={<Badge type="problemType" value={problem.type} />}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-[#3A4150]/70 to-transparent" />

                  {/* Advanced Stats */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Advanced Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <StatItem
                        icon={<Percent className="h-4 w-4" />}
                        label="Ease Factor"
                        value={problem.ease.toFixed(2)}
                      />
                      <StatItem
                        icon={<ArrowRight className="h-4 w-4" />}
                        label="Current Interval"
                        value={formatInterval(problem.interval)}
                      />
                      <StatItem
                        icon={<RefreshCw className="h-4 w-4" />}
                        label="Relearn Interval"
                        value={formatInterval(problem.relearnInterval)}
                      />
                      <StatItem
                        icon={<AlertTriangle className="h-4 w-4" />}
                        label="Lapses"
                        value={problem.lapses || 0}
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Feedback Breakdown Chart */}
                <div className="border border-[#3A4150]/70 bg-[#1E232C] rounded-lg h-full flex flex-col">
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300">Feedback Breakdown</h3>
                      <PieChart className="h-4 w-4 text-[#3b82f6]" />
                    </div>

                    <div className="flex-1 flex justify-center items-center">
                      {isDataEmpty ? (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-400 text-sm">No data available yet</p>
                        </div>
                      ) : (
                        <DonutChart 
                          labels={chartLabels} 
                          data={chartData} 
                          backgroundColors={chartColors} 
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProblemStatsModal;