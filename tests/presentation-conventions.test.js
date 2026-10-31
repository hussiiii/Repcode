/* eslint-env jest */
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.join(__dirname,'..');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const files=walk(path.join(root,'src')).filter(file=>file.endsWith('.tsx')&&!file.includes('/components/ui/'));
function scan(callback){for(const file of files){const sf=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(node){callback(node,sf,path.relative(root,file));ts.forEachChild(node,visit);}visit(sf);}}
function attribute(node,name){return node.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.text===name);}
function tag(node){return ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)?node.tagName.getText():null;}

it('centralizes every active modal overlay and removes window-wide modal key handlers',()=>{
 const remaining=[];scan((node,sf,file)=>{
  if(tag(node)==='div'){
   const value=attribute(node,'className')?.getText(sf)||'';
   if(/fixed inset-0.*bg-overlay|fixed top-1\/2.*left-1\/2/.test(value))remaining.push(file);
  }
  if(ts.isCallExpression(node)&&['window.confirm','confirm','window.alert','alert'].includes(node.expression.getText(sf)))remaining.push(file);
  if(/(?:Modal|FirstTimeLogin)\.tsx$/.test(file)&&ts.isCallExpression(node)&&node.expression.getText(sf).endsWith('.addEventListener')&&node.arguments[0]?.text==='keydown')remaining.push(file);
 });expect(remaining).toEqual([]);
});
it('accounts for all twelve migrated modal surfaces, including inline confirmations and the limit branch',()=>{
 const counts={};scan(node=>{const name=tag(node);if(['DialogContent','ConfirmationDialog'].includes(name)){const owner=node.getSourceFile().fileName.split('/').pop();counts[owner]=(counts[owner]||0)+1;}});
 expect(counts).toEqual({'CollectionModal.tsx':2,'ImportModal.tsx':1,'ReportBugModal.tsx':1,'RandomProblemModal.tsx':1,'ProblemModal.tsx':1,'ProblemStatsModal.tsx':1,'FirstTimeLogin.tsx':1,'CollectionCards.tsx':1,'ProblemsList.tsx':2,'VideoModal.tsx':1});
});
it('uses one app-wide toaster and removes feature-owned notification timers',()=>{
 const mounts=[],legacy=[];scan((node,sf,file)=>{
  if(tag(node)==='Toaster')mounts.push(file);
  if(tag(node)==='Toast')legacy.push(file);
  if(ts.isIdentifier(node)&&['setToastMessage','setIsToastVisible'].includes(node.text))legacy.push(file);
 });expect(mounts).toEqual(['src/pages/_app.tsx']);expect(legacy).toEqual([]);
});
it('keeps migrated card, badge, alert, dialog, avatar, and separator appearance in shared recipes',()=>{
 const migrated=new Set(['Card','CardHeader','CardTitle','CardDescription','Badge','DifficultyBadge','StudyStateBadge','Alert','Avatar','AvatarImage','AvatarFallback','Separator','DialogContent','DialogTitle','Empty','EmptyHeader','EmptyTitle','EmptyDescription','Spinner','Skeleton']);
 const invalid=[];scan((node,sf,file)=>{if(!migrated.has(tag(node)))return;
  // Domain mappings belong in this composition, while all its callers use the shared API.
  if(file==='src/components/app/ProblemBadges.tsx' && tag(node)==='Badge') return;
  const style=attribute(node,'style');if(style)invalid.push(file+': inline style');
  const c=attribute(node,'className');if(!c)return;
  if(!ts.isStringLiteral(c.initializer)){invalid.push(file+': dynamic styling');return;}
  for(const utility of c.initializer.text.split(/\s+/).filter(Boolean)){
   if(!/^(?:(?:sm|md|lg|xl):)*(?:sr-only$|(?:w|min-w|max-w|h|min-h|max-h|-?m[trblxy]?|top|bottom|left|right|inset|gap|space-[xy])-|flex$|flex-1$|flex-col$|flex-shrink-|items-|justify-|relative$|absolute$|overflow-|text-center$|text-left$|hidden$|block$|transform$|-translate-[xy]-|rotate-|flex-grow$|transition-width$|duration-300$)/.test(utility))invalid.push(file+': '+utility);
  }
 });expect(invalid).toEqual([]);
});
it('does not reintroduce scattered spinners, card surfaces, pill badges, or native horizontal rules',()=>{
 const remaining=[];scan((node,sf,file)=>{
  const name=tag(node);if(!name)return;
  if(name==='hr')remaining.push(file+': hr');
  if(!['div','span','svg'].includes(name))return;
  const a=attribute(node,'className');if(!a?.initializer||!ts.isStringLiteral(a.initializer))return;const c=a.initializer.text;
  if(c.includes('animate-spin'))remaining.push(file+': spinner');
  if(c.includes('rounded-xl')&&c.includes('shadow-lg')&&c.includes('bg-'))remaining.push(file+': card');
  if(c.includes('rounded-full')&&c.includes('text-xs font-medium')&&c.includes('inline-flex'))remaining.push(file+': badge');
 });expect(remaining).toEqual([]);
});
