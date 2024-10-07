import { z } from 'zod';
//import { regex } from '../../utils/regex';

export const suggestSolutionInputSchema = z.object({
    userId: z.string(),
    suggestion: z.number().positive().int().gte(1).lte(1000)
  });