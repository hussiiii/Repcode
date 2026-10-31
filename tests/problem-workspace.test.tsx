/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import fs from 'node:fs';
import path from 'node:path';
import { ProblemWorkspace, type WorkspaceView } from '@/components/app/ProblemWorkspace';
import { Whiteboard } from '@/components/app/WhiteBoard';
import ChatWindow from '@/components/app/ChatWindow';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
jest.mock('@/lib/authenticatedFetch',()=>({authenticatedFetch:jest.fn()}));
jest.mock('react-markdown',()=>({__esModule:true,default:({children}:any)=><div>{children}</div>}));
jest.mock('remark-gfm',()=>({__esModule:true,default:()=>{}}));
const request=authenticatedFetch as jest.Mock;
const mounts:Record<string,number>={};
function Draft({name}:{name:string}){const[value,setValue]=React.useState('');React.useEffect(()=>{mounts[name]=(mounts[name]??0)+1;},[name]);return <input aria-label={name} value={value} onChange={e=>setValue(e.target.value)}/>;}
function Fixture({problemKey=1,chat=false}:{problemKey?:number;chat?:boolean}){const[view,setView]=React.useState<WorkspaceView>('question');return <ProblemWorkspace activeView={view} onViewChange={setView} problemKey={problemKey} onEdit={jest.fn()} onStats={jest.fn()} link="https://leetcode.com/problems/two-sum/" editor={<Draft name="Code draft"/>} renderView={value=>value==='whiteboard'?<Whiteboard active={view==='whiteboard'}/>:value==='ai-assistant'&&chat?<ChatWindow active={view==='ai-assistant'} problem={{id:problemKey,question:'Question',solution:'Solution'}} editorContent="Draft" hasApiKey/>:<Draft name={`${value} draft`}/>}/>;}
beforeEach(()=>{
  Object.keys(mounts).forEach(key=>delete mounts[key]);
  const context={clearRect:jest.fn(),beginPath:jest.fn(),moveTo:jest.fn(),lineTo:jest.fn(),stroke:jest.fn(),strokeRect:jest.fn(),setLineDash:jest.fn()};
  jest.spyOn(HTMLCanvasElement.prototype,'getContext').mockReturnValue(context as any);
  const style=document.createElement('style');style.textContent=':root {'+(fs.readFileSync(path.join(process.cwd(),'src/styles/globals.css'),'utf8').match(/:root\s*\{([\s\S]*?)\n  \}/)?.[1]??'')+'}';document.head.append(style);
});
async function ai(){fireEvent.keyDown(screen.getByRole('button',{name:'More'}),{key:'ArrowDown'});fireEvent.click(await screen.findByRole('menuitem',{name:'Repcode AI'}));}

it('preserves the editor DOM and each visited view’s draft, excluding hidden views from keyboard access',async()=>{
 render(<Fixture/>);const editor=screen.getByRole('textbox',{name:'Code draft'});fireEvent.change(editor,{target:{value:'Keep my code'}});
 expect(screen.queryByRole('textbox',{name:'notes draft'})).not.toBeInTheDocument();
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Notes'}),{button:0,ctrlKey:false});const notes=screen.getByRole('textbox',{name:'notes draft'});fireEvent.change(notes,{target:{value:'Keep my note'}});
 const panel=screen.getByRole('tabpanel');expect(panel).toHaveAccessibleName('Notes');panel.scrollTop=125;
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Description'}),{button:0,ctrlKey:false});expect(screen.queryByRole('textbox',{name:'notes draft'})).not.toBeInTheDocument();expect(notes).toBeInTheDocument();expect(notes.closest('[hidden]')).not.toBeNull();
 await ai();fireEvent.change(screen.getByRole('textbox',{name:'ai-assistant draft'}),{target:{value:'Keep my question'}});
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Notes'}),{button:0,ctrlKey:false});expect(screen.getByRole('textbox',{name:'notes draft'})).toBe(notes);expect(notes).toHaveValue('Keep my note');expect(screen.getByRole('tabpanel').scrollTop).toBe(125);
 await ai();expect(screen.getByRole('textbox',{name:'ai-assistant draft'})).toHaveValue('Keep my question');expect(screen.getByRole('textbox',{name:'Code draft'})).toBe(editor);expect(editor).toHaveValue('Keep my code');expect(mounts).toEqual({'Code draft':1,'question draft':1,'notes draft':1,'ai-assistant draft':1});
});

it('supports arrow-key tab selection and exposes a named keyboard resize separator',async()=>{
 render(<Fixture/>);const description=screen.getByRole('tab',{name:'Description'});act(()=>description.focus());fireEvent.keyDown(description,{key:'ArrowRight'});
 await waitFor(()=>expect(screen.getByRole('tab',{name:'Notes'})).toHaveAttribute('aria-selected','true'));
 expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Notes');
 const handle=screen.getByRole('separator',{name:'Resize problem and editor panels'});expect(handle).toHaveAttribute('aria-orientation','vertical');expect(handle).toHaveAttribute('tabindex','0');
});

