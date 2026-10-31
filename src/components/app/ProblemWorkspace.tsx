"use client";
import React, { useEffect, useState } from 'react';
import { ClipboardPen, NotepadText, PenSquare, Lightbulb, BotMessageSquare, Edit3, BarChart2, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export type WorkspaceView = 'question' | 'notes' | 'whiteboard' | 'solution' | 'ai-assistant';
const views = [
  { value: 'question', label: 'Description', Icon: ClipboardPen, color: 'text-editor-icon-description' },
  { value: 'notes', label: 'Notes', Icon: NotepadText, color: 'text-editor-icon-notes' },
  { value: 'whiteboard', label: 'Whiteboard', Icon: PenSquare, color: 'text-editor-icon-tools' },
  { value: 'solution', label: 'Solution', Icon: Lightbulb, color: 'text-editor-icon-solution' },
] as const;

// Mount a view on its first visit, then retain its DOM, scroll position, and local
// state. Hidden views leave the accessibility tree and keyboard navigation.
function WorkspaceViews({ activeView, renderView }: { activeView: string; renderView: (view: WorkspaceView) => React.ReactNode }) {
  const [visited, setVisited] = useState(() => new Set([activeView]));
  useEffect(() => { setVisited(previous => previous.has(activeView) ? previous : new Set([...Array.from(previous), activeView])); }, [activeView]);
  return <div className="flex-1 min-h-0">
    {([...views.map(view => view.value), 'ai-assistant'] as WorkspaceView[]).map(value => (visited.has(value) || activeView === value) && (
      <ScrollArea key={value} asChild direction="both" className="h-full">
      <TabsContent value={value} forceMount hidden={activeView !== value} {...(value === 'ai-assistant' ? { 'aria-label': 'Repcode AI', 'aria-labelledby': undefined } : {})}
        className="p-4 bg-background text-foreground">
        {renderView(value)}
      </TabsContent>
      </ScrollArea>
    ))}
  </div>;
}

export function ProblemWorkspace({ activeView, onViewChange, problemKey, renderView, editor, onEditorResize, onEdit, onStats, link }: {
  activeView: string; onViewChange: (value: WorkspaceView) => void; problemKey: string | number;
  renderView: (view: WorkspaceView) => React.ReactNode; editor: React.ReactNode; onEditorResize?: () => void;
  onEdit: () => void; onStats: () => void; link?: string;
}) {
  return <Tabs value={activeView} onValueChange={value => onViewChange(value as WorkspaceView)} className="flex-1 min-h-0 flex text-foreground">
    <ResizablePanelGroup orientation="horizontal" aria-label="Problem workspace">
      <ResizablePanel id="problem-content" defaultSize="50%" minSize="30%" maxSize="70%" className="h-full overflow-hidden bg-background">
        <div className="h-full min-h-0 border-r border-border bg-background flex flex-col">
          <div className="border-b border-border bg-background sticky top-0 z-10 p-2">
            <div className="flex min-w-0 items-center gap-1 px-2">
              <TabsList aria-label="Problem views" className="min-w-0 flex-1">
                {views.map(({ value, label, Icon, color }) => <TabsTrigger key={value} value={value} data-workspace-view={value} className="group shrink-0">
                  <Icon className={`w-5 h-5 ${color} group-data-[state=active]:text-foreground`} />
                  <span className="text-foreground group-data-[state=active]:font-semibold">{label}</span>
                </TabsTrigger>)}
              </TabsList>
              <div className="ml-auto shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="workspaceMore" data-active={activeView === 'ai-assistant'}><span>More</span><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem selected={activeView === 'ai-assistant'} onSelect={() => onViewChange('ai-assistant')}><BotMessageSquare className="w-4 h-4 text-editor-icon-ai" />Repcode AI</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onEdit}><Edit3 className="w-4 h-4 text-editor-icon-notes" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onStats}><BarChart2 className="w-4 h-4 text-editor-icon-tools" />Stats</DropdownMenuItem>
                    {link && <DropdownMenuItem id="run-leetcode-button" asChild><a href={link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4 text-editor-icon-run" />Run on Leetcode</a></DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          <WorkspaceViews key={problemKey} activeView={activeView} renderView={renderView} />
        </div>
      </ResizablePanel>
      <ResizableHandle aria-label="Resize problem and editor panels" />
      <ResizablePanel id="problem-editor" defaultSize="50%" minSize="30%" maxSize="70%" className="h-full overflow-hidden" onResize={onEditorResize}>{editor}</ResizablePanel>
    </ResizablePanelGroup>
  </Tabs>;
}
