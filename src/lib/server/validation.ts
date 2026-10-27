import { z } from 'zod';

const integer = z.number().int().min(0).max(2147483647);
const positiveInteger = integer.min(1);
export const idSchema = z.union([
  positiveInteger,
  z.string().regex(/^[1-9]\d*$/).transform(Number).pipe(positiveInteger),
]);

export const collectionSchema = z.object({ title: z.string().trim().min(1).max(25) });

export const problemSchema = z.object({
  name: z.string().trim().min(1).max(57),
  question: z.string().min(1).max(6000),
  solution: z.string().max(65535),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  collectionId: idSchema,
  functionSignature: z.string().max(65535),
  language: z.enum(['python', 'javascript', 'java', 'c_cpp']),
  link: z.string().max(2048).optional(),
  notes: z.string().max(2000).optional(),
});

const steps = z.string().trim().max(255).regex(/^[1-9]\d*[md](?: [1-9]\d*[md])*$/)
  .refine(value => value.split(' ').every(step => {
    const minutes = Number(step.slice(0, -1)) * (step.endsWith('d') ? 1440 : 1);
    return Number.isSafeInteger(minutes) && minutes <= 2147483647;
  }), 'Learning steps are too large');

export const settingsSchema = z.object({
  learnSteps: steps.optional(),
  relearnSteps: steps.optional(),
  relearnGraduatingInterval: z.number().finite().positive().max(1).optional(),
  graduatingInterval: positiveInteger.optional(),
  easyInterval: positiveInteger.optional(),
  startingEase: z.number().finite().min(1).optional(),
  minimumEase: z.number().finite().min(1).optional(),
  easyBonus: z.number().finite().positive().optional(),
  intervalModifier: z.number().finite().positive().optional(),
  maximumInterval: positiveInteger.max(Math.floor(2147483647 / 1440)).optional(),
  maximumNewPerDay: integer.optional(),
  overdueWarningThreshold: positiveInteger.optional(),
  apiKey: z.string().trim().max(512).nullable().optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'No settings provided');

const date = z.string().datetime({ offset: true }).transform(value => new Date(value));
// The review algorithm calculates fractional minutes; the database stores integer minutes.
const interval = z.number().finite().min(0).max(2147483647).transform(Math.round);
export const reviewUpdatesSchema = z.object({
  type: z.enum(['New', 'Learning', 'Relearning', 'Review']).optional(),
  interval: interval.optional(),
  relearnInterval: interval.optional(),
  stepIndex: integer.optional(),
  ease: z.number().finite().min(1).optional(),
  dueDate: date.optional(),
  originalDueDate: date.nullable().optional(),
  againCount: integer.optional(),
  hardCount: integer.optional(),
  goodCount: integer.optional(),
  easyCount: integer.optional(),
  lapses: integer.optional(),
}).strict().refine(value => Object.keys(value).length > 0, 'No review updates provided');

export const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Invalid calendar date');
