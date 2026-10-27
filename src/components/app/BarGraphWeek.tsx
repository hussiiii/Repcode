import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useContext } from 'react';
import { AuthContext } from '@/auth/AuthContext';
import { useQuery } from 'react-query';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );


const BarGraphWeek = () => {
    const { user } = useContext(AuthContext);

    const generateLabels = () => {
        const labels = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            // Clone today's date
            const date = new Date(today);
            // Add `i` days to the date
            date.setDate(date.getDate() + i);
            // Format the date as "Month/Day"
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            labels.push(label);
        }
        return labels;
    };

    const chartOptions = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1e1e1e',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#3A4253',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    title: function(tooltipItems: any) {
                        return 'Due Problems';
                    },
                    label: function(context: any) {
                        return `${context.parsed.y} problems due on ${context.label}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                    display: true, 
                },
                ticks: {
                    // Use a callback function to format the tick labels
                    callback: function(value:any) {
                        if (value % 1 === 0) { // Check if the value is a whole number
                            return value;
                        }
                    },
                    stepSize: 1, 
                    color: "#D1D5DB", 
                }
            }, 
            x: {
                grid: {
                    display: false, 
                },
                ticks: {
                    color: "#D1D5DB",
                },
            }, 
        }
    };
    
  
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

      const { isLoading, error, data } = useQuery(['allProblems', user?.email], fetchAllProblems, {
          enabled: !!user,
      });

      const processData = (problems: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date to midnight
      
        let dueCounts = Array(7).fill(0); // Array to hold counts for the next 7 days  

        (problems || []).forEach((problem: any) => {
            // Ensure the dueDate is interpreted as UTC, then converted to local time
            const dueDate = new Date(problem.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const diffTime = dueDate.getTime() - today.getTime();

            // If the problem is past due, treat it as due today
            let diffDays = diffTime < 0 ? 0 : Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
            if (diffDays >= 0 && diffDays < 7) {
                dueCounts[diffDays] += 1; // Increment the count for the respective day
            }
        });

        return dueCounts;
      };
      

    if (error) {
        return <div>Error: {(error as Error).message}</div>
    } else {
        const dueCounts = processData(data); // Assuming `data` is the array of problems
        const chartData = {
            labels: generateLabels(),
            datasets: [
                {
                    label: 'Problems Due',
                    data: dueCounts, 
                    backgroundColor: 'rgba(56, 189, 248, 0.7)',
                    borderColor: 'rgba(56, 189, 248, 1)',
                    borderWidth: 1,
                    borderRadius: 4,
                    hoverBackgroundColor: 'rgba(56, 189, 248, 0.9)',
                },
            ],
        };

        return (
            <div className="flex flex-col items-center">
                <div style={{ height: '300px', width: '100%' }}>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#37B0E7]"></div>
                        </div>
                    ) : (
                        <Bar 
                            data={chartData} 
                            options={chartOptions}
                        />
                    )}
                </div>
            </div>
        );
    }
}

export default BarGraphWeek; 
