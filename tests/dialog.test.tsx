/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem, SelectItemText } from '@/components/ui/select';

function Example({ busy = false }: { busy?: boolean }) {
  const [open, setOpen] = React.useState(false);
  return <><Button onClick={() => setOpen(true)}>Launch</Button><Dialog open={open} onOpenChange={setOpen}>
    <DialogContent dismissible={!busy}><DialogTitle>Example form</DialogTitle><Input aria-label="Name" />
      <DialogClose asChild><Button disabled={busy}>Done</Button></DialogClose>
    </DialogContent>
  </Dialog></>;
}
async function launch() { const launcher = screen.getByRole('button', { name: 'Launch' }); act(() => launcher.focus()); fireEvent.click(launcher); await screen.findByRole('dialog', { name: 'Example form' }); return launcher; }
afterEach(cleanup);

it('removes closed dialog controls from the DOM and the keyboard order', () => {
  render(<Example />); expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
});
it('portals an accessibly named dialog, focuses its form, hides the background, and locks body scrolling', async () => {
  const { container } = render(<Example />); await launch();
  const dialog = screen.getByRole('dialog', { name: 'Example form' });
  expect(container).not.toContainElement(dialog); expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(screen.getByLabelText('Name')).toHaveFocus(); expect(container).toHaveAttribute('aria-hidden', 'true');
  expect(document.body).toHaveAttribute('data-scroll-locked');
});
it('traps forward and reverse Tab at the ends of a dialog', async () => {
  render(<Example />); await launch(); const first = screen.getByLabelText('Name'); const last = screen.getByRole('button', { name: 'Done' });
  act(() => last.focus()); fireEvent.keyDown(last, { key: 'Tab' }); expect(first).toHaveFocus();
  fireEvent.keyDown(first, { key: 'Tab', shiftKey: true }); expect(last).toHaveFocus();
});
it('dismisses with Escape once, restores the external launcher, and releases the body lock', async () => {
  render(<Example />); const launcher = await launch(); fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(launcher).toHaveFocus()); expect(document.body).not.toHaveAttribute('data-scroll-locked');
});
it('dismisses on a left pointer outside and restores focus', async () => {
  render(<Example />); const launcher = await launch(); await act(async () => {});
  fireEvent.pointerDown(document.body, { pointerType: 'mouse', button: 0 });
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(launcher).toHaveFocus());
});
it('does not dismiss while a form is busy', async () => {
  render(<Example busy />); await launch(); await act(async () => {});
  fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Escape' }); fireEvent.pointerDown(document.body, { pointerType: 'mouse', button: 0 });
  expect(screen.getByRole('dialog')).toBeInTheDocument(); expect(screen.getByRole('button', { name: 'Done' })).toBeDisabled();
});
it('retains native submission exactly once and keeps non-submit actions from submitting', async () => {
  const submit = jest.fn(event => event.preventDefault());
  render(<Dialog defaultOpen><DialogContent><DialogTitle>Form</DialogTitle><form onSubmit={submit}><Input aria-label="Entry" name="entry" required /><Button>Helper</Button><Button type="submit">Save</Button></form></DialogContent></Dialog>);
  fireEvent.click(screen.getByRole('button', { name: 'Helper' })); expect(submit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Entry'), { target: { value: 'Graphs' } }); fireEvent.click(screen.getByRole('button', { name: 'Save' })); expect(submit).toHaveBeenCalledTimes(1);
});
it('dismisses a portalled select before its parent dialog and restores both focus levels', async () => {
  render(<Dialog defaultOpen><DialogContent><DialogTitle>Choose</DialogTitle><Select defaultValue="one"><SelectTrigger aria-label="Choice"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one"><SelectItemText>One</SelectItemText></SelectItem><SelectItem value="two"><SelectItemText>Two</SelectItemText></SelectItem></SelectContent></Select></DialogContent></Dialog>);
  const trigger = screen.getByRole('combobox'); fireEvent.keyDown(trigger, { key: 'Enter' });
  const list = await screen.findByRole('listbox'); fireEvent.keyDown(list, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument()); expect(screen.getByRole('dialog')).toBeInTheDocument(); await waitFor(() => expect(trigger).toHaveFocus());
});
it('keeps the parent open when a nested dialog is dismissed and restores its launcher', async () => {
  render(<Dialog defaultOpen><DialogContent><DialogTitle>Parent</DialogTitle><Dialog><DialogTrigger asChild><Button>Nested</Button></DialogTrigger><DialogContent><DialogTitle>Child</DialogTitle><Button>Child action</Button></DialogContent></Dialog></DialogContent></Dialog>);
  const launcher=screen.getByRole('button', { name: 'Nested' }); act(() => launcher.focus()); fireEvent.click(launcher);
  fireEvent.keyDown(await screen.findByRole('dialog', { name: 'Child' }), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Child' })).not.toBeInTheDocument()); expect(screen.getByRole('dialog', { name: 'Parent' })).toBeInTheDocument(); await waitFor(() => expect(launcher).toHaveFocus());
});
it('puts the safe cancel action first in destructive confirmations and ignores backdrop clicks', async () => {
  const close = jest.fn(), confirm = jest.fn();
  render(<ConfirmationDialog open onClose={close} title="Delete collection" onConfirm={confirm}>Delete Graphs and all its problems?</ConfirmationDialog>);
  const dialog=screen.getByRole('alertdialog', { name: 'Delete collection' });
  expect(dialog).toHaveAccessibleDescription('Delete Graphs and all its problems?');
  expect(screen.getByRole('button', { name: 'Close dialog' })).toHaveFocus();
  fireEvent.pointerDown(document.body, { pointerType: 'mouse', button: 0 }); expect(close).not.toHaveBeenCalled(); expect(confirm).not.toHaveBeenCalled();
  fireEvent.keyDown(dialog, { key: 'Escape' }); expect(close).toHaveBeenCalledTimes(1);
});
it('keeps async confirmations open on failure and prevents repeated actions while busy', () => {
  const confirm=jest.fn(), close=jest.fn(); const { rerender }=render(<ConfirmationDialog open title="Delete problem" onClose={close} onConfirm={confirm}>Permanent action</ConfirmationDialog>);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' })); expect(confirm).toHaveBeenCalledTimes(1); expect(close).not.toHaveBeenCalled(); expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  rerender(<ConfirmationDialog open busy title="Delete problem" onClose={close} onConfirm={confirm}>Permanent action</ConfirmationDialog>);
  fireEvent.click(screen.getByRole('button', { name: 'Deleting...' })); fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' }); expect(confirm).toHaveBeenCalledTimes(1); expect(close).not.toHaveBeenCalled(); expect(screen.getByRole('button', { name: 'Close dialog' })).toBeDisabled();
});
it('restores focus to the page when a successful deletion removes its launcher', async () => {
  function Deletion() {const [open,setOpen]=React.useState(false),[exists,setExists]=React.useState(true);return <main data-dialog-focus-fallback>{exists&&<Button onClick={()=>setOpen(true)}>Launch</Button>}<ConfirmationDialog open={open} onClose={()=>setOpen(false)} title="Delete item" onConfirm={()=>{setExists(false);setOpen(false);}}>Permanent</ConfirmationDialog></main>;}
  render(<Deletion />); const launcher=screen.getByRole('button',{name:'Launch'});act(()=>launcher.focus());fireEvent.click(launcher);fireEvent.click(screen.getByRole('button',{name:'Delete'}));await waitFor(()=>expect(screen.getByRole('main')).toHaveFocus());
});
it('releases focus guards and scroll locks when an open dialog is unmounted', async () => {
  const { unmount }=render(<Example />); await launch(); unmount(); await waitFor(()=>expect(document.body).not.toHaveAttribute('data-scroll-locked')); expect(document.querySelector('[data-radix-focus-guard]')).not.toBeInTheDocument();
});

it('reveals keyboard focus inside a long dialog without scrolling the background page', () => {
  render(<Dialog defaultOpen><DialogContent><DialogTitle>Long form</DialogTitle><div data-testid="scroll-panel" style={{ overflowY:'auto', maxHeight:200 }}><Input aria-label="First"/><Button>Last action</Button></div></DialogContent></Dialog>);
  const panel=screen.getByTestId('scroll-panel');const first=screen.getByLabelText('First');const last=screen.getByRole('button',{name:'Last action'});
  Object.defineProperties(panel,{clientHeight:{value:200},scrollHeight:{value:700}});
  const rect=(top:number,bottom:number)=>({top,bottom,left:0,right:100,width:100,height:bottom-top,x:0,y:top,toJSON(){return this;}});
  jest.spyOn(panel,'getBoundingClientRect').mockImplementation(()=>rect(100,300));
  jest.spyOn(last,'getBoundingClientRect').mockImplementation(()=>rect(450-panel.scrollTop,490-panel.scrollTop));
  jest.spyOn(first,'getBoundingClientRect').mockImplementation(()=>rect(100-panel.scrollTop,120-panel.scrollTop));
  const background=document.documentElement.scrollTop;
  act(()=>last.focus());expect(last).toHaveFocus();expect(last.getBoundingClientRect().bottom).toBeLessThanOrEqual(panel.getBoundingClientRect().bottom);
  act(()=>first.focus());expect(first.getBoundingClientRect().top).toBeGreaterThanOrEqual(panel.getBoundingClientRect().top);expect(document.documentElement.scrollTop).toBe(background);
});
