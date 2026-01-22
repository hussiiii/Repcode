import prisma from "../../../prisma_client";
import { convert } from 'html-to-text';
import authenticate from '@/auth/Authenticate';

enum Difficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard'
}

interface LeetcodeListResponse {
  data: {
    favoriteQuestionList: {
      questions: Array<{
        titleSlug: string;
      }>;
    };
  };
}

interface LeetcodeProblemResponse {
  data: {
    question: {
      title: string;
      difficulty: string;
      questionFrontendId: string;
      content: string;
      codeDefinition: string;
    };
  };
}

const MAX_PROBLEMS = 152;

export default async function handler(req: any, res: any) {
    authenticate(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        // 1) Parse request body
        const { slug, collectionId } = req.body;

        // 2) Look up user in DB
        const userObject = await prisma.user.findUnique({
            where: {
            email: req.user?.email as string
            }
        });

        // 2.5) If user not found, handle error
        if (!userObject) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        // 3) Look up collection
        const collection = await prisma.collection.findUnique({
            where: { id: parseInt(collectionId) }
        });

        // 4) Check ownership
        if (!collection || collection.userId !== userObject.id) {
            return res.status(403).json({ message: 'Forbidden: You do not own this collection' });
        }

        try {
            // Check current problem count
            const currentProblems = await prisma.problem.count({
            where: { collectionId: parseInt(collectionId) }
            });

            // Step 1: Get all problems from the list
            const listResponse = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
            },
            body: JSON.stringify({
                query: `query favoriteQuestionList($favoriteSlug: String!) {
                favoriteQuestionList(favoriteSlug: $favoriteSlug) {
                    questions {
                    titleSlug
                    }
                }
                }`,
                variables: { favoriteSlug: slug }
            })
            });

            // Get problems from list
            const listData: LeetcodeListResponse = await listResponse.json();
            const problems = listData.data?.favoriteQuestionList?.questions;

            if (!problems) {
            return res.status(404).json({ message: 'List not found or empty' });
            }

            // Check if importing would exceed limit
            if (currentProblems + problems.length > MAX_PROBLEMS) {
            return res.status(400).json({ 
                message: `Cannot import ${problems.length} problems. Collection would exceed the maximum limit of ${MAX_PROBLEMS} problems. Current count: ${currentProblems}`
            });
            }

            // Step 2: Get details for each problem and create them
            const createdProblems = [];
            const PROBLEMS_PER_DAY = 7;

            // Get tomorrow's date as the starting point
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 1); // Start from tomorrow
            startDate.setHours(0, 0, 0, 0); // Reset time to beginning of day

            const mapDifficulty = (leetcodeDifficulty: string): Difficulty => {
            switch (leetcodeDifficulty.toUpperCase()) {
                case 'EASY':
                return Difficulty.Easy;
                case 'MEDIUM':
                return Difficulty.Medium;
                case 'HARD':
                return Difficulty.Hard;
                default:
                return Difficulty.Medium; // Default case
            }
            };

            for (let index = 0; index < problems.length; index++) {
            const problem = problems[index];
            
            // Calculate which day this problem should be due
            const daysToAdd = Math.floor(index / PROBLEMS_PER_DAY);
            const dueDate = new Date(startDate);
            dueDate.setDate(startDate.getDate() + daysToAdd);

            // Get problem details
            const problemResponse = await fetch('https://leetcode.com/graphql', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Referer': 'https://leetcode.com'
                },
                body: JSON.stringify({
                query: `query getQuestionDetail($titleSlug: String!) {
                    question(titleSlug: $titleSlug) {
                    title
                    difficulty
                    questionFrontendId
                    content
                    codeDefinition
                    }
                }`,
                variables: { titleSlug: problem.titleSlug }
                })
            });

            const problemData: LeetcodeProblemResponse = await problemResponse.json();
            const questionData = problemData.data?.question;

            if (questionData) {
                // Parse codeDefinition to get Python3 boilerplate
                let functionSignature = '';
                try {
                if (questionData.codeDefinition) {  // Check if codeDefinition exists
                    const codeDefinitions = JSON.parse(questionData.codeDefinition);
                    if (Array.isArray(codeDefinitions)) {  // Verify it's an array
                    const python3Definition = codeDefinitions.find(
                        (def: any) => def.value === 'python3'
                    );
                    functionSignature = python3Definition?.defaultCode || '# No default code provided\ndef solution():\n    pass';
                    }
                } else {
                    functionSignature = '# No default code provided\ndef solution():\n    pass';
                }
                } catch (e) {
                console.error('Error parsing code definition:', e);
                functionSignature = '# Error loading default code\ndef solution():\n    pass';
                }

                // Create the problem with the calculated due date
                // Both dueDate and originalDueDate are set to the same value on creation
                // - dueDate: Used for queue ordering (may change if user skips)
                // - originalDueDate: The "true" due date for overdue tracking
                const createdProblem = await prisma.problem.create({
                data: {
                    name: `${questionData.questionFrontendId}. ${questionData.title}` || 'Untitled Problem',
                    question: questionData.content || 'No content available',
                    solution: 'TODO: Add your solution here',
                    difficulty: mapDifficulty(questionData.difficulty || 'Medium'),
                    collectionId: parseInt(collectionId),
                    functionSignature,
                    language: 'python',
                    link: `https://leetcode.com/problems/${problem.titleSlug}/`,
                    dueDate,
                    originalDueDate: dueDate, // Set both dates on creation
                },
                });

                createdProblems.push(createdProblem);
            }
            }

            // Update collection's lastAdded field
            await prisma.collection.update({
            where: { id: parseInt(collectionId) },
            data: { lastAdded: new Date() },
            });

            return res.status(200).json({
            message: `Successfully imported ${createdProblems.length} problems`,
            problems: createdProblems
            });

        } catch (error) {
            console.error('Import error:', error);
            return res.status(500).json({ message: 'Failed to import problems' });
        }
    })
} 