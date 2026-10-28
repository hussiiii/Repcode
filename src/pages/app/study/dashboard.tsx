import { authenticatedFetch } from '@/lib/authenticatedFetch';
import { useRouter } from 'next/router';
import { AuthContext } from '@/auth/AuthContext';
import { useQuery } from 'react-query';
import React, { useContext, useState, useEffect } from 'react';
import "../../../app/globals.css"; 
import SideBar from '@/components/app/SideBar';
import nookies from "nookies"; 
import firebaseAdmin from "../../../../firebaseAdmin"; 
import ProblemTypeInfo from '@/components/app/ProblemTypeInfo';
import BarGraphWeek from '@/components/app/BarGraphWeek';
import BarGraphMonth from '@/components/app/BarGraphMonth';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import StatsCharts from '@/components/app/StatsCharts';
import StreakCalendar from '@/components/app/StreakCalendar';

// Import Lucide icons
import {
  PlayIcon,
  CalendarIcon,
  ClockIcon,
  TrendingUpIcon,
  FlameIcon,
  BarChart3Icon,
  CheckCircleIcon,
  TriangleAlertIcon, 
  ChevronRightIcon,
  SparklesIcon,
  BookOpenIcon,
  CircleIcon,
  HeartPulseIcon,
  HelpCircleIcon,
} from "lucide-react";

