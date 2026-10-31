/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Toaster } from '@/components/ui/toast';
import { dismissToast, toast, useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

beforeEach(() => { jest.useFakeTimers(); act(() => dismissToast()); });
afterEach(() => { cleanup(); dismissToast(); jest.useRealTimers(); });
const visible = () => Array.from(document.querySelectorAll<HTMLElement>('li[data-swipe-direction]'));
const advance = (ms: number) => act(() => { jest.advanceTimersByTime(ms); });

it('shows notifications from multiple feature callers in one viewport, with live announcements', () => {
  render(<Toaster />); act(() => { toast('Saved settings'); toast('Created collection'); }); advance(100);
  expect(document.querySelectorAll('[data-toast-viewport]')).toHaveLength(1);
  expect(visible().map(item => item.textContent)).toEqual(['Saved settings', 'Created collection']);
  expect(screen.getAllByRole('status').some(item => item.getAttribute('aria-live') === 'assertive')).toBe(true);
});
it('keeps independent durations so an older timeout cannot hide a newer message', () => {
  render(<Toaster />); act(() => { toast('First', { duration: 3000 }); }); advance(2000);
  act(() => { toast('Second', { duration: 5000 }); }); advance(1100);
  expect(visible().map(item => item.textContent)).toEqual(['Second']); advance(4000); expect(visible()).toHaveLength(0);
});
it('pauses dismissal while the pointer is over notifications and resumes with the remaining time', () => {
  render(<Toaster />); act(() => { toast('Read me', { duration: 3000 }); }); advance(1000);
  const viewport=document.querySelector('[data-toast-viewport]')!;fireEvent.pointerMove(viewport);advance(5000);expect(visible()).toHaveLength(1);
  fireEvent(viewport.parentElement!, new Event('pointerleave'));  advance(2100); expect(visible()).toHaveLength(0);
});
it('pauses notifications while the window is unfocused', () => {
  render(<Toaster />); act(() => { toast('Saved', { duration: 3000 }); });advance(1000);fireEvent(window,new Event('blur'));advance(5000);expect(visible()).toHaveLength(1);fireEvent(window,new Event('focus'));advance(2100);expect(visible()).toHaveLength(0);
});
it('supports keyboard dismissal without invoking a feature action', () => {
  render(<Toaster />);act(()=>{toast('Notice');});const item=visible()[0];act(()=>item.focus());fireEvent.keyDown(item,{key:'Escape'});expect(visible()).toHaveLength(0);
});
it('bounds concurrent notifications and permits explicit individual dismissal', () => {
  render(<Toaster />);let second:ReturnType<typeof toast>;act(()=>{toast('One');second=toast('Two');toast('Three');toast('Four');});expect(visible().map(item=>item.textContent)).toEqual(['Two','Three','Four']);act(()=>second.dismiss());expect(visible().map(item=>item.textContent)).toEqual(['Three','Four']);
});
it('keeps a notification visible when its feature component unmounts', () => {
  function Feature(){const {toast:notify}=useToast(5000);return <Button onClick={()=>notify('Success')}>Save</Button>;}
  function Page(){const [show,setShow]=React.useState(true);return <>{show&&<Feature/>}<Button onClick={()=>setShow(false)}>Leave feature</Button><Toaster/></>;}
  render(<Page/>);fireEvent.click(screen.getByRole('button',{name:'Save'}));fireEvent.click(screen.getByRole('button',{name:'Leave feature'}));expect(visible()[0]).toHaveTextContent('Success');advance(5100);expect(visible()).toHaveLength(0);
});
it('allows a focused modal to publish feedback without moving focus', () => {
  function Modal(){const {toast:notify}=useToast();return <Dialog defaultOpen><DialogContent><DialogTitle>Settings</DialogTitle><Button onClick={()=>notify('Saved')}>Save settings</Button></DialogContent></Dialog>;}
  render(<><Modal/><Toaster/></>);const save=screen.getByRole('button',{name:'Save settings'});act(()=>save.focus());fireEvent.click(save);expect(save).toHaveFocus();expect(visible()[0]).toHaveTextContent('Saved');expect(screen.getByRole('dialog')).toBeInTheDocument();
});
it('remounts the viewport safely and cleans up expired notifications', () => {
  const first=render(<Toaster/>);act(()=>{toast('Notice',{duration:1000});});first.unmount();render(<Toaster/>);expect(visible()).toHaveLength(1);advance(1100);expect(visible()).toHaveLength(0);
});