it('retains sketch paths, history, tool, color, and width across views and scopes undo to the active sketch',async()=>{
 render(<Fixture/>);fireEvent.mouseDown(screen.getByRole('tab',{name:'Whiteboard'}),{button:0,ctrlKey:false});
 const canvas=document.querySelector('canvas')!;jest.spyOn(canvas,'getBoundingClientRect').mockReturnValue({x:0,y:0,left:0,top:0,right:300,bottom:150,width:300,height:150,toJSON:()=>({})});
 fireEvent.mouseDown(canvas,{clientX:10,clientY:10});fireEvent.mouseMove(canvas,{clientX:30,clientY:30});fireEvent.mouseUp(canvas);
 expect(screen.getByText(/Elements:/).parentElement).toHaveTextContent('Elements: 1');
 fireEvent.click(screen.getByRole('button',{name:'Choose ink color'}));fireEvent.click(screen.getByRole('radio',{name:'red'}));await waitFor(()=>expect(screen.queryByRole('dialog',{name:'Ink colors'})).not.toBeInTheDocument());
 fireEvent.keyDown(screen.getByRole('slider',{name:'Stroke width'}),{key:'End'});fireEvent.click(screen.getByRole('radio',{name:'Erase'}));
 const undo=screen.getByRole('button',{name:'Undo'});expect(undo).toBeEnabled();
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Description'}),{button:0,ctrlKey:false});const editor=screen.getByRole('textbox',{name:'Code draft'});fireEvent.keyDown(editor,{key:'z',ctrlKey:true});
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Whiteboard'}),{button:0,ctrlKey:false});expect(document.querySelector('canvas')).toBe(canvas);expect(screen.getByRole('radio',{name:'Erase'})).toHaveAttribute('aria-checked','true');expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow','10');expect(screen.getByText(/Elements:/).parentElement).toHaveTextContent('Elements: 1');
 fireEvent.click(screen.getByRole('button',{name:'Choose ink color'}));expect(screen.getByRole('radio',{name:'red'})).toHaveAttribute('aria-checked','true');fireEvent.keyDown(screen.getByRole('dialog',{name:'Ink colors'}),{key:'Escape'});
 fireEvent.click(undo);expect(screen.getByText(/Elements:/).parentElement).toHaveTextContent('Elements: 0');fireEvent.click(screen.getByRole('button',{name:'Redo'}));expect(screen.getByText(/Elements:/).parentElement).toHaveTextContent('Elements: 1');
});

it('keeps a chat request and unsent input alive while its view is hidden',async()=>{
 let finish!:(value:any)=>void;request.mockResolvedValueOnce({ok:true,json:async()=>({})});request.mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
 render(<Fixture chat/>);await ai();await screen.findByText('How can I help you with this problem?');
 const input=screen.getByPlaceholderText('Ask about your code...');fireEvent.change(input,{target:{value:'Explain the loop'}});fireEvent.submit(input.closest('form')!);await waitFor(()=>expect(request).toHaveBeenCalledTimes(2));
 fireEvent.mouseDown(screen.getByRole('tab',{name:'Description'}),{button:0,ctrlKey:false});
 await act(async()=>finish({ok:true,json:async()=>({message:'The loop visits each value once.'})}));await ai();expect(screen.getByText('The loop visits each value once.')).toBeInTheDocument();expect(screen.getByPlaceholderText('Ask about your code...')).toBe(input);fireEvent.change(input,{target:{value:'My next question'}});fireEvent.mouseDown(screen.getByRole('tab',{name:'Description'}),{button:0,ctrlKey:false});await ai();expect(input).toHaveValue('My next question');expect(request).toHaveBeenCalledTimes(2);
});

it('ignores an old problem’s AI response after its chat view is replaced',async()=>{
 let finishOld!:(value:any)=>void;
 request.mockImplementationOnce(()=>new Promise(resolve=>{finishOld=resolve;}));
 request.mockResolvedValueOnce({ok:true,json:async()=>({})});
 function ChatForProblem({id}:{id:number}){
  const[messages,setMessages]=React.useState<Array<{text:string,sender:string}>>([]);
  const[analyzing,setAnalyzing]=React.useState(true);
  return <ChatWindow key={id} active problem={{id,question:`Question ${id}`,solution:'Solution'}} editorContent="Draft" hasApiKey
   externalMessages={messages} setExternalMessages={setMessages} externalIsAnalyzing={analyzing} setExternalIsAnalyzing={setAnalyzing}/>;
 }
 const fixture=render(<ChatForProblem id={1}/>);
 await waitFor(()=>expect(request).toHaveBeenCalledTimes(1));
 fixture.rerender(<ChatForProblem id={2}/>);
 await waitFor(()=>expect(request).toHaveBeenCalledTimes(2));
 await screen.findByText('How can I help you with this problem?');
 await act(async()=>finishOld({ok:false,json:async()=>({})}));
 expect(screen.getByText('How can I help you with this problem?')).toBeInTheDocument();
 expect(screen.queryByText(/Failed to analyze your code/)).not.toBeInTheDocument();
});

it('resets view-local state for a different problem while retaining the editor instance',()=>{
 const view=render(<Fixture/>);const editor=screen.getByRole('textbox',{name:'Code draft'});fireEvent.mouseDown(screen.getByRole('tab',{name:'Notes'}),{button:0,ctrlKey:false});fireEvent.change(screen.getByRole('textbox',{name:'notes draft'}),{target:{value:'First problem'}});view.rerender(<Fixture problemKey={2}/>);expect(screen.getByRole('textbox',{name:'notes draft'})).toHaveValue('');expect(screen.getByRole('textbox',{name:'Code draft'})).toBe(editor);
});
