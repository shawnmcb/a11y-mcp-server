import { z } from 'zod';
export declare const suggestFixInputSchema: {
    issueType: z.ZodString;
    wcagCriterion: z.ZodOptional<z.ZodString>;
};
export declare function suggestFix(args: {
    issueType: string;
    wcagCriterion?: string;
}): Promise<string>;
//# sourceMappingURL=suggest-fix.d.ts.map