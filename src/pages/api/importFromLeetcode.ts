import prisma from "../../../prisma_client";
import { z } from 'zod';
import { ownedCollection, withUser } from '../../lib/server/api';
import { idSchema } from '../../lib/server/validation';

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

export default withUser('POST', async (req, res) => {
        const { slug, collectionId } = z.object({
            slug: z.string().trim().min(1).max(200).regex(/^[a-zA-Z0-9_-]+$/),
            collectionId: idSchema,
        }).parse(req.body);
        await ownedCollection(collectionId, req.appUser.id);

        try {
            // Check current problem count
            const currentProblems = await prisma.problem.count({
            where: { collectionId: collectionId }
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
                    collectionId: collectionId,
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
            where: { id: collectionId, userId: req.appUser.id },
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
});
