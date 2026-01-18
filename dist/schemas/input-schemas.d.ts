import { z } from 'zod';
export declare const lookupWcagSchema: z.ZodObject<{
    query: z.ZodString;
    queryType: z.ZodOptional<z.ZodEnum<{
        number: "number";
        keyword: "keyword";
        level: "level";
    }>>;
}, z.core.$strip>;
export declare const checkPatternSchema: z.ZodObject<{
    html: z.ZodString;
    context: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const suggestFixSchema: z.ZodObject<{
    issueType: z.ZodString;
    wcagCriterion: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const documentComponentSchema: z.ZodObject<{
    componentType: z.ZodEnum<{
        link: "link";
        button: "button";
        modal: "modal";
        dialog: "dialog";
        tabs: "tabs";
        accordion: "accordion";
        menu: "menu";
        dropdown: "dropdown";
        tooltip: "tooltip";
        carousel: "carousel";
        slider: "slider";
        form: "form";
        table: "table";
        alert: "alert";
        toast: "toast";
        combobox: "combobox";
        listbox: "listbox";
        tree: "tree";
        grid: "grid";
        other: "other";
    }>;
    customName: z.ZodOptional<z.ZodString>;
    includeKeyboard: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeAria: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeScreenReader: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const auditSummarySchema: z.ZodObject<{
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
}, z.core.$strip>;
export type LookupWcagInput = z.infer<typeof lookupWcagSchema>;
export type CheckPatternInput = z.infer<typeof checkPatternSchema>;
export type SuggestFixInput = z.infer<typeof suggestFixSchema>;
export type DocumentComponentInput = z.infer<typeof documentComponentSchema>;
export type AuditSummaryInput = z.infer<typeof auditSummarySchema>;
//# sourceMappingURL=input-schemas.d.ts.map