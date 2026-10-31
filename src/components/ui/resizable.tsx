"use client";
import * as React from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';
export function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return <Group {...props} className={cn('flex h-full w-full min-h-0 min-w-0 overflow-hidden', className)} />;
}
export const ResizablePanel = Panel;
export function ResizableHandle({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator {...props} className={cn('w-1 hover:w-2 data-[separator=active]:w-2 bg-border relative group transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}>
    <div aria-hidden="true" className="absolute top-1/2 -translate-y-1/2 transition-all duration-200 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-data-[separator=active]:opacity-100 pointer-events-none">
      <div className="bg-border-strong rounded-md p-1 -ml-3"><span className="material-icons text-muted-foreground text-base">chevron_left</span></div>
      <div className="bg-border-strong rounded-md p-1 -ml-3 mt-1"><span className="material-icons text-muted-foreground text-base">chevron_right</span></div>
    </div>
  </Separator>;
}
