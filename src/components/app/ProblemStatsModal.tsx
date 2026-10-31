import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/ui/typography';
import { HelpTooltip } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { canvasColor } from '@/lib/colors';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useEffect, useContext } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { X, Calendar, Clock, BarChart3, Tag, Percent, ArrowRight, RefreshCw, PieChart, AlertTriangle, RotateCcw, HelpCircleIcon } from 'lucide-react';
import DonutChart from './DonutChart';
import { useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '@/auth/AuthContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const ProblemStatsModal = ({ isOpen, onClose, problem }: { isOpen: boolean, onClose: () => void, problem: any }) => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const manualLapseMutation = useMutation(
    async (problemId: number) => {
      const res = await authenticatedFetch('/api/manualLapse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });
      if (!res.ok) throw new Error('Failed to lapse problem');
      return res.json();
    },
    {
      onSuccess: async () => {
        try {
          await authenticatedFetch('/api/updateCollectionCounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collectionId: problem?.collectionId }),
          });
        } catch (e) {
          console.error('Failed to update collection counts:', e);
        }
        queryClient.invalidateQueries(['allProblems', user?.email]);
        queryClient.invalidateQueries(['dueTodayProblems', user?.email]);
        queryClient.invalidateQueries(['collectionDetails']);
        queryClient.invalidateQueries(['collections', user?.email]);
        queryClient.invalidateQueries(['collectionProblems', problem?.collectionId]);
        queryClient.invalidateQueries(['userSettings', user?.email]);
        onClose();
      },
    }
  );
  // Handle keyboard events (Escape to close)


  // Don't render the modal content if problem is null
  if (!problem) return null;

  // Prepare data for DonutChart format
  const chartLabels = ['Again', 'Hard', 'Good', 'Easy'];
  const chartData = [problem.againCount, problem.hardCount, problem.goodCount, problem.easyCount];
  const chartColors = [canvasColor('feedback-again-chart'), canvasColor('feedback-hard-chart'), canvasColor('status-success'), canvasColor('feedback-easy-chart')];

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
      <div className="mt-0.5 p-2 rounded-md bg-surface-field text-app-action-end">{icon}</div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {customValue ? (
          customValue
        ) : (
          <p className="text-base font-semibold text-sm text-placeholder">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Modal Backdrop */}


      {/* Modal Container - Centered with animation */}

        {/* Modal */}
        <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent size="lg" scroll="frame" className="w-[calc(100%-2rem)]" dismissible={!manualLapseMutation.isLoading}>
          {/* Decorative accent line at top */}
          <div className="h-1 w-full bg-gradient-to-r from-app-action-start to-app-action-end"></div>

          {/* Scrollable content area */}
          <ScrollArea direction="both" className="max-h-[calc(90vh-1px)]">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <DialogTitle>{problem.name}</DialogTitle>
                <Button variant="close" aria-label="Close dialog" disabled={manualLapseMutation.isLoading}
                  onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Stats Information */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <Heading as="h3" size="sm" weight="medium" tone="soft" >Basic Information</Heading>
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
                        customValue={<DifficultyBadge value={problem.difficulty} />}
                      />
                      <StatItem
                        icon={<Tag className="h-4 w-4" />}
                        label="Type"
                        customValue={<StudyStateBadge value={problem.type} />}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <Separator variant="gradient" />

                  {/* Advanced Stats */}
                  <div className="space-y-4">
                    <Heading as="h3" size="sm" weight="medium" tone="soft" >Advanced Statistics</Heading>
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

                  {/* Manual Lapse Action - only enabled for Review problems */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2">
                      <Button variant="lapse" size="comfortable" loading={manualLapseMutation.isLoading}
                        onClick={() => manualLapseMutation.mutate(problem.id)}
                        disabled={manualLapseMutation.isLoading || problem.type !== 'Review'}
                      >
                        <RotateCcw className="h-4 w-4" />
                        {manualLapseMutation.isLoading ? 'Lapsing...' : 'Lapse Manually'}
                      </Button>
                      <HelpTooltip content="Manually lapse this problem to reset due date and cap intervals at your max setting.">
                        <Button variant="bare" aria-label="About manual lapses"><HelpCircleIcon size={14} className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" /></Button>
                      </HelpTooltip>
                    </div>
                    {manualLapseMutation.isError && (
                      <Alert variant="inlineError" className="mt-2">Failed to lapse. Please try again.</Alert>
                    )}
                  </div>
                </div>

                {/* Right Column - Feedback Breakdown Chart */}
                <Card surface="field" radius="lg" border="field" elevation="none" className="h-full flex flex-col">
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <Heading as="h3" size="sm" weight="medium" tone="soft" >Feedback Breakdown</Heading>
                      <PieChart className="h-4 w-4 text-app-action-end" />
                    </div>

                    <div className="flex-1 flex justify-center items-center">
                      {isDataEmpty ? (
                        <div className="h-full flex items-center justify-center">
                          <Empty variant="chartInline">No data available yet</Empty>
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
                </Card>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

    </>
  );
};

export default ProblemStatsModal;
