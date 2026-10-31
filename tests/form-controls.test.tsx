/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NativeSelect } from '@/components/ui/native-select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectItemText } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

it('connects labels, descriptions and errors to controls without a form library', () => {
  const ref = React.createRef<HTMLInputElement>();
  render(<Field controlId="name" invalid><FieldLabel>Name</FieldLabel><Input ref={ref} name="name" aria-describedby="extra" /><FieldDescription>Use a short name.</FieldDescription><FieldError>A name is required.</FieldError><span id="extra">Extra help</span></Field>);
  const input = screen.getByRole('textbox', { name: 'Name' });
  expect(ref.current).toBe(input);
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('Extra help Use a short name. A name is required.');
  expect(screen.getByRole('alert')).toHaveTextContent('A name is required.');
});

it('assigns unique field IDs and removes descriptions when they are no longer rendered', () => {
  const { rerender } = render(<><Field><FieldLabel>First</FieldLabel><Input /><FieldDescription>Help</FieldDescription></Field><Field><FieldLabel>Second</FieldLabel><Input /></Field></>);
  expect(screen.getByLabelText('First').id).not.toBe(screen.getByLabelText('Second').id);
  rerender(<Field><FieldLabel>First</FieldLabel><Input /></Field>);
  expect(screen.getByLabelText('First')).not.toHaveAttribute('aria-describedby');
});

it('retains native input constraints, values, names and textarea rows in form submissions', () => {
  const area = React.createRef<HTMLTextAreaElement>();
  const { container } = render(<form><Input type="email" name="email" required defaultValue="invalid" aria-label="Email" /><Input type="number" name="count" min={1} max={10} step={1} defaultValue={2} /><Textarea ref={area} name="notes" rows={5} defaultValue="Notes" aria-label="Notes" /></form>);
  const email = screen.getByRole('textbox', { name: 'Email' }) as HTMLInputElement;
  expect(email.checkValidity()).toBe(false);
  fireEvent.change(email, { target: { value: 'person@example.test' } });
  fireEvent.change(area.current!, { target: { value: 'Updated notes' } });
  expect(email.checkValidity()).toBe(true);
  const data = new FormData(container.querySelector('form')!);
  expect(Object.fromEntries(data)).toEqual({ email: 'person@example.test', count: '2', notes: 'Updated notes' });
  expect(area.current).toHaveAttribute('rows', '5');
});

it('preserves controlled inputs and native disabled/read-only behavior', () => {
  const change = jest.fn();
  const { rerender, container } = render(<form><Input name="locked" value="Locked" readOnly /><Textarea name="disabled" disabled defaultValue="Excluded" /><Input value="Before" onChange={change} aria-label="Controlled" /></form>);
  fireEvent.change(screen.getByLabelText('Controlled'), { target: { value: 'After' } });
  expect(change).toHaveBeenCalledTimes(1);
  expect(new FormData(container.querySelector('form')!).get('disabled')).toBeNull();
  rerender(<Input value="After" onChange={change} aria-label="Controlled" />);
  expect(screen.getByLabelText('Controlled')).toHaveValue('After');
});

it('preserves native select options, change events, labels and form values', () => {
  const change = jest.fn(); const ref = React.createRef<HTMLSelectElement>();
  const { container } = render(<form><Field controlId="language"><FieldLabel>Language</FieldLabel><NativeSelect ref={ref} name="language" defaultValue="python" onChange={change}><option value="python">Python</option><option value="java">Java</option><option disabled value="cpp">C++</option></NativeSelect></Field></form>);
  fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'java' } });
  expect(change).toHaveBeenCalledTimes(1);
  expect(ref.current).toHaveValue('java');
  expect(new FormData(container.querySelector('form')!).get('language')).toBe('java');
});

it('toggles a Radix checkbox once per click and submits exactly one native form value', () => {
  const change = jest.fn();
  const { container } = render(<form><Label htmlFor="collection">Algorithms</Label><Checkbox id="collection" name="collection" value="one" onCheckedChange={change} /></form>);
  const checkbox = screen.getByRole('checkbox', { name: 'Algorithms' });
  fireEvent.click(checkbox);
  expect(checkbox).toBeChecked();
  expect(change).toHaveBeenCalledTimes(1);
  expect(new FormData(container.querySelector('form')!).getAll('collection')).toEqual(['one']);
  fireEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
  expect(change).toHaveBeenCalledTimes(2);
  expect(new FormData(container.querySelector('form')!).getAll('collection')).toEqual([]);
});

it('supports controlled, disabled and indeterminate checkbox states', () => {
  const change = jest.fn();
  const ref = React.createRef<HTMLInputElement>();
  const { rerender } = render(<Checkbox ref={ref} aria-label="Collection" checked="indeterminate" onCheckedChange={change} />);
  expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed');
  expect(ref.current!.indeterminate).toBe(true);
  rerender(<Checkbox aria-label="Collection" checked disabled onCheckedChange={change} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole('checkbox')).toBeChecked();
});

