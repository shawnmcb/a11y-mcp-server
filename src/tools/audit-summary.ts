import { z } from 'zod';
import { findByNumber, type WcagCriterion } from '../services/wcag-service.js';

export const auditSummaryInputSchema = {
  issues: z.array(z.object({
    description: z.string().describe('Description of the accessibility issue'),
    wcagCriteria: z.array(z.string()).optional().describe('Related WCAG criteria IDs'),
    severity: z.enum(['critical', 'serious', 'moderate', 'minor']).optional().describe('Severity level'),
    element: z.string().optional().describe('Element or selector affected'),
    count: z.number().optional().describe('Number of occurrences'),
  })).describe('List of accessibility issues found'),
  url: z.string().optional().describe('URL or page being audited'),
  scope: z.string().optional().describe('Scope of the audit'),
};

interface AuditIssue {
  description: string;
  wcagCriteria?: string[];
  severity?: 'critical' | 'serious' | 'moderate' | 'minor';
  element?: string;
  count?: number;
}

interface WcagDetails {
  id: string;
  name: string;
  level: string;
}

function getWcagDetails(criterionId: string): WcagDetails | null {
  const criterion = findByNumber(criterionId);
  if (criterion) {
    return {
      id: criterion.id,
      name: criterion.name,
      level: criterion.level,
    };
  }
  return null;
}

function categorizeBySeverity(issues: AuditIssue[]): Record<string, AuditIssue[]> {
  const categories: Record<string, AuditIssue[]> = {
    critical: [],
    serious: [],
    moderate: [],
    minor: [],
    unspecified: [],
  };

  issues.forEach(issue => {
    const severity = issue.severity || 'unspecified';
    categories[severity].push(issue);
  });

  return categories;
}

function categorizeByWcagLevel(issues: AuditIssue[]): Record<string, AuditIssue[]> {
  const categories: Record<string, AuditIssue[]> = {
    A: [],
    AA: [],
    AAA: [],
    unknown: [],
  };

  issues.forEach(issue => {
    if (!issue.wcagCriteria || issue.wcagCriteria.length === 0) {
      categories.unknown.push(issue);
      return;
    }

    // Use highest level (A < AA < AAA)
    let highestLevel = 'A';
    issue.wcagCriteria.forEach(id => {
      const details = getWcagDetails(id);
      if (details) {
        if (details.level === 'AAA') highestLevel = 'AAA';
        else if (details.level === 'AA' && highestLevel !== 'AAA') highestLevel = 'AA';
      }
    });
    categories[highestLevel].push(issue);
  });

  return categories;
}

function getTotalCount(issues: AuditIssue[]): number {
  return issues.reduce((total, issue) => total + (issue.count || 1), 0);
}

function generateExecutiveSummary(
  issues: AuditIssue[],
  bySeverity: Record<string, AuditIssue[]>,
  byLevel: Record<string, AuditIssue[]>
): string {
  const totalIssues = issues.length;
  const totalInstances = getTotalCount(issues);

  const criticalCount = bySeverity.critical.length;
  const seriousCount = bySeverity.serious.length;
  const levelACount = byLevel.A.length;
  const levelAACount = byLevel.AA.length;

  let status: string;
  let recommendation: string;

  if (criticalCount > 0) {
    status = 'Requires Immediate Attention';
    recommendation = `${criticalCount} critical issue(s) must be addressed before deployment. These issues prevent some users from accessing content or completing tasks.`;
  } else if (seriousCount > 0) {
    status = 'Needs Significant Work';
    recommendation = `${seriousCount} serious issue(s) should be prioritized. These issues create significant barriers for users with disabilities.`;
  } else if (totalIssues > 0) {
    status = 'Minor Issues Found';
    recommendation = 'Issues found are moderate or minor and should be addressed to improve the user experience.';
  } else {
    status = 'No Issues Found';
    recommendation = 'No accessibility issues were detected. Consider manual testing with assistive technologies for comprehensive coverage.';
  }

  const lines = [
    `**Audit Status:** ${status}`,
    '',
    `**Summary:** Found ${totalIssues} unique issue${totalIssues !== 1 ? 's' : ''} (${totalInstances} total instance${totalInstances !== 1 ? 's' : ''})`,
    '',
    `**WCAG Conformance Impact:**`,
    `- Level A violations: ${levelACount} (blocks basic accessibility)`,
    `- Level AA violations: ${levelAACount} (blocks standard compliance)`,
    '',
    `**Recommendation:** ${recommendation}`,
  ];

  return lines.join('\n');
}

function formatIssueList(issues: AuditIssue[], title: string): string {
  if (issues.length === 0) return '';

  const lines = [
    `### ${title} (${issues.length})`,
    '',
  ];

  issues.forEach((issue, idx) => {
    const count = issue.count && issue.count > 1 ? ` (${issue.count} instances)` : '';
    lines.push(`${idx + 1}. **${issue.description}**${count}`);

    if (issue.wcagCriteria && issue.wcagCriteria.length > 0) {
      const wcagDetails = issue.wcagCriteria
        .map(id => {
          const details = getWcagDetails(id);
          return details ? `${id} ${details.name} (Level ${details.level})` : id;
        })
        .join(', ');
      lines.push(`   - WCAG: ${wcagDetails}`);
    }

    if (issue.element) {
      lines.push(`   - Element: \`${issue.element}\``);
    }

    lines.push('');
  });

  return lines.join('\n');
}

