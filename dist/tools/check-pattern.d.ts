import { z } from 'zod';
export declare const checkPatternInputSchema: {
    html: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
};
export declare function checkPattern(args: {
    html: string;
    context?: string;
}): Promise<string>;
//# sourceMappingURL=check-pattern.d.ts.map