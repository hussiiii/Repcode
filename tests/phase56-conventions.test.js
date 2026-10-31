/* eslint-env jest */
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.join(__dirname,'..');
const pkg=require('../package.json');
function source(file){return fs.readFileSync(path.join(root,file),'utf8');}
function fileList(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?fileList(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const appFiles=fileList(path.join(root,'src')).filter(file=>file.endsWith('.tsx')&&!file.includes('/components/ui/'));

it('removes all superseded menu and tooltip implementations and the old dependency',()=>{
 expect(pkg.dependencies['react-tooltip']).toBeUndefined();
 expect(source('src/styles/globals.css')).not.toContain('.react-tooltip');
 expect(source('src/styles/vendor-colors.css')).not.toContain('--rt-color-');
 for(const file of appFiles){const content=fs.readFileSync(file,'utf8');expect(content).not.toContain('react-tooltip');expect(content).not.toContain('data-tooltip-id');}
 for(const name of ['Problem.tsx','ProblemsQueue.tsx','ProblemsList.tsx']){
  const content=source('src/components/app/'+name);
  expect(content).not.toMatch(/isMoreMenuOpen|visibleMenuRef|moreMenuRef|menuRef|handleClickOutside|setVisibleMenuId\(prev/);
  expect(content).not.toMatch(/addEventListener\(['"](?:click|mousedown|mouseup)['"]/);
 }
});

it('connects all migrated contextual and workspace surfaces to shared primitives',()=>{
 const expected={
  'src/components/app/ProblemWorkspace.tsx':['DropdownMenu','Tabs','ResizablePanelGroup','ResizableHandle'],
  'src/components/app/ProblemsList.tsx':['DropdownMenu','DropdownMenuItem','HelpTooltip'],
  'src/components/app/WhiteBoard.tsx':['Popover','RadioGroup','ToggleGroup'],
  'src/components/app/SideBar.tsx':['HelpTooltip'],
  'src/components/app/StreakCalendar.tsx':['HelpTooltip'],
  'src/components/app/ProblemStatsModal.tsx':['HelpTooltip'],
  'src/components/app/CollectionCards.tsx':['HelpTooltip'],
  'src/components/app/ProblemsQueue.tsx':['ProblemWorkspace','HelpTooltip'],
  'src/components/app/Problem.tsx':['ProblemWorkspace'],
  'src/components/home/CodeEditorPreview.tsx':['Tabs','TabsTrigger'],
  'src/pages/app/study/dashboard.tsx':['Tabs','TabsTrigger'],
  'src/components/app/StatsCharts.tsx':['ToggleGroup','ToggleGroupItem'],
 };
 for(const[file,tags]of Object.entries(expected)){
  const sf=ts.createSourceFile(file,source(file),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const actual=new Set();function visit(node){if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))actual.add(node.tagName.getText(sf));ts.forEachChild(node,visit);}visit(sf);
  for(const tag of tags)expect(actual.has(tag)).toBe(true);
 }
});

it('keeps shared control appearance in recipes and has no deferred native-button exceptions',()=>{
 const styles=['bg-','text-','rounded-','shadow-','border-','px-','py-','p-'];
 const tags=new Set(['DropdownMenuContent','DropdownMenuItem','PopoverContent','TooltipContent','TabsTrigger','ToggleGroup','ToggleGroupItem','ResizableHandle']);
 const exceptions=[];
 for(const file of appFiles){const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(node){
  if((ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))&&tags.has(node.tagName.getText(sf))){
   const cls=node.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.text==='className');
   if(cls?.initializer){if(!ts.isStringLiteral(cls.initializer)||styles.some(token=>cls.initializer.text.split(/\s+/).some(part=>part.startsWith(token))))exceptions.push(file+': '+cls.getText(sf));}
  }ts.forEachChild(node,visit);}visit(sf);}
 expect(exceptions).toEqual([]);

});

it('uses shared tooltip behavior for every dashboard help bubble',()=>{
 const content=source('src/pages/app/study/dashboard.tsx');
 expect(content).not.toMatch(/group-hover:(?:opacity-100|visible)|cursor-help/);
 for(const name of ['About daily streaks','About estimated study time','About total reviews','About activity calendar']) expect(content).toContain(name);
});