function generateDetailedFindings(
  bySeverity: Record<string, AuditIssue[]>,
  byLevel: Record<string, AuditIssue[]>
): string {
  const sections: string[] = [];

  // By Severity
  sections.push('## Issues by Severity');
  sections.push('');

  if (bySeverity.critical.length > 0) {
    sections.push(formatIssueList(bySeverity.critical, 'Critical'));
  }
  if (bySeverity.serious.length > 0) {
    sections.push(formatIssueList(bySeverity.serious, 'Serious'));
  }
  if (bySeverity.moderate.length > 0) {
    sections.push(formatIssueList(bySeverity.moderate, 'Moderate'));
  }
  if (bySeverity.minor.length > 0) {
    sections.push(formatIssueList(bySeverity.minor, 'Minor'));
  }
  if (bySeverity.unspecified.length > 0) {
    sections.push(formatIssueList(bySeverity.unspecified, 'Severity Unspecified'));
  }

  // By WCAG Level
  sections.push('## Issues by WCAG Level');
  sections.push('');

  if (byLevel.A.length > 0) {
    sections.push(formatIssueList(byLevel.A, 'Level A (Must Fix for Basic Access)'));
  }
  if (byLevel.AA.length > 0) {
    sections.push(formatIssueList(byLevel.AA, 'Level AA (Required for Most Standards)'));
  }
  if (byLevel.AAA.length > 0) {
    sections.push(formatIssueList(byLevel.AAA, 'Level AAA (Enhanced Accessibility)'));
  }
  if (byLevel.unknown.length > 0) {
    sections.push(formatIssueList(byLevel.unknown, 'WCAG Level Unknown'));
  }

  return sections.join('\n');
}

function generateRemedationPriorities(issues: AuditIssue[]): string {
  const lines = [
    '## Remediation Priorities',
    '',
    '### Immediate (Critical/Level A)',
    'Address these first as they block basic accessibility:',
    '',
  ];

  const critical = issues.filter(i =>
    i.severity === 'critical' ||
    (i.wcagCriteria && i.wcagCriteria.some(id => {
      const details = getWcagDetails(id);
      return details?.level === 'A';
    }))
  );

  if (critical.length > 0) {
    critical.slice(0, 5).forEach((issue, idx) => {
      lines.push(`${idx + 1}. ${issue.description}`);
    });
    if (critical.length > 5) {
      lines.push(`   ... and ${critical.length - 5} more`);
    }
  } else {
    lines.push('- No immediate priority issues found');
  }

  lines.push('');
  lines.push('### Short-term (Serious/Level AA)');
  lines.push('Address for standard WCAG 2.1 AA compliance:');
  lines.push('');

  const serious = issues.filter(i =>
    i.severity === 'serious' ||
    (i.wcagCriteria && i.wcagCriteria.some(id => {
      const details = getWcagDetails(id);
      return details?.level === 'AA';
    }))
  ).filter(i => !critical.includes(i));

  if (serious.length > 0) {
    serious.slice(0, 5).forEach((issue, idx) => {
      lines.push(`${idx + 1}. ${issue.description}`);
    });
    if (serious.length > 5) {
      lines.push(`   ... and ${serious.length - 5} more`);
    }
  } else {
    lines.push('- No short-term priority issues found');
  }

  lines.push('');

  return lines.join('\n');
}

export async function auditSummary(args: {
  issues: AuditIssue[];
  url?: string;
  scope?: string;
}): Promise<string> {
  const { issues, url, scope } = args;

  if (!issues || issues.length === 0) {
    return `# Accessibility Audit Report

${url ? `**URL:** ${url}` : ''}
${scope ? `**Scope:** ${scope}` : ''}

**Result:** No accessibility issues provided for analysis.

Either no issues were found, or please provide a list of issues to generate a report.`;
  }

  const bySeverity = categorizeBySeverity(issues);
  const byLevel = categorizeByWcagLevel(issues);

  const lines = [
    '# Accessibility Audit Report',
    '',
  ];

  if (url) lines.push(`**URL:** ${url}`);
  if (scope) lines.push(`**Scope:** ${scope}`);
  lines.push(`**Date:** ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  lines.push('---');
  lines.push('');

  lines.push('## Executive Summary');
  lines.push('');
  lines.push(generateExecutiveSummary(issues, bySeverity, byLevel));
  lines.push('');

  lines.push('---');
  lines.push('');

  lines.push(generateDetailedFindings(bySeverity, byLevel));

  lines.push('---');
  lines.push('');

  lines.push(generateRemedationPriorities(issues));

  lines.push('---');
  lines.push('');
  lines.push('*Report generated by a11y-mcp-server. For comprehensive audits, combine automated testing with manual review using assistive technologies.*');

  return lines.join('\n');
}