it('selects radio values with the keyboard and keeps a single form value', async () => {
  const change = jest.fn();
  const { container } = render(<form><Field controlId="difficulty"><FieldLabel>Difficulty</FieldLabel><RadioGroup name="difficulty" defaultValue="Easy" onValueChange={change} orientation="horizontal"><RadioGroupItem value="Easy" variant="pill">Easy</RadioGroupItem><RadioGroupItem value="Medium" variant="pill">Medium</RadioGroupItem></RadioGroup></Field></form>);
  const easy = screen.getByRole('radio', { name: 'Easy' });
  act(() => easy.focus());
  fireEvent.keyDown(easy, { key: 'ArrowRight' });
  await waitFor(() => expect(screen.getByRole('radio', { name: 'Medium' })).toHaveAttribute('aria-checked', 'true'));
  expect(change).toHaveBeenLastCalledWith('Medium');
  expect(new FormData(container.querySelector('form')!).getAll('difficulty')).toEqual(['Medium']);
});

it('keeps radio selection from submitting a surrounding form', () => {
  const submit = jest.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><RadioGroup defaultValue="Easy"><RadioGroupItem variant="pill" value="Easy">Easy</RadioGroupItem><RadioGroupItem variant="pill" value="Hard">Hard</RadioGroupItem></RadioGroup></form>);
  fireEvent.click(screen.getByRole('radio', { name: 'Hard' }));
  expect(submit).not.toHaveBeenCalled();
});

it('supports slider keyboard increments, bounds and form values', () => {
  const change = jest.fn();
  const { container } = render(<form><Slider aria-label="Stroke width" name="width" min={1} max={10} step={1} defaultValue={[2]} onValueChange={change} /></form>);
  const slider = screen.getByRole('slider', { name: 'Stroke width' });
  act(() => slider.focus()); fireEvent.keyDown(slider, { key: 'ArrowRight' });
  expect(slider).toHaveAttribute('aria-valuenow', '3');
  expect(change).toHaveBeenLastCalledWith([3]);
  fireEvent.keyDown(slider, { key: 'End' }); expect(slider).toHaveAttribute('aria-valuenow', '10');
  fireEvent.keyDown(slider, { key: 'Home' }); expect(slider).toHaveAttribute('aria-valuenow', '1');
  expect(new FormData(container.querySelector('form')!).get('width')).toBe('1');
});

it('leaves disabled sliders unchanged', () => {
  const change = jest.fn();
  render(<Slider aria-label="Stroke width" defaultValue={[2]} min={1} max={10} disabled onValueChange={change} />);
  fireEvent.keyDown(screen.getByRole('slider'), { key: 'End' });
  expect(change).not.toHaveBeenCalled();
});

it('opens a custom select by keyboard, selects an option, restores focus and submits its value', async () => {
  const change = jest.fn();
  const { container } = render(<form><Select name="chart" defaultValue="collection" onValueChange={change}><SelectTrigger aria-label="Chart type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="collection"><SelectItemText>By Collection</SelectItemText></SelectItem><SelectItem value="interval"><SelectItemText>By Interval</SelectItemText></SelectItem></SelectContent></Select></form>);
  const trigger = screen.getByRole('combobox', { name: 'Chart type' });
  act(() => trigger.focus()); fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  const option = await screen.findByRole('option', { name: 'By Interval' });
  act(() => option.focus()); fireEvent.keyDown(option, { key: 'Enter' });
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  expect(change).toHaveBeenLastCalledWith('interval');
  expect(new FormData(container.querySelector('form')!).get('chart')).toBe('interval');
  await waitFor(() => expect(trigger).toHaveFocus());
});

it('closes custom selects with Escape without changing their value or submitting', async () => {
  const change = jest.fn(); const submit = jest.fn(event => event.preventDefault());
  render(<form onSubmit={submit}><Select defaultValue="one" onValueChange={change}><SelectTrigger aria-label="Choice"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="one"><SelectItemText>One</SelectItemText></SelectItem></SelectContent></Select><Button type="submit">Submit</Button></form>);
  fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });
  fireEvent.keyDown(await screen.findByRole('listbox'), { key: 'Escape' });
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false'));
  expect(change).not.toHaveBeenCalled(); expect(submit).not.toHaveBeenCalled();
});


it('bubbles one named form-change event for a checkbox selection', () => {
  const changes: string[] = [];
  render(<form onChange={event => changes.push((event.target as HTMLInputElement).name)}><Checkbox name="collection" value="one" aria-label="Collection" /></form>);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Collection' }));
  expect(changes).toEqual(['collection']);
});
