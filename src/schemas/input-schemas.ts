import { z } from 'zod';

export const lookupWcagSchema = z.object({
  query: z.string().describe('WCAG criterion number (e.g., "2.1.1"), keyword (e.g., "keyboard"), or level (e.g., "A", "AA", "AAA")'),
  queryType: z.enum(['number', 'keyword', 'level']).optional().describe('Type of lookup. If not specified, will be auto-detected.'),
});

export const checkPatternSchema = z.object({
  html: z.string().describe('HTML code snippet to check for accessibility issues'),
  context: z.string().optional().describe('Optional context about the component (e.g., "navigation menu", "form", "modal dialog")'),
});

export const suggestFixSchema = z.object({
  issueType: z.string().describe('Type of accessibility issue (e.g., "missing-alt", "missing-label", "contrast")'),
  wcagCriterion: z.string().optional().describe('Optional WCAG criterion number for more specific remediation'),
});

export const documentComponentSchema = z.object({
  componentType: z.enum([
    'button',
    'link',
    'modal',
    'dialog',
    'tabs',
    'accordion',
    'menu',
    'dropdown',
    'tooltip',
    'carousel',
    'slider',
    'form',
    'table',
    'alert',
    'toast',
    'combobox',
    'listbox',
    'tree',
    'grid',
    'other'
  ]).describe('Type of UI component to document'),
  customName: z.string().optional().describe('Custom component name if type is "other"'),
  includeKeyboard: z.boolean().optional().default(true).describe('Include keyboard interaction documentation'),
  includeAria: z.boolean().optional().default(true).describe('Include ARIA attributes documentation'),
  includeScreenReader: z.boolean().optional().default(true).describe('Include screen reader expectations'),
});

export const auditSummarySchema = z.object({
  issues: z.array(z.object({
    description: z.string().describe('Description of the accessibility issue'),
    wcagCriteria: z.array(z.string()).optional().describe('Related WCAG criteria IDs'),
    severity: z.enum(['critical', 'serious', 'moderate', 'minor']).optional().describe('Severity level'),
    element: z.string().optional().describe('Element or selector affected'),
    count: z.number().optional().describe('Number of occurrences'),
  })).describe('List of accessibility issues found'),
  url: z.string().optional().describe('URL or page being audited'),
  scope: z.string().optional().describe('Scope of the audit (e.g., "homepage", "checkout flow")'),
});

export type LookupWcagInput = z.infer<typeof lookupWcagSchema>;
export type CheckPatternInput = z.infer<typeof checkPatternSchema>;
export type SuggestFixInput = z.infer<typeof suggestFixSchema>;
export type DocumentComponentInput = z.infer<typeof documentComponentSchema>;
export type AuditSummaryInput = z.infer<typeof auditSummarySchema>;
