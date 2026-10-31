import { Badge } from '@/components/ui/Badge';
import { DifficultyBadge, StudyStateBadge } from '@/components/app/ProblemBadges';
import { Heading } from '@/components/ui/typography';
import { Table, TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CheckCircleIcon, SparklesIcon, BookOpenIcon } from "lucide-react"

const ProblemListPreview = () => {
  // Sample data for the preview
  const problems = [
    { id: 1, name: "Two Sum", difficulty: "Easy", type: "Review" },
    { id: 2, name: "Valid Parentheses", difficulty: "Easy", type: "Learning" },
    { id: 3, name: "Merge Two Sorted Lists", difficulty: "Easy", type: "New" },
    { id: 4, name: "Maximum Subarray", difficulty: "Medium", type: "Review" },
    { id: 5, name: "LRU Cache", difficulty: "Medium", type: "Learning" },
    { id: 6, name: "Merge k Sorted Lists", difficulty: "Hard", type: "New" },
  ]

  return (
    <div className="p-6 overflow-hidden">
      <div className="py-5 border-b border-border flex justify-between items-center">
        <Heading as="h2" size="lg" weight="semibold" tone="foreground">Algorithm Problems</Heading>
        <Badge variant="meta" size="default" >
          {problems.length} problems
        </Badge>
      </div>
      <TableContainer>
        <Table variant="preview">
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead>Problem Name</TableHead>
              <TableHead align="right">Difficulty</TableHead>
              <TableHead align="right">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {problems.map((problem) => (
              <TableRow key={problem.id} className="border-b border-border hover:bg-surface-preview-hover/50 transition-colors">
                <TableCell>
                  <span className="font-medium text-foreground hover:text-marketing-link transition-colors cursor-pointer">
                    {problem.name}
                  </span>
                </TableCell>
                <TableCell align="right">
                  <DifficultyBadge value={problem.difficulty} />
                </TableCell>
                <TableCell align="right">
                  <StudyStateBadge value={problem.type} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default ProblemListPreview
