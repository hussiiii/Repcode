import { authenticatedFetch } from '@/lib/authenticatedFetch';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/auth/AuthContext';
import { useQuery } from 'react-query';

const ProblemTypeInfo = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);

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

  const problemCounts = data ? data.reduce((acc: any, problem: any) => {
    const type = problem.type;
    acc[type] = acc[type] || [];
    acc[type].push(problem);
    return acc;
  }, { New: [], Learning: [], Relearning: [], Review: [] }) : { New: [], Learning: [], Relearning: [], Review: [] };

  if (error) return <div>Error: {(error as Error).message}</div>;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-12 h-12 text-background animate-spin dark:text-background fill-action"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-muted-foreground text-lg text-center">
        <div className="container mx-auto p-4 text-foreground">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {[
              { name: 'New', count: problemCounts.New.length, color: 'bg-action', problems: problemCounts.New },
              { name: 'Learning', count: problemCounts.Learning.length + problemCounts.Relearning.length, color: 'bg-study-learning', problems: problemCounts.Learning.concat(problemCounts.Relearning) },
              { name: 'Review', count: problemCounts.Review.length, color: 'bg-study-review', problems: problemCounts.Review },
            ].map((category) => (
              <div
                key={category.name}
                className="overflow-hidden bg-background border-border border rounded-lg"
              >
                <div className={`${category.color} text-foreground px-4 py-3 flex justify-between items-center`}>
                  <h2 className="text-lg font-bold">{category.name}</h2>
                  <span className="bg-faint px-2 py-1 rounded-full text-sm text-foreground">{category.count}</span>
                </div>
                <div className="p-0 max-h-64 overflow-y-auto"> {/* Added max-height and overflow */}
                  {category.problems.length > 0 ? (
                    <ul className="divide-y divide-divide">
                      {category.problems.map((problem: any, index: number) => (
                        <li key={index} className="p-4 hover:bg-surface-hover-alt transition duration-150 ease-in-out">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-foreground text-sm">{problem.name}</span>
                            <div className="flex items-center text-sm text-muted-foreground">
                              {<span className="material-icons mr-1" style={{ fontSize: '15px' }}>calendar_today</span>}
                              {new Date(problem.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No problems in this category</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemTypeInfo;