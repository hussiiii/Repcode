"use client"

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
import Badge from "../ui/Badge"

// Define interface for TabButton props
interface TabButtonProps {
  active: boolean;
  label: string;
  icon: React.ReactNode;
}

const CodeEditorPreview = () => {
  const [activeTab, setActiveTab] = useState("question")
  const [panelWidth, setPanelWidth] = useState(50)

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

  const TabButton = ({ active, label, icon }: TabButtonProps) => (
    <button
      onClick={() => setActiveTab(label.toLowerCase())}
      className={`
        px-3 py-1.5 text-xs font-medium rounded-lg flex items-center
        transition-all duration-200
        ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}
      `}
    >
      {icon}
      <span className="ml-1.5">{label}</span>
    </button>
  )

  const renderTabContent = () => {
    if (activeTab === "notes") {
      return <p className="text-foreground mt-4 whitespace-pre-wrap text-sm">{problem.notes}</p>
    } else if (activeTab === "question") {
      return (
        <div
          className="text-foreground mt-4 problem-content prose prose-invert max-w-none text-sm"
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
    <div className="h-[500px] md:h-[500px] bg-background flex flex-col rounded-xl overflow-hidden border border-border shadow-xl">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-border bg-surface">
        <div className="flex items-center min-w-0 flex-1">
          <button className="flex items-center text-muted-foreground hover:text-foreground transition-colors mr-3 group flex-shrink-0">
            <div className="p-1 rounded-lg group-hover:bg-background transition-colors">
              <ArrowLeftIcon className="w-4 h-4" />
            </div>
          </button>
          <h1 className="text-sm font-semibold text-foreground mr-3 truncate">{problem.name}</h1>
          <div className="flex gap-2 flex-shrink-0">
            <Badge type="difficulty" value={problem.difficulty} />
            <Badge type="problemType" value={problem.type} />
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
            <EditIcon className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
            <BarChart2Icon className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background transition-colors">
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content with Panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="h-1/2 md:h-full bg-surface w-full md:w-1/2 flex flex-col">
          <div className="h-full border-b md:border-b-0 md:border-r border-border flex flex-col">
            <div className="p-2 border-b border-border flex-shrink-0">
              <div className="flex gap-1 overflow-x-auto">
                <TabButton
                  active={activeTab === "question"}
                  label="Description"
                  icon={<CodeIcon className="w-3.5 h-3.5" />}
                />
                <TabButton
                  active={activeTab === "notes"}
                  label="Notes"
                  icon={<BookOpenIcon className="w-3.5 h-3.5" />}
                />
                <TabButton
                  active={activeTab === "solution"}
                  label="Solution"
                  icon={<CheckCircleIcon className="w-3.5 h-3.5" />}
                />
              </div>
            </div>
            <div className="flex-1 p-2 md:p-4 overflow-y-auto">
              <div className="prose prose-invert max-w-none text-xs md:text-sm [&_pre]:text-xs [&_pre]:overflow-x-auto [&_code]:text-xs [&_code]:break-words">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle - hidden on mobile */}
        <div className="hidden md:block w-1 bg-border cursor-col-resize relative"></div>

        {/* Right Panel - Code Editor */}
        <div className="h-1/2 md:h-full bg-code-background w-full md:w-1/2 flex flex-col">
          <div className="flex-1 p-2 md:p-4 font-mono text-sm text-foreground overflow-y-auto">
            <div className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">
              {highlightCode(problem.functionSignature)}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Help button */}
      <button className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex items-center px-2 py-1.5 md:px-3 md:py-2 bg-gradient-to-r from-marketing-action-start to-marketing-action-end hover:from-marketing-action-hover-start hover:to-marketing-action-hover-end text-marketing-action-foreground rounded-full text-xs font-medium shadow-lg z-10">
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
      </button>
    </div>
  )
}

export default CodeEditorPreview