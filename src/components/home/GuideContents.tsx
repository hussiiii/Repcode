import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/typography';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const sections = [
  { href: '#what-is-repcode', label: 'What is Repcode?' },
  { href: '#what-repcode-is-not', label: 'What Repcode is not' },
  { href: '#exploring-platform', label: 'Part 0: Exploring the Platform' },
  { href: '#organization-customization', label: 'Part 1: Organization and Customization' },
  { href: '#spatial-repetition-algorithm', label: 'Part 2: The Spatial Repetition Algorithm', children: [
    { href: '#how-to-use-study-mode', label: 'Part 2.1: How to Use Study Mode' },
    { href: '#how-algorithm-works', label: 'Part 2.2: How the Algorithm Works' },
  ] },
  { href: '#ai-feedback', label: 'Part 3: AI Feedback' },
];
function ContentsLinks({ mobile }: { mobile: boolean }) {
  return <nav aria-label="Guide contents" className="space-y-3">
    {sections.map(section => <Card key={section.href} surface="page" radius="lg" border="faint" padding={mobile ? 'xs' : 'sm'} elevation="sm">
      <a href={section.href} className="block text-foreground hover:text-action transition-colors font-medium">{section.label}</a>
      {section.children && <div className="mt-2 ml-2 space-y-2">
        {section.children.map(child => <Card key={child.href} surface="pageMuted" radius="sm" border="inset" padding="xs" elevation="none">
          <a href={child.href} className="block text-foreground hover:text-action transition-colors text-sm">{child.label}</a>
        </Card>)}
      </div>}
    </Card>)}
  </nav>;
}
export function GuideContents({ mobile = false }: { mobile?: boolean }) {
  return <Card surface="guide" border="emphasis" padding={mobile ? 'md' : 'guide'} elevation="md">
    {mobile ? <Collapsible>
      <Heading as="h2" size="xl" weight="bold" tone="foreground">
        <CollapsibleTrigger asChild><Button variant="contentsToggle" size="natural">
          <span className="bg-foreground/20 rounded-full p-1 mr-2"><span className="text-lg">📑</span></span>
          Guide Contents
        </Button></CollapsibleTrigger>
      </Heading>
      <CollapsibleContent className="mt-4"><ContentsLinks mobile /></CollapsibleContent>
    </Collapsible> : <>
      <div className="flex items-center mb-4">
        <div className="flex items-center justify-center rounded-full bg-foreground/20 w-12 h-12 mr-3 p-2"><span className="text-xl">📌</span></div>
        <Heading as="h2" size="xl" weight="bold" tone="foreground">Guide Contents</Heading>
      </div>
      <ContentsLinks mobile={false} />
    </>}
  </Card>;
}
