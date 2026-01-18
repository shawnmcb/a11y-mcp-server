import { z } from 'zod';
export declare const lookupWcagInputSchema: {
    query: z.ZodString;
};
export declare function lookupWcag(args: {
    query: string;
}): Promise<string>;
//# sourceMappingURL=lookup-wcag.d.ts.map