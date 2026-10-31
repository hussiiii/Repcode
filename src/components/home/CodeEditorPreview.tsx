"use client";
import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heading, Prose } from '@/components/ui/typography';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { Card } from '@/components/ui/card';

import { Button } from '@/components/ui/button';

import { useState } from "react"
import {
  CheckCircleIcon,
  CodeIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  BarChart2Icon,
  ExternalLinkIcon,
  EditIcon,
} from "lucide-react"

const CodeEditorPreview = () => {
  const [activeTab, setActiveTab] = useState("question")

  // Simple syntax highlighter for JavaScript
  const highlightCode = (code: string) => {
    const lines = code.split('\n')
    return lines.map((line, index) => {
      // Comments (both single-line and JSDoc)
      if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/**')) {
        return (
          <div key={index} className="text-code-comment">
            {line}
          </div>
        )
      }
      
      // For other lines, we'll tokenize and render with React components
      const tokens = tokenizeLine(line)
      return (
        <div key={index}>
          {tokens.map((token, tokenIndex) => (
            <span key={tokenIndex} className={token.className}>
              {token.text}
            </span>
          ))}
        </div>
      )
    })
  }

  const tokenizeLine = (line: string) => {
    const tokens: Array<{text: string, className: string}> = []
    let currentPos = 0
    
    // Define patterns with their corresponding classes
    const patterns = [
      { regex: /\b(function|return|const|let|var|if|else|for|while|do|switch|case|break|continue)\b/g, className: 'text-code-keyword' },
      { regex: /(@\w+)/g, className: 'text-code-keyword' },
      { regex: /(\{[^}]+\})/g, className: 'text-code-type' },
      { regex: /(\w+)(\s*\()/g, className: 'text-code-function', matchIndex: 1 },
      { regex: /(["'])(.*?)\1/g, className: 'text-code-string' },
      { regex: /\b\d+\b/g, className: 'text-code-number' },
      { regex: /([{}()\[\]])/g, className: 'text-code-foreground' },
    ]
    
    // Find all matches
    const allMatches: Array<{start: number, end: number, text: string, className: string}> = []
    
    patterns.forEach(pattern => {
      let match
      while ((match = pattern.regex.exec(line)) !== null) {
        const matchText = pattern.matchIndex ? match[pattern.matchIndex] : match[0]
        const matchStart = pattern.matchIndex ? match.index + match[0].indexOf(matchText) : match.index
        allMatches.push({
          start: matchStart,
          end: matchStart + matchText.length,
          text: matchText,
          className: pattern.className
        })
      }
    })
    
    // Sort matches by position
    allMatches.sort((a, b) => a.start - b.start)
    
    // Build tokens, handling overlaps
    let pos = 0
    allMatches.forEach(match => {
      // Add text before match
      if (pos < match.start) {
        tokens.push({
          text: line.substring(pos, match.start),
          className: 'text-code-foreground'
        })
      }
      
      // Add the match if it doesn't overlap with previous
      if (pos <= match.start) {
        tokens.push({
          text: match.text,
          className: match.className
        })
        pos = match.end
      }
    })
    
    // Add remaining text
    if (pos < line.length) {
      tokens.push({
        text: line.substring(pos),
        className: 'text-code-foreground'
      })
    }
    
    return tokens.length > 0 ? tokens : [{text: line, className: 'text-code-foreground'}]
  }

  // Sample problem data
  const problem = {
    name: "Two Sum",
    difficulty: "Easy",
    type: "Review",
    description: `<h3>Problem Description</h3>
<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p>
<p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.</p>
<p>You can return the answer in any order.</p>

<h3>Example 1:</h3>
<pre><code>Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
</code></pre>

<h3>Example 2:</h3>
<pre><code>Input: nums = [3,2,4], target = 6
Output: [1,2]
</code></pre>

<h3>Constraints:</h3>
<ul>
<li><code>2 <= nums.length <= 10<sup>4</sup></code></li>
<li><code>-10<sup>9</sup> <= nums[i] <= 10<sup>9</sup></code></li>
<li><code>-10<sup>9</sup> <= target <= 10<sup>9</sup></code></li>
<li><strong>Only one valid answer exists.</strong></li>
</ul>`,
    notes:
      "Use a hash map to store the values we've seen so far and their indices.\nFor each number, check if (target - current number) exists in the hash map.\nTime complexity: O(n), Space complexity: O(n)",
    solution: `function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return null;
}`,
    functionSignature: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Your code here
  
}`,
  }

  const renderTabContent = (view: string) => {
    if (view === "notes") {
      return <p className="text-foreground mt-4 whitespace-pre-wrap text-sm">{problem.notes}</p>
    } else if (view === "question") {
      return (
        <Prose variant="previewDescription"
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />
      )
    } else {
      return (
        <pre className="text-sm mt-4 bg-code-background p-4 rounded-lg overflow-auto">
          <code className="text-foreground font-mono">{problem.solution}</code>
        </pre>
      )
    }
  }

  return (
    <Tabs asChild value={activeTab} onValueChange={setActiveTab}>
    <Card surface="page" elevation="xl" className="h-[500px] md:h-[500px] flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-surface">
        <div className="flex items-center min-w-0 flex-1">
          <Button variant="text" className="flex items-center mr-3 group flex-shrink-0" tone="muted" aria-label="Back to collection">
            <div className="p-1 rounded-lg group-hover:bg-background transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
          </Button>
          <Heading as="h3" size="sm" weight="semibold" tone="foreground" className="mr-3 truncate">{problem.name}</Heading>
          <div className="flex gap-2 flex-shrink-0">
            <DifficultyBadge value={problem.difficulty} />
            <StudyStateBadge value={problem.type} />
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="icon" size="iconSm" tone="preview" aria-label="Edit problem">
            <EditIcon className="w-3.5 h-3.5" />
          </Button>
          <Button variant="icon" size="iconSm" tone="preview" aria-label="View problem statistics">
            <BarChart2Icon className="w-3.5 h-3.5" />
          </Button>
          <Button variant="icon" size="iconSm" tone="preview" aria-label="Open problem on LeetCode">
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content with Panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="h-1/2 md:h-full bg-surface w-full md:w-1/2 flex flex-col">
          <div className="h-full border-b md:border-b-0 md:border-r border-border flex flex-col">
            <div className="p-2 border-b border-border flex-shrink-0">
              <TabsList aria-label="Preview problem views" className="gap-1">
                <TabsTrigger value="question" variant="preview"><CodeIcon className="w-3.5 h-3.5" /><span className="ml-1.5">Description</span></TabsTrigger>
                <TabsTrigger value="notes" variant="preview"><BookOpenIcon className="w-3.5 h-3.5" /><span className="ml-1.5">Notes</span></TabsTrigger>
                <TabsTrigger value="solution" variant="preview"><CheckCircleIcon className="w-3.5 h-3.5" /><span className="ml-1.5">Solution</span></TabsTrigger>
              </TabsList>
            </div>
            <ScrollArea direction="both" className="flex-1 p-2 md:p-4">
              <Prose variant="preview">
                {["question", "notes", "solution"].map(value => <TabsContent key={value} value={value}>{renderTabContent(value)}</TabsContent>)}
              </Prose>
            </ScrollArea>
          </div>
        </div>

        {/* Resize Handle - hidden on mobile */}
        <div aria-hidden="true" className="hidden md:block w-1 bg-border relative"></div>

        {/* Right Panel - Code Editor */}
        <div className="h-1/2 md:h-full bg-code-background w-full md:w-1/2 flex flex-col">
          <ScrollArea direction="both" className="flex-1 p-2 md:p-4 font-mono text-sm text-foreground">
            <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">
              {highlightCode(problem.functionSignature)}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Floating AI Help button */}
      <Button variant="marketingFloating" size="floating" className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <span className="hidden sm:inline">AI Help</span>
        <span className="sm:hidden">AI</span>
      </Button>
    </Card>
    </Tabs>
  )
}

export default CodeEditorPreview
