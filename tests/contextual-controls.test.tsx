/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { HelpTooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

it('supports menu keyboard navigation, disabled actions, typeahead, Escape, and trigger restoration', async () => {
  const action=jest.fn();
  render(<DropdownMenu><DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem disabled onSelect={action}>Delete</DropdownMenuItem><DropdownMenuItem onSelect={action}>Edit</DropdownMenuItem><DropdownMenuItem onSelect={action}>Stats</DropdownMenuItem></DropdownMenuContent></DropdownMenu>);
  const trigger=screen.getByRole('button',{name:'Actions'});
  fireEvent.keyDown(trigger,{key:'ArrowDown'});
  const menu=await screen.findByRole('menu');
  expect(menu.parentElement?.parentElement).toBe(document.body);
  await waitFor(()=>expect(screen.getByRole('menuitem',{name:'Edit'})).toHaveFocus());
  fireEvent.keyDown(document.activeElement!,{key:'s'});
  await waitFor(()=>expect(screen.getByRole('menuitem',{name:'Stats'})).toHaveFocus());
  fireEvent.keyDown(document.activeElement!,{key:'Escape'});
  await waitFor(()=>expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();expect(action).not.toHaveBeenCalled();
  fireEvent.keyDown(trigger,{key:'ArrowDown'});
  fireEvent.click(await screen.findByRole('menuitem',{name:'Stats'}));
  expect(action).toHaveBeenCalledTimes(1);
});

it('hands focus from a menu to a dialog and restores its persistent menu trigger', async () => {
  function Fixture(){const[open,setOpen]=React.useState(false);return <><DropdownMenu><DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem onSelect={()=>setOpen(true)}>Edit</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogTitle>Edit fixture</DialogTitle><Button onClick={()=>setOpen(false)}>Close editor</Button></DialogContent></Dialog></>;}
  render(<Fixture/>);const trigger=screen.getByRole('button',{name:'Actions'});
  fireEvent.keyDown(trigger,{key:'ArrowDown'});fireEvent.click(await screen.findByRole('menuitem',{name:'Edit'}));
  const dialog=await screen.findByRole('dialog',{name:'Edit fixture'});
  await waitFor(()=>expect(dialog).toContainElement(document.activeElement as HTMLElement));
  expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Close editor'}));
  await waitFor(()=>expect(trigger).toHaveFocus());
});

it('keeps a popover in the active dialog layer, dismisses it first, and restores its trigger', async () => {
  render(<Dialog defaultOpen><DialogContent><DialogTitle>Sketch settings</DialogTitle><Popover><PopoverTrigger asChild><Button>Colors</Button></PopoverTrigger><PopoverContent aria-label="Color choices"><Button>Red</Button></PopoverContent></Popover></DialogContent></Dialog>);
  fireEvent.click(screen.getByRole('button',{name:'Colors'}));
  const popup=screen.getByRole('dialog',{name:'Color choices'});
  expect(within(popup).getByRole('button',{name:'Red'})).toHaveFocus();
  fireEvent.keyDown(document.activeElement!,{key:'Escape'});
  await waitFor(()=>expect(screen.queryByRole('dialog',{name:'Color choices'})).not.toBeInTheDocument());
  expect(screen.getByRole('dialog',{name:'Sketch settings'})).toBeInTheDocument();
  expect(screen.getByRole('button',{name:'Colors'})).toHaveFocus();
});

it('dismisses a popover on outside interaction without activating a hidden popup control', async () => {
  const action=jest.fn();
  render(<><Button>Outside</Button><Popover><PopoverTrigger asChild><Button>Colors</Button></PopoverTrigger><PopoverContent aria-label="Color choices"><Button onClick={action}>Red</Button></PopoverContent></Popover></>);
  expect(screen.queryByRole('button',{name:'Red'})).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Colors'}));
  await act(async()=>{});fireEvent.pointerDown(screen.getByRole('button',{name:'Outside'}),{pointerType:'mouse',button:0});
  await waitFor(()=>expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(action).not.toHaveBeenCalled();
});

it('exposes help on keyboard focus, associates its description, and dismisses with Escape', async () => {
  render(<HelpTooltip content="Reset the review interval"><Button aria-label="About lapses">?</Button></HelpTooltip>);
  const trigger=screen.getByRole('button',{name:'About lapses'});
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  act(()=>trigger.focus());
  const tooltip=await screen.findByRole('tooltip');
  expect(tooltip).toHaveTextContent('Reset the review interval');
  expect(trigger).toHaveAccessibleDescription('Reset the review interval');
  fireEvent.keyDown(trigger,{key:'Escape'});
  await waitFor(()=>expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  expect(trigger).toHaveFocus();
});
