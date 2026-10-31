import { Badge } from '@/components/ui/Badge';
import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/ui/typography';
import { HelpTooltip } from '@/components/ui/tooltip';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlameIcon, ClockIcon, TriangleAlertIcon } from "lucide-react"

const StudyDashboardPreview = () => {
  // Hardcoded data for the bar chart
  const barData = [15, 8, 12, 20, 10, 5, 18];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const maxValue = Math.max(...barData);

  return (
    <div className="p-6">
      <Heading as="h2" size="xl" weight="bold" tone="foreground" className="mb-6">Study Dashboard</Heading>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Stats and Chart */}
        <div className="md:w-1/2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading as="h3" size="sm" weight="medium" tone="muted">Daily Streak</Heading>
                <div className="bg-marketing-streak/10 p-2 rounded-md">
                  <FlameIcon size={16} className="text-marketing-streak" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-foreground">7</span>
                <span className="ml-1 text-muted-foreground text-sm">days</span>
              </div>
            </Card>

            <Card padding="md">
              <div className="flex items-center justify-between mb-2">
                <Heading as="h3" size="sm" weight="medium" tone="muted">Due Today</Heading>
                <div className="bg-marketing-feedback-warning/10 p-2 rounded-md">
                  <TriangleAlertIcon size={16} className="text-marketing-feedback-warning" />
                </div>
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-bold text-foreground">12</span>
                <span className="ml-1 text-muted-foreground text-sm">problems</span>
              </div>
            </Card>
          </div>

          {/* Due Problems Chart */}
          <Card className="overflow-hidden">
            <CardHeader variant="preview">
              <div className="flex justify-between items-center">
                <Heading as="h2" size="sm" weight="semibold" tone="foreground">Due Problems</Heading>
              </div>
            </CardHeader>
            <div className="p-4">
              {/* Simplified Bar Chart */}
              <div className="relative h-[160px] w-full">
                {/* Y-axis grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((_, i) => (
                    <div key={i} className="border-t border-border w-full h-0"></div>
                  ))}
                </div>
                
                {/* Bars */}
                <div className="absolute inset-0 pt-4 pb-8 flex items-end justify-between">
                  {barData.map((value, index) => (
                    <div key={index} className="flex flex-col items-center w-8">
                      <div 
                        className="w-6 rounded-t-sm bg-gradient-to-t from-marketing-chart-start to-marketing-chart-end"
                        style={{ 
                          height: `${(value / maxValue) * 100}px`,
                          transition: 'height 0.5s ease-in-out'
                        }}
                      ></div>
                      <div className="text-muted-foreground text-xs mt-2">{days[index]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Study Now Button and Problem List */}
        <div className="md:w-1/2">
          <Card className="overflow-hidden h-full">
            <CardHeader variant="preview">
              <div className="flex justify-between items-center">
                <Heading as="h2" size="sm" weight="semibold" tone="foreground">Due Today</Heading>
                <Badge variant="meta" size="compact" >
                  12 problems
                </Badge>
              </div>
            </CardHeader>
            <div className="p-3">
              <Button variant="marketing" size="action" className="w-full mb-4">
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
              </Button>

              <ScrollArea direction="both" className="space-y-2 max-h-[240px]  pr-1">
                {[
                  { name: "Two Sum", difficulty: "Easy", type: "Review" },
                  { name: "Valid Parentheses", difficulty: "Easy", type: "Learning" },
                  { name: "Merge Two Sorted Lists", difficulty: "Easy", type: "New" },
                  { name: "Maximum Subarray", difficulty: "Medium", type: "Review" },
                  { name: "LRU Cache", difficulty: "Medium", type: "Learning" },
                ].map((problem, index) => (
                  <Card surface="page" radius="lg" padding="sm" elevation="none" key={index}>
                    <HelpTooltip content={problem.name} variant="default"><Heading as="h3" weight="medium" tone="foreground" className="mb-1 truncate" tabIndex={0}>
                      {problem.name}
                    </Heading></HelpTooltip>
                    <div className="flex items-center gap-2 mb-1">
                      <DifficultyBadge value={problem.difficulty} />
                      <StudyStateBadge value={problem.type} />
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <ClockIcon size={10} className="mr-1" />
                      Due: Today @ 11:45pm
                    </div>
                  </Card>
                ))}
              </ScrollArea>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StudyDashboardPreview