const StudyProblemPage = () => {
  const router = useRouter(); 
  const { user } = useContext(AuthContext);
  const [timeRange, setTimeRange] = useState<"daily" | "monthly">("daily");

  const fetchAllProblems = async () => {
    if (!user) {
      throw new Error("No user found");
    }
    const response = await authenticatedFetch(`/api/getAllProblemsFromUser`);
    if (!response.ok) {
      throw new Error("Failed to fetch all problems");
    }
    return response.json();
  };

  const fetchUserSettings = async () => {
    const response = await authenticatedFetch(`/api/getUserSettings`);
    if (!response.ok) {
      throw new Error("Failed to fetch user settings");
    }
    return response.json();
  };

  const { isLoading: isLoading2, error: error2, data: userData } = useQuery(['userSettings', user?.email], fetchUserSettings, {
    enabled: !!user,
  });

  const { isLoading, error, data } = useQuery(['allProblems', user?.email], fetchAllProblems, {
    enabled: !!user,
  });

  const dueTodayProblems = data ? data.filter((problem: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateLocal = new Date(problem.dueDate);
    return dueDateLocal < today || dueDateLocal.getDate() === today.getDate() && dueDateLocal.getMonth() === today.getMonth() && dueDateLocal.getFullYear() === today.getFullYear();
  }) : [];

  const dueTodayCount = dueTodayProblems.length;

  const goDueProblems = () => {
    router.push('/app/study/dueproblems');
  };

  // Calculate some basic stats for the stats cards
  const totalProblems = data ? data.length : 0;

  // Get streak value from user data (stored in database)
  const currentStreak = userData?.currentStreak ?? 0;

  // Calculate streak status based on lastStreakDate (calendar-day based)
  const getStreakStatus = (): { status: 'done_today' | 'action_needed' | 'streak_lost' | 'no_streak'; message: string } => {
    if (!userData?.lastStreakDate) {
      return { status: 'no_streak', message: 'Start your streak!' };
    }

    // Get today's local date in YYYY-MM-DD format
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    // Get yesterday's local date
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (userData.lastStreakDate === todayStr) {
      return { status: 'done_today', message: '✓ Done for today' };
    } else if (userData.lastStreakDate === yesterdayStr) {
      return { status: 'action_needed', message: 'Do activity today!' };
    } else {
      return { status: 'streak_lost', message: 'Streak lost' };
    }
  };

  const streakStatus = getStreakStatus();

  const calculateEstimatedStudyTime = (problems: any[]) => {
    if (!problems || problems.length === 0) return "0 min";
    
    let totalMinutes = 0;
    
    problems.forEach(problem => {
      const difficulty = problem.difficulty.toLowerCase();
      const type = problem.type.toLowerCase();
      
      if (difficulty === 'easy') {
        if (type === 'review') totalMinutes += 5;
        else if (type === 'learning' || type === 'relearning') totalMinutes += 10;
        else if (type === 'new') totalMinutes += 15;
      } 
      else if (difficulty === 'medium') {
        if (type === 'review') totalMinutes += 10;
        else if (type === 'learning' || type === 'relearning') totalMinutes += 20;
        else if (type === 'new') totalMinutes += 30;
      }
      else if (difficulty === 'hard') {
        if (type === 'review') totalMinutes += 25;
        else if (type === 'learning' || type === 'relearning') totalMinutes += 35;
        else if (type === 'new') totalMinutes += 50;
      }
    });
    
    // Format the time
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  const estimatedStudyTime = calculateEstimatedStudyTime(dueTodayProblems);

  return (
    <div className="flex min-h-screen bg-background">
      <SideBar />
      <div className="flex-1 ml-0 transition-all duration-300">
        <div className="p-6 md:p-8 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
                Study Dashboard
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your progress and study efficiently
              </p>
            </header>

            {data && totalProblems === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="max-w-md mx-auto text-center">
                  {/* Icon */}
                  <div className="mb-6 relative">
                    <div className="w-20 h-20 mx-auto bg-surface rounded-2xl flex items-center justify-center relative overflow-hidden">
                      {/* Subtle gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-app-action-end/10 to-metric-due/5"></div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-muted-foreground relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                      </svg>
                    </div>
                    {/* Floating dots decoration */}
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-app-action-end/30 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-1 -left-3 w-2 h-2 bg-metric-due/40 rounded-full animate-pulse animation-delay-300"></div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No Problems Tracked
                  </h3>
                  
                  {/* Message */}
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Create problems to access Study Mode and start tracking your progress!
                  </p>
                  
                  
                  {/* Decorative element */}
                  <div className="flex items-center justify-center space-x-1 opacity-50 mt-6">
                    <div className="w-1 h-1 bg-app-action-end rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-metric-due rounded-full animate-pulse animation-delay-300"></div>
                    <div className="w-1 h-1 bg-app-action-end rounded-full animate-pulse animation-delay-600"></div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-surface rounded-xl p-4 border border-border shadow-lg relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-muted-foreground text-xs font-medium">
                      Daily Streak
                    </h3>
                    <div className="relative group">
                      <HelpCircleIcon
                        size={12}
                        className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors"
                      />

                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-background border border-border rounded-lg shadow-xl text-xs text-muted-foreground w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <div className="text-foreground font-medium mb-1">
                          How streaks work
                        </div>

                        <p className="mb-2">
                          Do activity (create a problem or give feedback) on consecutive days to build your streak.
                        </p>

                        <p className="text-muted-foreground/80">
                          You have until the end of the next day to continue your streak.
                        </p>

                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-border"></div>
                      </div>
                    </div>

                  </div>
                  <div className="bg-difficulty-hard-background p-1.5 rounded-md">
                    <FlameIcon size={16} className="text-difficulty-hard" />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-foreground">
                    {currentStreak}
                  </span>
                  <span className="ml-1 text-muted-foreground text-sm">days</span>
                </div>
                <div className="absolute bottom-2 right-3">
                  <span className={`text-[10px] ${
                    streakStatus.status === 'done_today' ? 'text-difficulty-easy' :
                    streakStatus.status === 'action_needed' ? 'text-study-learning' :
                    streakStatus.status === 'streak_lost' ? 'text-difficulty-hard' :
                    'text-muted-foreground'
                  }`}>
                    {streakStatus.message}
                  </span>
                </div>
              </div>
              
              <div className="bg-surface rounded-xl p-4 border border-border shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-muted-foreground text-xs font-medium">
                    Total Problems
                  </h3>
                  <div className="bg-metric-total/10 p-1.5 rounded-md">
                    <BarChart3Icon size={16} className="text-metric-total-foreground" />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-foreground">
                    {totalProblems}
                  </span>
                  <span className="ml-1 text-muted-foreground text-sm">tracked</span>
                </div>
              </div>
              
              <div className="bg-surface rounded-xl p-4 border border-border shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-muted-foreground text-xs font-medium">
                    Due Today
                  </h3>
                  <div className="bg-status-warning-background p-1.5 rounded-md">
                    <TriangleAlertIcon size={16} className="text-study-learning" />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-foreground">
                    {dueTodayCount}
                  </span>
                  <span className="ml-1 text-muted-foreground text-sm">problems</span>
                </div>
              </div>
              
              <div className="bg-surface rounded-xl p-4 border border-border shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-muted-foreground text-xs font-medium">
                      Est. Study Time
                    </h3>
                    <div className="relative group">
                      <HelpCircleIcon size={12} className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-background border border-border rounded-lg shadow-xl text-xs text-muted-foreground w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        Calculated estimate based on the difficulty and type of each problem in your queue today.
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-border"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-metric-due/10 p-1.5 rounded-md">
                    <ClockIcon size={16} className="text-metric-due-foreground" />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-foreground">
                    {estimatedStudyTime}
                  </span>
                  <span className="ml-1 text-muted-foreground text-sm">today</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <h3 className="text-muted-foreground text-xs font-medium">
                      Total Reviews
                    </h3>
                    <div className="relative group">
                      <HelpCircleIcon size={12} className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-background border border-border rounded-lg shadow-xl text-xs text-muted-foreground w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        Giving feedback to a problem in Study Mode increments this.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-border"></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-metric-streak/10 p-1.5 rounded-md">
                    <HeartPulseIcon size={16} className="text-metric-streak-foreground" />
                  </div>
                </div>
                <div className="flex items-baseline">
                  <span className="text-xl font-bold text-foreground">
                    {data?.reduce((sum: number, p: any) => 
                      sum + (p.againCount || 0) + (p.hardCount || 0) + (p.goodCount || 0) + (p.easyCount || 0), 0
                    ) || 0}
                  </span>
                  <span className="ml-1 text-muted-foreground text-sm">total</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Charts Section - 2/3 width on large screens */}
              <div className="lg:col-span-2">
                {/* Due Problems Chart */}
                <div className="bg-surface rounded-xl border border-border shadow-lg overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-foreground">
                        Due Problems
                      </h2>
                      <div className="flex bg-background rounded-lg p-1">
                        <button
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === "daily" ? "bg-gradient-to-r from-metric-due to-app-action-end text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => setTimeRange("daily")}
                        >
                          7 Days
                        </button>
                        <button
                          className={`px-3 py-1 text-sm rounded-md transition-colors ${timeRange === "monthly" ? "bg-gradient-to-r from-metric-due to-app-action-end text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                          onClick={() => setTimeRange("monthly")}
                        >
                          Monthly
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {timeRange === "daily" ? <BarGraphWeek /> : <BarGraphMonth />}
                  </div>
                </div>

                {/* Activity Calendar */}
                <div className="bg-surface rounded-xl border border-border shadow-lg mt-6 overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-lg font-semibold text-foreground">
                          Activity Calendar
                        </h2>
                        <div className="relative group">
                          <HelpCircleIcon size={14} className="text-muted-foreground/50 hover:text-muted-foreground cursor-help transition-colors" />
                          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-2 bg-background border border-border rounded-lg shadow-xl text-xs text-muted-foreground w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            Tracks all the days you had any kind of activity (either created or reviewed a problem).
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-border"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-sm flex items-center">
                        <CalendarIcon size={14} className="mr-1" />
                        past year
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <StreakCalendar currentYear={new Date().getFullYear()} />
                  </div>
                </div>

              </div>

              {/* Due Today Section - 1/3 width on large screens */}
              <div className="lg:col-span-1">
                <div className="bg-surface rounded-xl border border-border shadow-lg overflow-hidden">
                  <div className="p-5 border-b border-border">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-foreground">
                        Due Today
                      </h2>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background text-muted-foreground">
                        {dueTodayCount} problems
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    {dueTodayCount > 0 ? (
                      <button
                        onClick={goDueProblems}
                        className="w-full bg-gradient-to-r from-metric-due to-app-action-end hover:from-app-action-hover-start hover:to-app-action-hover-end text-foreground py-3 px-4 rounded-lg font-medium flex items-center justify-center mb-4 transition-all duration-200 shadow-lg shadow-app-action-end/20 hover:shadow-app-action-end/30"
                      >
                        <PlayIcon className="w-5 h-5 mr-2" />
                        Start Studying
                      </button>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        You don&apos;t have any problems due today. Maybe now is a good time to create some and learn some new stuff...
                      </div>
                    )}
                    
                    {dueTodayCount > 0 && (
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {dueTodayProblems.map((problem: any) => (
                          <div
                            key={problem.id}
                            className="bg-background rounded-lg p-4 border border-border"
                          >
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-foreground mb-2 truncate max-w-[80%]" title={problem.name}>
                                {problem.name.length > 30 ? `${problem.name.substring(0, 30)}...` : problem.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge type="difficulty" value={problem.difficulty} />
                              <Badge type="problemType" value={problem.type} />
                            </div>
                            {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            
                            // Use originalDueDate if available, otherwise fall back to dueDate
                            const actualDueDate = new Date(problem.originalDueDate || problem.dueDate);
                            actualDueDate.setHours(0, 0, 0, 0);
                            
                            const isOverdue = actualDueDate < today;
                            const formattedDate = actualDueDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            });
                            
                            return (
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center text-muted-foreground">
                                  <ClockIcon size={12} className="mr-1" />
                                  Due: {formattedDate}
                                </div>
                                {isOverdue && (
                                  <span className="text-difficulty-hard/80 font-medium">
                                    overdue
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section - Full Width */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Stats
              </h2>
              <p className="text-muted-foreground mb-6">
                See various statistics and data related to your study habits
              </p>
              <StatsCharts />
            </div>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context:any) {
  try {
    const cookies = nookies.get(context);
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    
    // Optionally fetch more data for your page using token.uid or other identifiers

    // If the token is valid, return empty props (or props based on token/user data)
    return {
      props: {},
    };
  } catch (err) {
    // If token verification fails or token doesn't exist, redirect to sign-in page
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}

export default StudyProblemPage;
