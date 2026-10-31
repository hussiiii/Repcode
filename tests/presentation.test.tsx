/** @jest-environment jsdom */
import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { LoadingState } from '@/components/ui/loading-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

it('composes cards without changing link semantics, content order, or refs', () => {
  const ref=React.createRef<HTMLDivElement>();render(<Card ref={ref} asChild><article aria-label="Collection"><CardHeader><CardTitle>Graphs</CardTitle><CardDescription>Three problems</CardDescription></CardHeader><CardContent><a href="/app/collections/1">Open collection</a></CardContent><CardFooter>Updated today</CardFooter></article></Card>);
  expect(ref.current?.tagName).toBe('ARTICLE');expect(screen.getByRole('heading',{name:'Graphs'})).toBeInTheDocument();expect(screen.getByRole('link',{name:'Open collection'})).toHaveAttribute('href','/app/collections/1');
});
it('composes domain badges from generic badge presentation while preserving slotted link semantics', () => {
  render(<><DifficultyBadge value="Easy"/><StudyStateBadge value="Review"/><Badge variant="meta" asChild><a href="/changelog">v2.27</a></Badge></>);expect(screen.getByText('Easy')).toBeVisible();expect(screen.getByText('Review')).toBeVisible();expect(screen.getByRole('link',{name:'v2.27'})).toHaveAttribute('href','/changelog');
});
it('exposes semantic separators only when requested, including vertical orientation', () => {
  render(<><Separator/><Separator decorative={false} orientation="vertical" aria-label="Tools"/></>);expect(screen.getAllByRole('separator')).toHaveLength(1);expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation','vertical');
});
it('uses avatar fallback content until an image loads and after an error', async () => {
  const images: HTMLImageElement[]=[];const Original=window.Image;
  Object.defineProperty(window,'Image',{configurable:true,writable:true,value:class extends Original {constructor(){super();images.push(this);}}});
  try {
    const {rerender}=render(<Avatar><AvatarImage src="/fixture.png" alt="Test account"/><AvatarFallback role="img" aria-label="Account initials">T</AvatarFallback></Avatar>);
    expect(screen.getByRole('img',{name:'Account initials'})).toBeVisible();act(()=>{Object.defineProperties(images[0],{complete:{value:true},naturalWidth:{value:100}});images[0].dispatchEvent(new Event('load'));});await waitFor(()=>expect(screen.getByRole('img',{name:'Test account'})).toBeVisible());expect(screen.queryByText('T')).not.toBeInTheDocument();
    rerender(<Avatar><AvatarImage src="/broken.png" alt="Test account"/><AvatarFallback role="img" aria-label="Account initials">T</AvatarFallback></Avatar>);act(()=>images[1].dispatchEvent(new Event('error')));await waitFor(()=>expect(screen.getByRole('img',{name:'Account initials'})).toBeVisible());
  }finally{Object.defineProperty(window,'Image',{configurable:true,writable:true,value:Original});}
});
it('announces errors and success with the requested urgency without changing their text', () => {
  render(<><Alert><AlertTitle>Save failed</AlertTitle><AlertDescription>Try again.</AlertDescription></Alert><Alert variant="marketingSuccess" role="status">Saved</Alert></>);expect(screen.getByRole('alert')).toHaveTextContent('Save failedTry again.');expect(screen.getByRole('status')).toHaveTextContent('Saved');
});
it('keeps decorative spinners silent and standalone loading states named', () => {
  render(<><Spinner/><Spinner label="Importing problems"/><LoadingState/><LoadingState variant="calendar"/></>);expect(screen.getByRole('status',{name:'Importing problems'})).toBeInTheDocument();expect(screen.getByRole('status',{name:'Loading'})).toBeInTheDocument();expect(screen.getByText('Loading calendar...')).toBeInTheDocument();
});
it('hides decorative skeletons and announces the real thinking message', () => {
  const {container}=render(<><Skeleton className="h-8 w-24"/><Skeleton variant="thinking">AI is thinking...</Skeleton></>);expect(container.firstChild).toHaveAttribute('aria-hidden','true');expect(screen.getByRole('status')).toHaveTextContent('AI is thinking...');
});
it('retains actionable empty-state content and its accessible heading', () => {
  const action=jest.fn();render(<Empty><EmptyHeader><EmptyTitle>No collections yet</EmptyTitle><EmptyDescription>Create one to start.</EmptyDescription><button onClick={action}>Create collection</button></EmptyHeader></Empty>);expect(screen.getByRole('status')).toHaveTextContent('No collections yet');fireEvent.click(screen.getByRole('button',{name:'Create collection'}));expect(action).toHaveBeenCalledTimes(1);
});
