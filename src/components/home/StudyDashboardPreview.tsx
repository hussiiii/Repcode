import { FlameIcon, ClockIcon, TriangleAlertIcon } from "lucide-react"
import Badge from "../ui/Badge"

const StudyDashboardPreview = () => {
  // Hardcoded data for the bar chart
  const barData = [15, 8, 12, 20, 10, 5, 18];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const maxValue = Math.max(...barData);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-primary mb-6">Study Dashboard</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Stats and Chart */}
        <div className="md:w-1/2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#343B4A] rounded-xl p-4 border border-[#3A4253] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#B0B7C3] text-sm font-medium">Daily Streak</h3>
                <div className="bg-[#f87171]/10 p-2 rounded-md">
                  <FlameIcon size={16} className="text-[#f87171]" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-primary">7</span>
                <span className="ml-1 text-[#B0B7C3] text-sm">days</span>
              </div>
            </div>

            <div className="bg-[#343B4A] rounded-xl p-4 border border-[#3A4253] shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[#B0B7C3] text-sm font-medium">Due Today</h3>
                <div className="bg-[#facc15]/10 p-2 rounded-md">
                  <TriangleAlertIcon size={16} className="text-[#facc15]" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-primary">12</span>
                <span className="ml-1 text-[#B0B7C3] text-sm">problems</span>
              </div>
            </div>
          </div>

          {/* Due Problems Chart */}
          <div className="bg-[#343B4A] rounded-xl border border-[#3A4253] shadow-lg overflow-hidden">
            <div className="p-4 border-b border-[#3A4253]">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-primary">Due Problems</h2>
              </div>
            </div>
            <div className="p-4">
              {/* Simplified Bar Chart */}
              <div className="relative h-[160px] w-full">
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="border-t border-[#3A4253] w-full h-0"></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="absolute inset-0 pt-4 pb-8 flex items-end justify-between">
                  {barData.map((value, index) => (
                    <div key={index} className="flex flex-col items-center w-8">
                      <div 
                        className="w-6 rounded-t-sm bg-gradient-to-t from-[#0891b2] to-[#38bdf8]"
                        style={{ 
                          height: `${(value / maxValue) * 100}px`,
                          transition: 'height 0.5s ease-in-out'
                        }}
                      ></div>
                      <div className="text-[#B0B7C3] text-xs mt-2">{days[index]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Study Now Button and Problem List */}
        <div className="md:w-1/2">
          <div className="bg-[#343B4A] rounded-xl border border-[#3A4253] shadow-lg overflow-hidden h-full">
            <div className="p-4 border-b border-[#3A4253]">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-semibold text-primary">Due Today</h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2A303C] text-[#B0B7C3]">
                  12 problems
                </span>
              </div>
            </div>
            <div className="p-3">
              <button className="w-full bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] hover:from-[#0891b2] hover:to-[#2563eb] text-primary py-2 px-4 rounded-lg font-medium flex items-center justify-center mb-4 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Start Studying
              </button>

              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {[
                  { name: "Two Sum", difficulty: "Easy", type: "Review" },
                  { name: "Valid Parentheses", difficulty: "Easy", type: "Learning" },
                  { name: "Merge Two Sorted Lists", difficulty: "Easy", type: "New" },
                  { name: "Maximum Subarray", difficulty: "Medium", type: "Review" },
                  { name: "LRU Cache", difficulty: "Medium", type: "Learning" },
                ].map((problem, index) => (
                  <div key={index} className="bg-[#2A303C] rounded-lg p-3 border border-[#3A4253]">
                    <h3 className="font-medium text-primary mb-1 truncate" title={problem.name}>
                      {problem.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge type="difficulty" value={problem.difficulty} />
                      <Badge type="problemType" value={problem.type} />
                    </div>
                    <div className="text-xs text-[#B0B7C3] flex items-center">
                      <ClockIcon size={10} className="mr-1" />
                      Due: Today @ 11:45pm
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudyDashboardPreview

