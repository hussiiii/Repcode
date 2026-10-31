/** @jest-environment jsdom */
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider, setLogger } from 'react-query';
import { authenticatedFetch } from '@/lib/authenticatedFetch';
import CollectionModal from '@/components/app/CollectionModal';
import CollectionCards from '@/components/app/CollectionCards';
import ProblemModal from '@/components/app/ProblemModal';
import ProblemsList from '@/components/app/ProblemsList';
import ImportModal from '@/components/app/ImportModal';
import ProblemStatsModal from '@/components/app/ProblemStatsModal';
import RandomProblemModal from '@/components/app/RandomProblemModal';
import FirstTimeLogin from '@/components/app/FirstTimeLogin';
import VideoModal from '@/components/app/VideoModal';
import ReportBugModal from '@/components/app/ReportBugModal';
import { Toaster } from '@/components/ui/toast';
import { dismissToast } from '@/components/ui/use-toast';

const email='dialogs@example.test';
const mockGetToken=jest.fn(); const mockPush=jest.fn(); const mockSend=jest.fn(); const mockReset=jest.fn();
let mockFormState={succeeded:false,submitting:false,errors:null as unknown};
jest.mock('@/firebaseConfig',()=>({auth:{currentUser:{getIdToken:()=>mockGetToken()}}}));
jest.mock('@/auth/AuthContext',()=>({AuthContext:require('react').createContext({user:{email:'dialogs@example.test'}})}));
jest.mock('@/auth/useAuth',()=>({useAuth:()=>({user:{email:'dialogs@example.test'}})}));
jest.mock('@/lib/authenticatedFetch',()=>({authenticatedFetch:jest.fn()}));
jest.mock('next/router',()=>({useRouter:()=>({query:{collectionId:'1'},push:(...args:any[])=>mockPush(...args)})}));
jest.mock('@formspree/react',()=>({useForm:()=>[mockFormState,mockSend,mockReset]}));
jest.mock('chart.js',()=>({Chart:{register:jest.fn()}}));
jest.mock('react-chartjs-2',()=>({Doughnut:()=> <div>Feedback chart</div>}));
const problem={id:1,collectionId:1,name:'Two Sum',difficulty:'Easy',type:'Review',question:'Find two numbers',solution:'return [0, 1]',notes:'Use a map',language:'python',functionSignature:'',link:'',interval:1440,relearnInterval:10,ease:2.5,lapses:1,creationDate:'2026-10-01T00:00:00Z',dueDate:'2026-10-28T00:00:00Z',againCount:1,hardCount:0,goodCount:2,easyCount:3};
const collections=[{id:1,title:'Algorithms',newCount:1,learningCount:0,reviewCount:1,problems:[problem]},{id:2,title:'Graphs',newCount:0,learningCount:1,reviewCount:0,problems:[]}];
const settings={id:9,membershipType:'lifetime',collections,hasApiKey:true};
const request=authenticatedFetch as jest.Mock;
const clients:QueryClient[]=[];
const ok=(data:any={})=>({ok:true,json:async()=>data});
function makeClient(){const client=new QueryClient({defaultOptions:{queries:{retry:false,staleTime:Infinity,cacheTime:Infinity,refetchOnWindowFocus:false},mutations:{retry:false}}});clients.push(client);for(const[key,data]of [
 [['userSettings',email],settings],[['collections',email],collections],[['userCollections',email],collections],[['collectionDetails',1],collections[0]],[['collectionDetails',1,9],[problem]],[['collectionProblems',1,9],[problem]],[['problemCount',1],1],
] as const)client.setQueryData(key,data);return client;}
function mount(ui:React.ReactElement){const client=makeClient();const wrap=(content:React.ReactElement)=><QueryClientProvider client={client}><main data-dialog-focus-fallback>{content}</main><Toaster/></QueryClientProvider>;const view=render(wrap(ui));return {...view,client,rerender:(next:React.ReactElement)=>view.rerender(wrap(next))};}
function Controlled({Component,close,...props}:any){const[open,setOpen]=React.useState(true);return <Component {...props} isOpen={open} onClose={()=>{close();setOpen(false);}}/>;}
const writes=(url:string)=>request.mock.calls.filter(([path,options])=>path===url&&options?.method&&options.method!=='GET');
const notices=()=>Array.from(document.querySelectorAll('li[data-swipe-direction]')).map(item=>item.textContent).join(' ');
async function rowMenu(action:'Delete'|'Move'|'Edit'|'Stats'){fireEvent.keyDown(screen.getByRole('button',{name:'Actions for Two Sum'}),{key:'ArrowDown'});fireEvent.click(await screen.findByRole('menuitem',{name:new RegExp(action)}));}
beforeAll(()=>{
 setLogger({log:console.log,warn:console.warn,error:()=>{}});
 const css=fs.readFileSync(path.join(process.cwd(),'src/styles/globals.css'),'utf8');
 const style=document.createElement('style');style.textContent=`:root {${css.match(/:root\s*\{([\s\S]*?)\n  \}/)?.[1]||''}}`;document.head.append(style);
});
afterAll(()=>setLogger(console));
beforeEach(()=>{mockGetToken.mockResolvedValue('fixture-token');mockFormState={succeeded:false,submitting:false,errors:null};request.mockImplementation(async(url:string,options?:RequestInit)=>{
 if(!options?.method||options.method==='GET'){
  if(url.startsWith('/api/getUserSettings'))return ok(settings);
  if(url.startsWith('/api/getUserCollections'))return ok(collections);
  if(url.startsWith('/api/getCollectionProblems'))return ok([problem]);
  if(url.startsWith('/api/getCollectionDetails'))return ok(collections[0]);
  throw new Error('Unexpected fixture GET '+url);
 }
 if(['/api/createCollection','/api/updateCollection?collectionId=1','/api/createProblem','/api/updateProblem?problemId=1','/api/updateCollectionCounts','/api/updateStreak','/api/deleteCollection?collectionId=1','/api/deleteProblem?problemId=1','/api/moveProblem','/api/importFromLeetcode','/api/manualLapse'].includes(url))return ok(problem);
 throw new Error('Unexpected fixture mutation '+url);
});});
afterEach(()=>{cleanup();clients.splice(0).forEach(client=>client.clear());dismissToast();jest.useRealTimers();});

it('creates a collection once through its native form and closes only after success',async()=>{
 const close=jest.fn();mount(<Controlled Component={CollectionModal} close={close}/>);const input=screen.getByRole('textbox');expect(input).toHaveFocus();fireEvent.change(input,{target:{value:'Trees'}});fireEvent.submit(input.closest('form')!);await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));expect(writes('/api/createCollection')).toHaveLength(1);expect(JSON.parse(writes('/api/createCollection')[0][1].body)).toEqual({title:'Trees',userEmail:email});expect(screen.queryByRole('dialog')).not.toBeInTheDocument();expect(notices()).toContain('Collection created successfully');
});
it('prevents duplicate submissions while awaiting the authentication token',async()=>{
 let resolve!:(token:string)=>void;mockGetToken.mockImplementationOnce(()=>new Promise<string>(done=>{resolve=done;}));const close=jest.fn();mount(<Controlled Component={CollectionModal} close={close}/>);const input=screen.getByRole('textbox');fireEvent.change(input,{target:{value:'Trees'}});const form=input.closest('form')!;fireEvent.submit(form);fireEvent.submit(form);expect(mockGetToken).toHaveBeenCalledTimes(1);expect(screen.getByRole('button',{name:'Creating...'})).toBeDisabled();fireEvent.keyDown(screen.getByRole('dialog'),{key:'Escape'});expect(close).not.toHaveBeenCalled();await act(async()=>resolve('fixture-token'));await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));expect(writes('/api/createCollection')).toHaveLength(1);
});
it('keeps collection edits and an actionable error when a request fails',async()=>{
 const error=jest.spyOn(console,'error').mockImplementation(()=>{});request.mockResolvedValueOnce({ok:false,json:async()=>({})});const close=jest.fn();mount(<Controlled Component={CollectionModal} close={close} isEditMode collectionToEdit={{id:1,title:'Algorithms'}}/>);const input=screen.getByRole('textbox');fireEvent.change(input,{target:{value:'Edited'}});fireEvent.submit(input.closest('form')!);await waitFor(()=>expect(notices()).toContain('Failed to submit collection'));expect(input).toHaveValue('Edited');expect(close).not.toHaveBeenCalled();expect(screen.getByRole('button',{name:'Update'})).toBeEnabled();error.mockRestore();
});
it('returns token failures to an editable form without sending a mutation',async()=>{
 const error=jest.spyOn(console,'error').mockImplementation(()=>{});mockGetToken.mockRejectedValueOnce(new Error('fixture token error'));mount(<CollectionModal isOpen onClose={jest.fn()}/>);const input=screen.getByRole('textbox');fireEvent.change(input,{target:{value:'Trees'}});fireEvent.submit(input.closest('form')!);await waitFor(()=>expect(notices()).toContain('Unable to submit'));expect(writes('/api/createCollection')).toHaveLength(0);expect(screen.getByRole('button',{name:'Create'})).toBeEnabled();expect(input).toHaveValue('Trees');error.mockRestore();
});
it('preserves the collection limit branch as an accessible, dismissible dialog',async()=>{
 const view=mount(<CollectionModal isOpen onClose={jest.fn()}/>);act(()=>view.client.setQueryData(['userSettings',email],{...settings,membershipType:'free',collections:[{}, {}, {}]}));await waitFor(()=>expect(screen.getByRole('dialog',{name:'Free Tier limit reached!'})).toBeInTheDocument());expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});
