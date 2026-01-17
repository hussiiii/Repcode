import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { AuthContext } from '@/auth/AuthContext';
import { useQuery } from 'react-query';
import { Bar, Line, Doughnut, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

type ChartType = 
  | 'creationDate'
  | 'interval'
  | 'lapses'
  | 'collection'
  | 'totalFeedback'
  | 'dueDate';

interface ChartConfig {
  id: ChartType;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const chartConfigs: ChartConfig[] = [
  { id: 'creationDate', label: 'By Creation Date', icon: '', color: '#3b82f6', description: 'Every problem plotted by creation date' },
  { id: 'interval', label: 'By Interval Size', icon: '', color: '#06b6d4', description: 'Problems grouped by review interval' },
  { id: 'lapses', label: 'By Lapses', icon: '', color: '#f87171', description: 'Distribution by times forgotten' },
  { id: 'collection', label: 'By Collection', icon: '', color: '#a78bfa', description: 'Problems per collection' },
  { id: 'totalFeedback', label: 'By Total Reviews', icon: '', color: '#34d399', description: 'Problems grouped by review count' },
  { id: 'dueDate', label: 'By Due Date', icon: '', color: '#fbbf24', description: 'When problems are due' },
];

const StatsCharts = () => {
  const { user } = useContext(AuthContext);
  const [selectedChart, setSelectedChart] = useState<ChartType>('collection');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [intervalViewMode, setIntervalViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [lapsesViewMode, setLapsesViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [collectionViewMode, setCollectionViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [totalReviewsViewMode, setTotalReviewsViewMode] = useState<'grouped' | 'individual'>('grouped');
  const [dueDateViewMode, setDueDateViewMode] = useState<'grouped' | 'individual'>('grouped');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all problems
  const fetchAllProblems = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getAllProblemsFromUser?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch problems");
    return response.json();
  };

  // Fetch collections for names
  const fetchCollections = async () => {
    if (!user) throw new Error("No user found");
    const response = await fetch(`/api/getUserCollections?userEmail=${user.email}`);
    if (!response.ok) throw new Error("Failed to fetch collections");
    return response.json();
  };

  const { data: problems = [], isLoading: problemsLoading } = useQuery(
    ['allProblems', user?.email],
    fetchAllProblems,
    { enabled: !!user }
  );

  const { data: collections = [], isLoading: collectionsLoading } = useQuery(
    ['collections', user?.email],
    fetchCollections,
    { enabled: !!user }
  );

  const isLoading = problemsLoading || collectionsLoading;

  // Create a map of collection IDs to names
  const collectionMap = useMemo(() => {
    const map: Record<number, string> = {};
    collections.forEach((c: any) => {
      map[c.id] = c.title;
    });
    return map;
  }, [collections]);

  const selectedConfig = chartConfigs.find(c => c.id === selectedChart)!;

  // Common chart options for big chart
  const commonOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3A4253',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 12 },
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 12 },
        },
        beginAtZero: true,
      },
    },
  };

  // 1. Problems by Creation Date (Scatter Chart - each point is a problem)
  const creationDateData = useMemo(() => {
    if (!problems.length) return null;

    const sorted = [...problems].sort(
      (a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
    );

    // Each problem becomes a point: x = creation date, y = problem index (1-based)
    const scatterData = sorted.map((p: any, index: number) => ({
      x: new Date(p.creationDate).getTime(),
      y: index + 1,
      problemName: p.name,
      problemDate: new Date(p.creationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    }));

    return {
      datasets: [
        {
          label: 'Problems',
          data: scatterData,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: '#3b82f6',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
      ],
    };
  }, [problems]);

  // Scatter chart options for creation date
  const scatterOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3A4253',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const point = context[0].raw;
            return point.problemName || 'Problem';
          },
          label: (context: any) => {
            const point = context.raw;
            return `Created: ${point.problemDate}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'month' as const,
          displayFormats: {
            month: 'MMM yyyy',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 11 },
          maxRotation: 45,
        },
        title: {
          display: true,
          text: 'Creation Date',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 12 },
          stepSize: 1,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Problem # (by creation order)',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
    },
  };

  // 2. Problems by Interval Size (Bar Chart)
  const intervalData = useMemo(() => {
    if (!problems.length) return null;

    const ranges = [
      { label: '< 1 day', min: 0, max: 1440 },
      { label: '1-7 days', min: 1440, max: 10080 },
      { label: '1-4 weeks', min: 10080, max: 40320 },
      { label: '1-3 months', min: 40320, max: 131040 },
      { label: '3-6 months', min: 131040, max: 262080 },
      { label: '6+ months', min: 262080, max: Infinity },
    ];

    const counts = ranges.map(range => 
      problems.filter((p: any) => p.interval >= range.min && p.interval < range.max).length
    );

    return {
      labels: ranges.map(r => r.label),
      datasets: [
        {
          label: 'Problems',
          data: counts,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(234, 179, 8, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(99, 102, 241, 0.8)',
          ],
          borderColor: [
            '#ef4444',
            '#f97316',
            '#eab308',
            '#22c55e',
            '#06b6d4',
            '#6366f1',
          ],
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(6, 182, 212, 1)',
            'rgba(99, 102, 241, 1)',
          ],
        },
      ],
    };
  }, [problems]);

  // 2b. Individual Problems by Interval (Scatter Chart - each point is a problem)
  const intervalIndividualData = useMemo(() => {
    if (!problems.length) return null;

    // Sort problems by interval (smallest to largest)
    const sorted = [...problems].sort((a, b) => a.interval - b.interval);

    // Helper to format interval nicely
    const formatInterval = (mins: number) => {
      if (mins < 60) return `${mins} min`;
      if (mins < 1440) return `${Math.round(mins / 60)} hours`;
      if (mins < 10080) return `${Math.round(mins / 1440)} days`;
      if (mins < 43200) return `${Math.round(mins / 10080)} weeks`;
      return `${Math.round(mins / 43200)} months`;
    };

    // Get color based on interval range
    const getColor = (interval: number) => {
      if (interval < 1440) return 'rgba(239, 68, 68, 0.8)'; // < 1 day - red
      if (interval < 10080) return 'rgba(249, 115, 22, 0.8)'; // 1-7 days - orange
      if (interval < 40320) return 'rgba(234, 179, 8, 0.8)'; // 1-4 weeks - yellow
      if (interval < 131040) return 'rgba(34, 197, 94, 0.8)'; // 1-3 months - green
      if (interval < 262080) return 'rgba(6, 182, 212, 0.8)'; // 3-6 months - cyan
      return 'rgba(99, 102, 241, 0.8)'; // 6+ months - indigo
    };

    // Each problem becomes a point
    const scatterData = sorted.map((p: any, index: number) => ({
      x: index + 1,
      y: p.interval / 1440, // Convert to days for readability
      problemName: p.name,
      intervalFormatted: formatInterval(p.interval),
      intervalMinutes: p.interval,
    }));

    const colors = sorted.map((p: any) => getColor(p.interval));

    return {
      datasets: [
        {
          label: 'Problems',
          data: scatterData,
          backgroundColor: colors,
          borderColor: colors.map((c: string) => c.replace('0.8', '1')),
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
      ],
    };
  }, [problems]);

  // Scatter chart options for individual interval view
  const intervalScatterOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3A4253',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const point = context[0].raw;
            return point.problemName || 'Problem';
          },
          label: (context: any) => {
            const point = context.raw;
            return `Interval: ${point.intervalFormatted}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Problem # (sorted by interval)',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
      y: {
        type: 'logarithmic' as const,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 12 },
          callback: function(value: any) {
            if (value < 1) return `${Math.round(value * 24)}h`;
            if (value < 7) return `${Math.round(value)}d`;
            if (value < 30) return `${Math.round(value / 7)}w`;
            return `${Math.round(value / 30)}mo`;
          },
        },
        title: {
          display: true,
          text: 'Interval (log scale)',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
    },
  };

  // 3. Problems by Lapses (Doughnut Chart)
  const lapsesData = useMemo(() => {
    if (!problems.length) return null;

    const ranges = [
      { label: '0 lapses', min: 0, max: 0 },
      { label: '1-2 lapses', min: 1, max: 2 },
      { label: '3-5 lapses', min: 3, max: 5 },
      { label: '6-10 lapses', min: 6, max: 10 },
      { label: '10+ lapses', min: 11, max: Infinity },
    ];

    const counts = ranges.map(range => 
      problems.filter((p: any) => {
        const lapses = p.lapses || 0;
        return lapses >= range.min && lapses <= range.max;
      }).length
    );

    return {
      labels: ranges.map(r => r.label),
      datasets: [
        {
          data: counts,
          backgroundColor: [
            'rgba(34, 197, 94, 0.85)',
            'rgba(6, 182, 212, 0.85)',
            'rgba(234, 179, 8, 0.85)',
            'rgba(249, 115, 22, 0.85)',
            'rgba(239, 68, 68, 0.85)',
          ],
          borderColor: '#2A303C',
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [problems]);

  // 3b. Individual Problems by Lapses (Scatter - each dot is a problem)
  const lapsesIndividualData = useMemo(() => {
    if (!problems.length) return null;

    // Sort by lapses (lowest to highest) so the visual shows progression
    const sorted = [...problems].sort((a, b) => (a.lapses || 0) - (b.lapses || 0));

    // Get color based on lapse count
    const getColor = (lapses: number) => {
      if (lapses === 0) return 'rgba(34, 197, 94, 0.85)'; // green
      if (lapses <= 2) return 'rgba(6, 182, 212, 0.85)'; // cyan
      if (lapses <= 5) return 'rgba(234, 179, 8, 0.85)'; // yellow
      if (lapses <= 10) return 'rgba(249, 115, 22, 0.85)'; // orange
      return 'rgba(239, 68, 68, 0.85)'; // red
    };

    const scatterData = sorted.map((p: any, index: number) => ({
      x: index + 1,
      y: p.lapses || 0,
      problemName: p.name,
    }));

    const colors = sorted.map((p: any) => getColor(p.lapses || 0));

    return {
      datasets: [
        {
          label: 'Problems',
          data: scatterData,
          backgroundColor: colors,
          borderColor: colors.map((c: string) => c.replace('0.85', '1')),
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
      ],
    };
  }, [problems]);

  // Scatter options for individual lapses
  const lapsesScatterOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3A4253',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const point = context[0].raw;
            return point.problemName || 'Problem';
          },
          label: (context: any) => {
            const point = context.raw;
            return `Lapses: ${point.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Problem # (sorted by lapses)',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 12 },
          stepSize: 1,
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Lapses',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
    },
  };

  // Helper function to generate consistent color based on string
  const getColorForName = (name: string, totalCount: number, index: number) => {
    // Use index in alphabetical list for consistent hue
    const hue = (index * 360 / totalCount + 200) % 360;
    return `hsla(${hue}, 70%, 60%, 0.85)`;
  };

  // 4. Problems by Collection (Horizontal Bar)
  const collectionData = useMemo(() => {
    if (!problems.length || !collections.length) return null;

    const counts: Record<string, number> = {};
    problems.forEach((p: any) => {
      const name = collectionMap[p.collectionId] || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    });

    // Sort alphabetically
    const sorted = Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
    const labels = sorted.map(([name]) => name);
    const data = sorted.map(([, count]) => count);

    // Generate consistent colors based on alphabetical position
    const colors = sorted.map((_, i) => getColorForName(labels[i], sorted.length, i));

    return {
      labels,
      datasets: [
        {
          label: 'Problems',
          data,
          backgroundColor: colors,
          borderRadius: 8,
          borderWidth: 0,
        },
      ],
    };
  }, [problems, collections, collectionMap]);

  // 4b. Individual Problems by Collection (Scatter dots in horizontal rows)
  const collectionIndividualData = useMemo(() => {
    if (!problems.length || !collections.length) return null;

    // Group problems by collection
    const grouped: Record<string, any[]> = {};
    problems.forEach((p: any) => {
      const name = collectionMap[p.collectionId] || 'Unknown';
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(p);
    });

    // Sort collections alphabetically (same order as grouped view)
    const sortedCollections = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    // Generate consistent colors based on alphabetical position
    const collectionColors: Record<string, string> = {};
    sortedCollections.forEach((name, i) => {
      collectionColors[name] = getColorForName(name, sortedCollections.length, i);
    });

    // Create scatter data - each problem is a point
    // Y = collection index, X = position within collection (spread out)
    const scatterData: any[] = [];
    const pointColors: string[] = [];

    sortedCollections.forEach((collName, collIndex) => {
      const collProblems = grouped[collName];
      collProblems.forEach((p: any, pIndex: number) => {
        scatterData.push({
          x: pIndex + 1,
          y: collIndex,
          problemName: p.name,
          collectionName: collName,
        });
        pointColors.push(collectionColors[collName]);
      });
    });

    return {
      labels: sortedCollections,
      datasets: [
        {
          label: 'Problems',
          data: scatterData,
          backgroundColor: pointColors,
          borderColor: pointColors.map((c: string) => c.replace('0.85', '1')),
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
      ],
    };
  }, [problems, collections, collectionMap]);

  // Scatter options for individual collection view
  const collectionScatterOptions = useMemo(() => {
    if (!collections.length) return {};
    
    // Get collection names in alphabetical order (same as data)
    const grouped: Record<string, any[]> = {};
    problems.forEach((p: any) => {
      const name = collectionMap[p.collectionId] || 'Unknown';
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push(p);
    });
    const sortedCollections = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    return {
      maintainAspectRatio: false,
      responsive: true,
      animations: {
        x: {
          from: 0,
        },
      } as any,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1e1e1e',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3A4253',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context: any) => {
              const point = context[0].raw;
              return point.problemName || 'Problem';
            },
            label: (context: any) => {
              const point = context.raw;
              return `Collection: ${point.collectionName}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: '#B0B7C3',
            font: { size: 11 },
          },
          beginAtZero: true,
          title: {
            display: true,
            text: 'Problem # in collection',
            color: '#B0B7C3',
            font: { size: 12 },
          },
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: '#B0B7C3',
            font: { size: 11 },
            callback: function(value: any) {
              return sortedCollections[value] || '';
            },
          },
          reverse: true, // Match horizontal bar order (first item at top)
        },
      },
    };
  }, [problems, collections, collectionMap]);

  // 5. Problems by Total Feedback (Bar Chart)
  const totalFeedbackData = useMemo(() => {
    if (!problems.length) return null;

    const withFeedback = problems.map((p: any) => ({
      ...p,
      totalFeedback: (p.againCount || 0) + (p.hardCount || 0) + (p.goodCount || 0) + (p.easyCount || 0),
    }));

    const ranges = [
      { label: '0', min: 0, max: 0 },
      { label: '1-5', min: 1, max: 5 },
      { label: '6-10', min: 6, max: 10 },
      { label: '11-20', min: 11, max: 20 },
      { label: '21-50', min: 21, max: 50 },
      { label: '50+', min: 51, max: Infinity },
    ];

    const counts = ranges.map(range =>
      withFeedback.filter((p: any) => p.totalFeedback >= range.min && p.totalFeedback <= range.max).length
    );

    return {
      labels: ranges.map(r => r.label + ' reviews'),
      datasets: [
        {
          label: 'Problems',
          data: counts,
          backgroundColor: 'rgba(52, 211, 153, 0.8)',
          borderColor: '#34d399',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(52, 211, 153, 1)',
        },
      ],
    };
  }, [problems]);

  // 5b. Individual Problems by Total Reviews (Scatter - each dot is a problem)
  const totalFeedbackIndividualData = useMemo(() => {
    if (!problems.length) return null;

    // Calculate total feedback for each problem and sort
    const withFeedback = problems.map((p: any) => ({
      ...p,
      totalFeedback: (p.againCount || 0) + (p.hardCount || 0) + (p.goodCount || 0) + (p.easyCount || 0),
    })).sort((a: any, b: any) => a.totalFeedback - b.totalFeedback);

    // Get color based on review count
    const getColor = (reviews: number) => {
      if (reviews === 0) return 'rgba(156, 163, 175, 0.85)'; // gray
      if (reviews <= 5) return 'rgba(52, 211, 153, 0.85)'; // green
      if (reviews <= 10) return 'rgba(6, 182, 212, 0.85)'; // cyan
      if (reviews <= 20) return 'rgba(59, 130, 246, 0.85)'; // blue
      if (reviews <= 50) return 'rgba(139, 92, 246, 0.85)'; // purple
      return 'rgba(236, 72, 153, 0.85)'; // pink (heavily reviewed)
    };

    const scatterData = withFeedback.map((p: any, index: number) => ({
      x: index + 1,
      y: p.totalFeedback,
      problemName: p.name,
    }));

    const colors = withFeedback.map((p: any) => getColor(p.totalFeedback));

    return {
      datasets: [
        {
          label: 'Problems',
          data: scatterData,
          backgroundColor: colors,
          borderColor: colors.map((c: string) => c.replace('0.85', '1')),
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12,
        },
      ],
    };
  }, [problems]);

  // Scatter options for individual total reviews
  const totalFeedbackScatterOptions = {
    maintainAspectRatio: false,
    responsive: true,
    animations: {
      y: {
        from: 0,
      },
    } as any,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3A4253',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const point = context[0].raw;
            return point.problemName || 'Problem';
          },
          label: (context: any) => {
            const point = context.raw;
            return `Total Reviews: ${point.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 11 },
        },
        title: {
          display: true,
          text: 'Problem # (sorted by reviews)',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#B0B7C3',
          font: { size: 12 },
        },
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Reviews',
          color: '#B0B7C3',
          font: { size: 12 },
        },
      },
    },
  };

  // 6. Problems by Due Date (Bar Chart)
  const dueDateData = useMemo(() => {
    if (!problems.length) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Group into time buckets (no overdue)
    const buckets = [
      { label: 'Today', count: 0 },
      { label: 'This Week', count: 0 },
      { label: 'This Month', count: 0 },
      { label: 'Next Month', count: 0 },
      { label: 'Later', count: 0 },
    ];

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    problems.forEach((p: any) => {
      const due = new Date(p.dueDate);
      const diff = due.getTime() - now.getTime();

      // Skip overdue problems
      if (diff < 0) return;
      if (diff < oneDay) buckets[0].count++;
      else if (diff < oneWeek) buckets[1].count++;
      else if (diff < oneMonth) buckets[2].count++;
      else if (diff < 2 * oneMonth) buckets[3].count++;
      else buckets[4].count++;
    });

    return {
      labels: buckets.map(b => b.label),
      datasets: [
        {
          label: 'Problems',
          data: buckets.map(b => b.count),
          backgroundColor: [
            'rgba(251, 191, 36, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(6, 182, 212, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderColor: [
            '#fbbf24',
            '#22c55e',
            '#06b6d4',
            '#6366f1',
            '#a855f7',
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  }, [problems]);

  // 6b. Individual Due Dates (Scatter - vertical stacked dots with time-based X axis)
  const dueDateIndividualData = useMemo(() => {
    if (!problems.length) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Group problems by their due date (skip overdue)
    const dateGroups: Record<string, { date: Date; problems: any[] }> = {};
    
    problems.forEach((p: any) => {
      const due = new Date(p.dueDate);
      due.setHours(0, 0, 0, 0);
      
      // Skip overdue problems
      if (due.getTime() < now.getTime()) return;
      
      const dateKey = due.toISOString().split('T')[0];
      
      if (!dateGroups[dateKey]) {
        dateGroups[dateKey] = { date: due, problems: [] };
      }
      dateGroups[dateKey].problems.push(p);
    });

    // Format date label for tooltip
    const formatDateLabel = (date: Date) => {
      const diff = date.getTime() - now.getTime();
      const days = Math.round(diff / (24 * 60 * 60 * 1000));
      
      if (days === 0) {
        return 'Today';
      } else if (days === 1) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }
    };

    // Color based on urgency (no overdue since we filter those out)
    const getColor = (date: Date) => {
      const diff = date.getTime() - now.getTime();
      const days = Math.round(diff / (24 * 60 * 60 * 1000));
      
      if (days === 0) return 'rgba(251, 191, 36, 0.85)'; // Today - yellow
      if (days <= 7) return 'rgba(34, 197, 94, 0.85)'; // This week - green
      if (days <= 30) return 'rgba(6, 182, 212, 0.85)'; // This month - cyan
      if (days <= 60) return 'rgba(99, 102, 241, 0.85)'; // Next month - indigo
      return 'rgba(168, 85, 247, 0.85)'; // Later - purple
    };

    // Create scatter data - dots stacking UP with actual date timestamps on X
    const scatterData: any[] = [];
    const pointColors: string[] = [];

    Object.values(dateGroups).forEach((data) => {
      const color = getColor(data.date);
      data.problems.forEach((p: any, pIndex: number) => {
        scatterData.push({
          x: data.date.getTime(), // Use actual timestamp for proper spacing
          y: pIndex + 1, // Stack upward from 1
          problemName: p.name,
          dateLabel: formatDateLabel(data.date),
        });
        pointColors.push(color);
      });
    });

    return {
      datasets: [
        {
          label: 'Problems',
          data: scatterData,
          backgroundColor: pointColors,
          borderColor: pointColors.map((c: string) => c.replace('0.85', '1')),
          borderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 10,
        },
      ],
    };
  }, [problems]);

  // Scatter options for individual due dates (time-based X axis)
  const dueDateScatterOptions = useMemo(() => {
    if (!problems.length) return {};

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Find the date range
    let minDate = now;
    let maxDate = now;
    
    problems.forEach((p: any) => {
      const due = new Date(p.dueDate);
      due.setHours(0, 0, 0, 0);
      if (due < minDate) minDate = due;
      if (due > maxDate) maxDate = due;
    });

    // Ensure we start from today at minimum
    if (minDate > now) minDate = now;

    // Add a day of padding on each end
    const startDate = new Date(minDate.getTime() - 24 * 60 * 60 * 1000);
    const endDate = new Date(maxDate.getTime() + 24 * 60 * 60 * 1000);

    // Determine appropriate time unit based on date range
    const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    let timeUnit: 'day' | 'week' | 'month' = 'day';
    if (daysDiff > 60) timeUnit = 'week';
    if (daysDiff > 180) timeUnit = 'month';

    return {
      maintainAspectRatio: false,
      responsive: true,
      layout: {
        padding: {
          left: 15,
          right: 15,
          top: 10,
        },
      },
      clip: false as any, // Prevent dots from being clipped at edges
      animations: {
        y: {
          from: 0,
        },
      } as any,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: '#1e1e1e',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#3A4253',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context: any) => {
              const point = context[0].raw;
              return point.problemName || 'Problem';
            },
            label: (context: any) => {
              const point = context.raw;
              return `Due: ${point.dateLabel}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: timeUnit,
            displayFormats: {
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy',
            },
          },
          min: startDate.getTime(),
          max: endDate.getTime(),
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: '#B0B7C3',
            font: { size: 10 },
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 12,
          },
          title: {
            display: true,
            text: 'Due Date',
            color: '#B0B7C3',
            font: { size: 12 },
          },
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
          },
          ticks: {
            color: '#B0B7C3',
            font: { size: 12 },
            stepSize: 1,
          },
          beginAtZero: true,
          suggestedMax: 5, // Give some breathing room at the top
          title: {
            display: true,
            text: 'Problems',
            color: '#B0B7C3',
            font: { size: 12 },
          },
        },
      },
    };
  }, [problems]);

  const doughnutOptions = {
    maintainAspectRatio: false,
    responsive: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
        labels: {
          color: '#B0B7C3',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 13 },
        },
      },
      tooltip: {
        backgroundColor: '#1e1e1e',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3A4253',
        borderWidth: 1,
        padding: 12,
      },
    },
  };

  const horizontalBarOptions = {
    ...commonOptions,
    indexAxis: 'y' as const,
    scales: {
      ...commonOptions.scales,
      x: {
        ...commonOptions.scales.x,
        beginAtZero: true,
      },
    },
  };

  // Render the selected chart
  const renderChart = () => {
    switch (selectedChart) {
      case 'creationDate':
        return creationDateData ? (
          <Scatter data={creationDateData} options={scatterOptions} />
        ) : null;
      case 'interval':
        if (intervalViewMode === 'individual') {
          return intervalIndividualData ? (
            <Scatter data={intervalIndividualData} options={intervalScatterOptions} />
          ) : null;
        }
        return intervalData ? (
          <Bar data={intervalData} options={commonOptions} />
        ) : null;
      case 'lapses':
        if (lapsesViewMode === 'individual') {
          return lapsesIndividualData ? (
            <Scatter data={lapsesIndividualData} options={lapsesScatterOptions} />
          ) : null;
        }
        return lapsesData ? (
          <Doughnut data={lapsesData} options={doughnutOptions} />
        ) : null;
      case 'collection':
        if (collectionViewMode === 'individual') {
          return collectionIndividualData ? (
            <Scatter data={collectionIndividualData} options={collectionScatterOptions} />
          ) : null;
        }
        return collectionData ? (
          <Bar data={collectionData} options={horizontalBarOptions} />
        ) : null;
      case 'totalFeedback':
        if (totalReviewsViewMode === 'individual') {
          return totalFeedbackIndividualData ? (
            <Scatter data={totalFeedbackIndividualData} options={totalFeedbackScatterOptions} />
          ) : null;
        }
        return totalFeedbackData ? (
          <Bar data={totalFeedbackData} options={commonOptions} />
        ) : null;
      case 'dueDate':
        if (dueDateViewMode === 'individual') {
          return dueDateIndividualData ? (
            <Scatter data={dueDateIndividualData} options={dueDateScatterOptions} />
          ) : null;
        }
        return dueDateData ? (
          <Bar data={dueDateData} options={commonOptions} />
        ) : null;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-secondary">Loading stats...</span>
        </div>
      </div>
    );
  }

  if (!problems.length) {
    return (
      <div className="bg-tertiary rounded-xl border border-divide p-8 text-center">
        <p className="text-secondary">Add some problems to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Chart Container */}
      <div className="bg-tertiary rounded-xl border border-divide shadow-lg overflow-hidden">
        {/* Header with Dropdown */}
        <div className="p-5 border-b border-divide">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg"
                style={{ backgroundColor: `${selectedConfig.color}30` }}
              >
              </div>
              <div>
                <h3 className="font-semibold text-primary text-lg">{selectedConfig.label}</h3>
                <p className="text-sm text-secondary">
                  {selectedChart === 'interval' 
                    ? (intervalViewMode === 'grouped' ? 'Problems grouped by review interval' : 'Every problem with its exact interval')
                    : selectedChart === 'lapses'
                    ? (lapsesViewMode === 'grouped' ? 'Distribution by times forgotten' : 'Every problem with its lapse count')
                    : selectedChart === 'collection'
                    ? (collectionViewMode === 'grouped' ? 'Problems per collection' : 'Every problem in each collection')
                    : selectedChart === 'totalFeedback'
                    ? (totalReviewsViewMode === 'grouped' ? 'Problems grouped by review count' : 'Every problem with its total reviews')
                    : selectedChart === 'dueDate'
                    ? (dueDateViewMode === 'grouped' ? 'When problems are due' : 'Every due date with problem count')
                    : selectedConfig.description
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sub-toggle for Interval chart */}
              {selectedChart === 'interval' && (
                <div className="flex bg-base_100 rounded-lg p-1 border border-divide">
                  <button
                    onClick={() => setIntervalViewMode('grouped')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      intervalViewMode === 'grouped'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setIntervalViewMode('individual')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      intervalViewMode === 'individual'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Individual
                  </button>
                </div>
              )}

              {/* Sub-toggle for Lapses chart */}
              {selectedChart === 'lapses' && (
                <div className="flex bg-base_100 rounded-lg p-1 border border-divide">
                  <button
                    onClick={() => setLapsesViewMode('grouped')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      lapsesViewMode === 'grouped'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setLapsesViewMode('individual')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      lapsesViewMode === 'individual'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Individual
                  </button>
                </div>
              )}

              {/* Sub-toggle for Collection chart */}
              {selectedChart === 'collection' && (
                <div className="flex bg-base_100 rounded-lg p-1 border border-divide">
                  <button
                    onClick={() => setCollectionViewMode('grouped')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      collectionViewMode === 'grouped'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setCollectionViewMode('individual')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      collectionViewMode === 'individual'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Individual
                  </button>
                </div>
              )}

              {/* Sub-toggle for Total Reviews chart */}
              {selectedChart === 'totalFeedback' && (
                <div className="flex bg-base_100 rounded-lg p-1 border border-divide">
                  <button
                    onClick={() => setTotalReviewsViewMode('grouped')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      totalReviewsViewMode === 'grouped'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setTotalReviewsViewMode('individual')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      totalReviewsViewMode === 'individual'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Individual
                  </button>
                </div>
              )}

              {/* Sub-toggle for Due Date chart */}
              {selectedChart === 'dueDate' && (
                <div className="flex bg-base_100 rounded-lg p-1 border border-divide">
                  <button
                    onClick={() => setDueDateViewMode('grouped')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      dueDateViewMode === 'grouped'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Grouped
                  </button>
                  <button
                    onClick={() => setDueDateViewMode('individual')}
                    className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                      dueDateViewMode === 'individual'
                        ? 'bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    Individual
                  </button>
                </div>
              )}
            
              {/* Dropdown */}
              <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-base_100 border border-divide rounded-lg
                           hover:border-[#3b82f6]/50 transition-colors duration-200 min-w-[200px]"
              >
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: selectedConfig.color }}
                />
                <span className="text-primary flex-1 text-left">{selectedConfig.label}</span>
                <svg 
                  className={`w-4 h-4 text-secondary transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-tertiary border border-divide rounded-lg shadow-xl z-50 overflow-hidden">
                  {chartConfigs.map(config => (
                    <button
                      key={config.id}
                      onClick={() => {
                        setSelectedChart(config.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
                        ${selectedChart === config.id 
                          ? 'bg-gradient-to-r from-[#06b6d4]/10 to-[#3b82f6]/10 border-l-2 border-l-[#3b82f6]' 
                          : 'hover:bg-base_100 border-l-2 border-l-transparent'
                        }
                      `}
                    >
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${selectedChart === config.id ? 'text-primary' : 'text-secondary'}`}>
                          {config.label}
                        </div>
                        <div className="text-xs text-secondary/70">{config.description}</div>
                      </div>
                      {selectedChart === config.id && (
                        <svg className="w-4 h-4 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </div>
          </div>
        </div>

        {/* Big Chart Area */}
        <div className="p-6 h-[450px]">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default StatsCharts;
