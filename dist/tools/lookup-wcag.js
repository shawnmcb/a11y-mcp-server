import { z } from 'zod';
import { findByNumber, findByKeyword, findByLevel } from '../services/wcag-service.js';
export const lookupWcagInputSchema = {
    query: z.string().describe('WCAG criterion number (e.g., "2.1.1"), keyword (e.g., "keyboard"), or level (e.g., "A", "AA", "AAA")'),
};
function detectQueryType(query) {
    const normalized = query.trim().toUpperCase();
    // Check if it's a level
    if (['A', 'AA', 'AAA'].includes(normalized)) {
        return 'level';
    }
    // Check if it matches criterion number pattern (e.g., 1.1.1, 2.4.7)
    if (/^\d+\.\d+\.\d+$/.test(query.trim())) {
        return 'number';
    }
    // Default to keyword search
    return 'keyword';
}
function formatCriterion(criterion) {
    const lines = [
        `## ${criterion.id} ${criterion.name}`,
        `**Level:** ${criterion.level}`,
        `**Principle:** ${criterion.principle}`,
        `**Guideline:** ${criterion.guideline}`,
        '',
        `### Description`,
        criterion.description,
        '',
    ];
    if (criterion.techniques.length > 0) {
        lines.push(`### Sufficient Techniques`);
        lines.push(criterion.techniques.join(', '));
        lines.push('');
    }
    if (criterion.failures.length > 0) {
        lines.push(`### Common Failures`);
        lines.push(criterion.failures.join(', '));
        lines.push('');
    }
    if (criterion.tests.length > 0) {
        lines.push(`### Test Suggestions`);
        criterion.tests.forEach(test => {
            lines.push(`- ${test}`);
        });
        lines.push('');
    }
    return lines.join('\n');
}
function formatCriteriaList(criteria, context) {
    if (criteria.length === 0) {
        return `No WCAG criteria found for: ${context}`;
    }
    const lines = [
        `## Found ${criteria.length} WCAG criteria for "${context}"`,
        '',
    ];
    criteria.forEach(c => {
        lines.push(`### ${c.id} ${c.name} (Level ${c.level})`);
        lines.push(c.description);
        lines.push('');
    });
    return lines.join('\n');
}
export async function lookupWcag(args) {
    const { query } = args;
    const queryType = detectQueryType(query);
    switch (queryType) {
        case 'number': {
            const criterion = findByNumber(query);
            if (!criterion) {
                return `WCAG criterion ${query} not found. Valid format: X.X.X (e.g., 2.1.1, 1.4.3)`;
            }
            return formatCriterion(criterion);
        }
        case 'level': {
            const level = query.trim().toUpperCase();
            const criteria = findByLevel(level);
            return formatCriteriaList(criteria, `Level ${level}`);
        }
        case 'keyword': {
            const criteria = findByKeyword(query);
            return formatCriteriaList(criteria, query);
        }
        default:
            return 'Unable to process query. Try a criterion number (e.g., 2.1.1), keyword (e.g., keyboard), or level (A, AA, AAA).';
    }
}
//# sourceMappingURL=lookup-wcag.js.map