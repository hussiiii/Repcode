import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading } from '@/components/ui/typography';
import { Empty } from '@/components/ui/empty';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { LoadingState } from '@/components/ui/loading-state';
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

  if (error) return <Alert variant="plain">Error: {(error as Error).message}</Alert>;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingState variant="legacy" />
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
              <Card surface="page" radius="lg" elevation="none" key={category.name}
                className="overflow-hidden">
                <div className={`${category.color} text-foreground px-4 py-3 flex justify-between items-center`}>
                  <Heading as="h2" size="lg" weight="bold">{category.name}</Heading>
                  <Badge variant="count" size="count" >{category.count}</Badge>
                </div>
                <ScrollArea direction="both" className="p-0 max-h-64"> {/* Added max-height and overflow */}
                  {category.problems.length > 0 ? (
                    <ul className="divide-y divide-border">
                      {category.problems.map((problem: any, index: number) => (
                        <li key={index} className="p-4 hover:bg-accent transition duration-150 ease-in-out">
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
                    <Empty variant="category">No problems in this category</Empty>
                  )}
                </ScrollArea>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemTypeInfo;