it('cancels collection deletion without a request, retains failures, and closes after a successful retry',async()=>{
 const error=jest.spyOn(console,'error').mockImplementation(()=>{});mount(<CollectionCards/>);fireEvent.click(screen.getByRole('button',{name:'Delete Algorithms'}));expect(screen.getByRole('alertdialog',{name:'Delete Collection'})).toHaveTextContent('Algorithms');fireEvent.click(screen.getByRole('button',{name:'Close dialog'}));expect(writes('/api/deleteCollection?collectionId=1')).toHaveLength(0);fireEvent.click(screen.getByRole('button',{name:'Delete Algorithms'}));request.mockResolvedValueOnce({ok:false,json:async()=>({})});fireEvent.click(screen.getByRole('button',{name:/^Delete$/}));await waitFor(()=>expect(notices()).toContain('Failed to delete collection'));expect(screen.getByRole('alertdialog')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/^Delete$/}));await waitFor(()=>expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());expect(writes('/api/deleteCollection?collectionId=1')).toHaveLength(2);error.mockRestore();
});
it('submits problem edits with the original fields and shows success after the dialog closes',async()=>{
 const close=jest.fn();mount(<Controlled Component={ProblemModal} close={close} isEditMode problemToEdit={problem} collectionId={1}/>);fireEvent.change(screen.getByRole('textbox',{name:/^Name/}),{target:{value:'Two Sum Edited'}});fireEvent.click(screen.getByRole('button',{name:'Update'}));await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));const call=writes('/api/updateProblem?problemId=1')[0];expect(call[1].method).toBe('PUT');expect(JSON.parse(call[1].body)).toEqual(expect.objectContaining({name:'Two Sum Edited',question:problem.question,solution:problem.solution,notes:problem.notes,collectionId:1}));expect(notices()).toContain('Problem updated successfully');
});
it('preserves problem deletion failure/retry and count refresh without dismissing early',async()=>{
 mount(<ProblemsList collectionId={1}/>);await rowMenu('Delete');expect(screen.getByRole('alertdialog')).toHaveTextContent('Two Sum');request.mockResolvedValueOnce({ok:false,json:async()=>({})});fireEvent.click(screen.getByRole('button',{name:/^Delete$/}));await waitFor(()=>expect(notices()).toContain('Failed to delete problem'));expect(screen.getByRole('alertdialog')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:/^Delete$/}));await waitFor(()=>expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());expect(writes('/api/deleteProblem?problemId=1')).toHaveLength(2);expect(writes('/api/updateCollectionCounts').some(([,options])=>JSON.parse(options.body).collectionId===1)).toBe(true);
});
it('keeps move validation, destination selection, payload, and source/target count refresh',async()=>{
 mount(<ProblemsList collectionId={1}/>);await rowMenu('Move');const dialog=screen.getByRole('dialog',{name:'Move Problem'});const move=within(dialog).getByRole('button',{name:'Move'});expect(move).toBeDisabled();const select=within(dialog).getByRole('combobox',{name:'Destination collection'});expect(within(select).queryByRole('option',{name:'Algorithms'})).not.toBeInTheDocument();fireEvent.change(select,{target:{value:'2'}});fireEvent.click(move);await waitFor(()=>expect(screen.queryByRole('dialog',{name:'Move Problem'})).not.toBeInTheDocument());expect(JSON.parse(writes('/api/moveProblem')[0][1].body)).toEqual({problemId:1,targetCollectionId:2});expect(writes('/api/updateCollectionCounts').map(([,options])=>JSON.parse(options.body).collectionId)).toEqual([1,2]);
});
it('imports once from its form and retains an error without losing the slug',async()=>{
 const error=jest.spyOn(console,'error').mockImplementation(()=>{});const close=jest.fn();mount(<Controlled Component={ImportModal} close={close} collectionId={1}/>);const input=screen.getByRole('textbox',{name:/Leetcode List Slug/});expect(input).toHaveFocus();fireEvent.change(input,{target:{value:' fixture-list '}});request.mockResolvedValueOnce({ok:false,json:async()=>({message:'Fixture import failed'})});fireEvent.submit(input.closest('form')!);await waitFor(()=>expect(notices()).toContain('Fixture import failed'));expect(input).toHaveValue(' fixture-list ');expect(close).not.toHaveBeenCalled();fireEvent.submit(input.closest('form')!);await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));expect(JSON.parse(writes('/api/importFromLeetcode')[1][1].body)).toEqual({slug:'fixture-list',collectionId:1});error.mockRestore();
});
it('keeps manual-lapse confirmation behavior, pending dismissal protection, and count refresh',async()=>{
 const close=jest.fn();mount(<Controlled Component={ProblemStatsModal} close={close} problem={problem}/>);fireEvent.click(screen.getByRole('button',{name:'Lapse Manually'}));await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));expect(JSON.parse(writes('/api/manualLapse')[0][1].body)).toEqual({problemId:1});expect(JSON.parse(writes('/api/updateCollectionCounts')[0][1].body)).toEqual({collectionId:1});
});
it('navigates random selection from selected collections and closes without changing the destination',async()=>{
 const close=jest.fn();mount(<Controlled Component={RandomProblemModal} close={close}/>);fireEvent.click(screen.getByRole('button',{name:/^Solve$/}));await waitFor(()=>expect(mockPush).toHaveBeenCalledWith('/app/collections/1/problems/1'));expect(close).toHaveBeenCalledTimes(1);
});
it('retains onboarding choices and closes the video iframe through Escape',async()=>{
 const onboarding=mount(<FirstTimeLogin isOpen onClose={jest.fn()}/>);fireEvent.click(screen.getByRole('button',{name:/solved a few/}));expect(screen.getByRole('dialog',{name:'Welcome to Repcode!'})).toHaveTextContent('No worries!');onboarding.unmount();const close=jest.fn();mount(<Controlled Component={VideoModal} close={close} videoId="fixture-video"/>);expect(screen.getByTitle('YouTube video player')).toHaveAttribute('src','https://www.youtube.com/embed/fixture-video');fireEvent.keyDown(screen.getByRole('dialog',{name:'Video tutorial'}),{key:'Escape'});await waitFor(()=>expect(close).toHaveBeenCalledTimes(1));expect(screen.queryByTitle('YouTube video player')).not.toBeInTheDocument();
});
it('preserves bug-report data and removes the success-close timer on unmount',()=>{
 jest.useFakeTimers();const close=jest.fn();const view=mount(<ReportBugModal isOpen onClose={close}/>);const field=screen.getByRole('textbox',{name:/Bug Description/});fireEvent.change(field,{target:{value:'Fixture bug'}});fireEvent.submit(field.closest('form')!);expect(mockSend).toHaveBeenCalledWith({description:'Fixture bug',type:'bug',email});mockFormState={...mockFormState,succeeded:true};view.rerender(<ReportBugModal isOpen onClose={close}/>);expect(notices()).toContain('Bug report submitted');view.unmount();act(()=>jest.advanceTimersByTime(2100));expect(close).not.toHaveBeenCalled();
});
it('closes a successful bug report once using the latest callback and preserves its global notification',()=>{
 jest.useFakeTimers();const first=jest.fn(),latest=jest.fn();const view=mount(<ReportBugModal isOpen onClose={first}/>);mockFormState={...mockFormState,succeeded:true};view.rerender(<ReportBugModal isOpen onClose={first}/>);act(()=>jest.advanceTimersByTime(1000));view.rerender(<ReportBugModal isOpen onClose={latest}/>);act(()=>jest.advanceTimersByTime(1100));expect(first).not.toHaveBeenCalled();expect(latest).toHaveBeenCalledTimes(1);expect(notices()).toContain('Bug report submitted');
});
