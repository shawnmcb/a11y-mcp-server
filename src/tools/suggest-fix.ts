import { z } from 'zod';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const suggestFixInputSchema = {
  issueType: z.string().describe('Type of accessibility issue (e.g., "missing-alt", "missing-label", "contrast")'),
  wcagCriterion: z.string().optional().describe('Optional WCAG criterion number for more specific remediation'),
};

interface RemediationPattern {
  id: string;
  name: string;
  category: string;
  issueType: string;
  wcagRefs: string[];
  description: string;
  codeBefore: string;
  codeAfter: string;
  alternativeCode?: string;
  notes: string;
}

interface PatternsData {
  patterns: RemediationPattern[];
}

let patternsData: PatternsData | null = null;

function loadPatterns(): PatternsData {
  if (patternsData) {
    return patternsData;
  }
  const dataPath = join(__dirname, '../data/remediation-patterns.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  patternsData = JSON.parse(rawData) as PatternsData;
  return patternsData;
}

function findPatternsByIssueType(issueType: string): RemediationPattern[] {
  const data = loadPatterns();
  const lowerIssue = issueType.toLowerCase().replace(/[-_\s]/g, '');

  return data.patterns.filter(p => {
    const normalizedId = p.id.toLowerCase().replace(/[-_\s]/g, '');
    const normalizedType = p.issueType.toLowerCase().replace(/[-_\s]/g, '');
    const normalizedName = p.name.toLowerCase().replace(/[-_\s]/g, '');

    return normalizedId.includes(lowerIssue) ||
           normalizedType.includes(lowerIssue) ||
           normalizedName.includes(lowerIssue) ||
           lowerIssue.includes(normalizedType);
  });
}

function findPatternsByWcag(criterion: string): RemediationPattern[] {
  const data = loadPatterns();
  const normalized = criterion.replace(/^wcag/i, '').trim();

  return data.patterns.filter(p =>
    p.wcagRefs.some(ref => ref === normalized || ref.startsWith(normalized))
  );
}

function findRelatedPatterns(pattern: RemediationPattern): RemediationPattern[] {
  const data = loadPatterns();
  return data.patterns.filter(p =>
    p.id !== pattern.id &&
    (p.category === pattern.category ||
     p.wcagRefs.some(ref => pattern.wcagRefs.includes(ref)))
  ).slice(0, 3);
}

function formatPattern(pattern: RemediationPattern, includeRelated: boolean = true): string {
  const lines = [
    `## ${pattern.name}`,
    '',
    `**Category:** ${pattern.category}`,
    `**WCAG Criteria:** ${pattern.wcagRefs.join(', ')}`,
    '',
    `### Description`,
    pattern.description,
    '',
    `### Before (Inaccessible)`,
    '```html',
    pattern.codeBefore,
    '```',
    '',
    `### After (Accessible)`,
    '```html',
    pattern.codeAfter,
    '```',
    '',
  ];

  if (pattern.alternativeCode) {
    lines.push(`### Alternative Approach`);
    lines.push('```html');
    lines.push(pattern.alternativeCode);
    lines.push('```');
    lines.push('');
  }

  lines.push(`### Notes`);
  lines.push(pattern.notes);
  lines.push('');

  if (includeRelated) {
    const related = findRelatedPatterns(pattern);
    if (related.length > 0) {
      lines.push('### Related Patterns');
      related.forEach(r => {
        lines.push(`- **${r.name}** (\`${r.id}\`): ${r.description.substring(0, 80)}...`);
      });
      lines.push('');
    }
  }

  return lines.join('\n');
}

function formatPatternsList(patterns: RemediationPattern[], context: string): string {
  if (patterns.length === 0) {
    const data = loadPatterns();
    const availableTypes = [...new Set(data.patterns.map(p => p.issueType))].slice(0, 10);
    return `No remediation patterns found for: "${context}"\n\nAvailable issue types include:\n${availableTypes.map(t => `- ${t}`).join('\n')}`;
  }

  if (patterns.length === 1) {
    return formatPattern(patterns[0]);
  }

  const lines = [
    `## Found ${patterns.length} remediation patterns for "${context}"`,
    '',
  ];

  patterns.forEach((p, idx) => {
    lines.push(`### ${idx + 1}. ${p.name}`);
    lines.push(`**ID:** \`${p.id}\` | **WCAG:** ${p.wcagRefs.join(', ')}`);
    lines.push('');
    lines.push(p.description);
    lines.push('');
    lines.push('**Quick Fix:**');
    lines.push('```html');
    lines.push(p.codeAfter);
    lines.push('```');
    lines.push('');
  });

  return lines.join('\n');
}

export async function suggestFix(args: { issueType: string; wcagCriterion?: string }): Promise<string> {
  const { issueType, wcagCriterion } = args;

  let patterns: RemediationPattern[] = [];

  // If WCAG criterion provided, use it for lookup
  if (wcagCriterion) {
    patterns = findPatternsByWcag(wcagCriterion);
    if (patterns.length > 0) {
      // Filter by issue type if both provided
      if (issueType) {
        const issuePatterns = patterns.filter(p =>
          p.issueType.toLowerCase().includes(issueType.toLowerCase()) ||
          p.id.toLowerCase().includes(issueType.toLowerCase())
        );
        if (issuePatterns.length > 0) {
          patterns = issuePatterns;
        }
      }
      return formatPatternsList(patterns, `WCAG ${wcagCriterion}`);
    }
  }

  // Fall back to issue type lookup
  patterns = findPatternsByIssueType(issueType);
  return formatPatternsList(patterns, issueType);
}
