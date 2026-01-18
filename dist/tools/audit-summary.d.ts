import { z } from 'zod';
export declare const auditSummaryInputSchema: {
    issues: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        wcagCriteria: z.ZodOptional<z.ZodArray<z.ZodString>>;
        severity: z.ZodOptional<z.ZodEnum<{
            critical: "critical";
            serious: "serious";
            moderate: "moderate";
            minor: "minor";
        }>>;
        element: z.ZodOptional<z.ZodString>;
        count: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
    url: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodString>;
};
interface AuditIssue {
    description: string;
    wcagCriteria?: string[];
    severity?: 'critical' | 'serious' | 'moderate' | 'minor';
    element?: string;
    count?: number;
}
export declare function auditSummary(args: {
    issues: AuditIssue[];
    url?: string;
    scope?: string;
}): Promise<string>;
export {};
//# sourceMappingURL=audit-summary.d.ts.map