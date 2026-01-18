import { z } from 'zod';
export const checkPatternInputSchema = {
    html: z.string().describe('HTML code snippet to check for accessibility issues'),
    context: z.string().optional().describe('Optional context about the component'),
};
function checkForIssues(html, context) {
    const issues = [];
    // Check for images without alt attribute
    const imgWithoutAlt = html.match(/<img(?![^>]*\salt[=\s])[^>]*>/gi);
    if (imgWithoutAlt) {
        imgWithoutAlt.forEach(img => {
            issues.push({
                type: 'missing-alt',
                description: 'Image missing alt attribute',
                wcagCriteria: ['1.1.1'],
                severity: 'critical',
                element: img.substring(0, 80) + (img.length > 80 ? '...' : ''),
                suggestion: 'Add alt="" for decorative images or descriptive alt text for informative images',
            });
        });
    }
    // Check for empty alt on potentially informative images
    const imgEmptyAlt = html.match(/<img[^>]*\salt=["']['"]/gi);
    if (imgEmptyAlt) {
        imgEmptyAlt.forEach(img => {
            // Only flag if image has a meaningful src (not decorative patterns)
            if (!img.includes('decorat') && !img.includes('spacer') && !img.includes('divider')) {
                issues.push({
                    type: 'empty-alt-informative',
                    description: 'Image has empty alt - verify if decorative',
                    wcagCriteria: ['1.1.1'],
                    severity: 'moderate',
                    element: img.substring(0, 80) + (img.length > 80 ? '...' : ''),
                    suggestion: 'If image conveys information, add descriptive alt text',
                });
            }
        });
    }
    // Check for inputs without labels
    const inputs = html.match(/<input[^>]*>/gi) || [];
    inputs.forEach(input => {
        if (input.includes('type="hidden"') || input.includes("type='hidden'")) {
            return; // Skip hidden inputs
        }
        if (input.includes('type="submit"') || input.includes("type='submit'") ||
            input.includes('type="button"') || input.includes("type='button'") ||
            input.includes('type="reset"') || input.includes("type='reset'")) {
            return; // These don't need labels
        }
        const hasId = /\sid=["'][^"']+["']/.test(input);
        const hasAriaLabel = /\saria-label=["'][^"']+["']/.test(input);
        const hasAriaLabelledby = /\saria-labelledby=["'][^"']+["']/.test(input);
        const hasTitle = /\stitle=["'][^"']+["']/.test(input);
        if (!hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
            if (!hasId) {
                issues.push({
                    type: 'missing-label',
                    description: 'Input field missing accessible label',
                    wcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
                    severity: 'critical',
                    element: input.substring(0, 80) + (input.length > 80 ? '...' : ''),
                    suggestion: 'Add id attribute and associated <label for="id">, or use aria-label/aria-labelledby',
                });
            }
            else {
                // Has ID, check if label exists in HTML
                const idMatch = input.match(/\sid=["']([^"']+)["']/);
                if (idMatch) {
                    const labelPattern = new RegExp(`<label[^>]*\\sfor=["']${idMatch[1]}["'][^>]*>`, 'i');
                    if (!labelPattern.test(html)) {
                        issues.push({
                            type: 'missing-label',
                            description: `Input has id="${idMatch[1]}" but no associated <label for="${idMatch[1]}">`,
                            wcagCriteria: ['1.3.1', '3.3.2', '4.1.2'],
                            severity: 'critical',
                            element: input.substring(0, 80) + (input.length > 80 ? '...' : ''),
                            suggestion: `Add <label for="${idMatch[1]}">Label text</label> or use aria-label`,
                        });
                    }
                }
            }
        }
    });
    // Check for empty links
    const emptyLinks = html.match(/<a[^>]*>(\s*)<\/a>/gi);
    if (emptyLinks) {
        emptyLinks.forEach(link => {
            if (!/aria-label=["'][^"']+["']/.test(link)) {
                issues.push({
                    type: 'empty-link',
                    description: 'Link has no text content',
                    wcagCriteria: ['2.4.4', '4.1.2'],
                    severity: 'critical',
                    element: link,
                    suggestion: 'Add link text or aria-label',
                });
            }
        });
    }
    // Check for links with only images
    const linksWithImages = html.match(/<a[^>]*>\s*<img[^>]*>\s*<\/a>/gi);
    if (linksWithImages) {
        linksWithImages.forEach(link => {
            const hasImgAlt = /<img[^>]*\salt=["'][^"']+["']/.test(link);
            const hasAriaLabel = /aria-label=["'][^"']+["']/.test(link);
            if (!hasImgAlt && !hasAriaLabel) {
                issues.push({
                    type: 'image-link-no-alt',
                    description: 'Image link without accessible name',
                    wcagCriteria: ['1.1.1', '2.4.4'],
                    severity: 'critical',
                    element: link.substring(0, 100) + (link.length > 100 ? '...' : ''),
                    suggestion: 'Add alt text to the image or aria-label to the link',
                });
            }
        });
    }
    // Check for empty buttons
    const buttons = html.match(/<button[^>]*>[\s]*<\/button>/gi);
    if (buttons) {
        buttons.forEach(btn => {
            if (!/aria-label=["'][^"']+["']/.test(btn)) {
                issues.push({
                    type: 'empty-button',
                    description: 'Button has no text content',
                    wcagCriteria: ['4.1.2', '2.5.3'],
                    severity: 'critical',
                    element: btn,
                    suggestion: 'Add button text or aria-label',
                });
            }
        });
    }
    // Check for icon-only buttons (buttons with only SVG/icon elements)
    const iconButtons = html.match(/<button[^>]*>\s*(<svg[^>]*>[\s\S]*?<\/svg>|<i[^>]*><\/i>|<span[^>]*class=["'][^"']*icon[^"']*["'][^>]*><\/span>)\s*<\/button>/gi);
    if (iconButtons) {
        iconButtons.forEach(btn => {
            if (!/aria-label=["'][^"']+["']/.test(btn)) {
                issues.push({
                    type: 'icon-button-no-label',
                    description: 'Icon-only button missing accessible name',
                    wcagCriteria: ['4.1.2', '2.5.3'],
                    severity: 'critical',
                    element: btn.substring(0, 100) + (btn.length > 100 ? '...' : ''),
                    suggestion: 'Add aria-label or visually hidden text',
                });
            }
        });
    }
    // Check for missing page language
    if (html.includes('<html') && !/<html[^>]*\slang=["'][^"']+["']/.test(html)) {
        issues.push({
            type: 'missing-lang',
            description: 'HTML element missing lang attribute',
            wcagCriteria: ['3.1.1'],
            severity: 'serious',
            suggestion: 'Add lang attribute to html element (e.g., lang="en")',
        });
    }
    // Check for positive tabindex
    const positiveTabindex = html.match(/tabindex=["']([1-9]\d*)["']/gi);
    if (positiveTabindex) {
        issues.push({
            type: 'positive-tabindex',
            description: 'Positive tabindex values can break navigation order',
            wcagCriteria: ['2.4.3'],
            severity: 'serious',
            element: positiveTabindex[0],
            suggestion: 'Use tabindex="0" or "-1" only. Rely on DOM order for focus sequence.',
        });
    }
    // Check for autoplaying media
    if (/<(video|audio)[^>]*\sautoplay/i.test(html)) {
        issues.push({
            type: 'autoplay-media',
            description: 'Media element has autoplay attribute',
            wcagCriteria: ['1.4.2'],
            severity: 'serious',
            suggestion: 'Avoid autoplay or ensure user can pause/stop within 3 seconds',
        });
    }
    // Check for missing skip link (if nav is present but no skip link)
    if (/<nav/i.test(html) && !/<a[^>]*href=["']#(main|content|skip)[^"']*["']/i.test(html)) {
        issues.push({
            type: 'missing-skip-link',
            description: 'Navigation present but no skip link found',
            wcagCriteria: ['2.4.1'],
            severity: 'moderate',
            suggestion: 'Add a skip link at the beginning: <a href="#main">Skip to main content</a>',
        });
    }
    // Check for onclick on non-interactive elements
    const divOnclick = html.match(/<(div|span)[^>]*\sonclick=["'][^"']+["'][^>]*>/gi);
    if (divOnclick) {
        divOnclick.forEach(el => {
            if (!/role=["'](button|link)["']/.test(el) && !/tabindex=["']\d["']/.test(el)) {
                issues.push({
                    type: 'non-interactive-onclick',
                    description: 'Non-interactive element has onclick handler',
                    wcagCriteria: ['2.1.1', '4.1.2'],
                    severity: 'critical',
                    element: el.substring(0, 80) + (el.length > 80 ? '...' : ''),
                    suggestion: 'Use <button> element, or add role="button" tabindex="0" and keyboard handlers',
                });
            }
        });
    }
    // Check for missing table headers
    if (/<table/i.test(html) && !/<th/i.test(html)) {
        if (!/<table[^>]*role=["']presentation["']/i.test(html)) {
            issues.push({
                type: 'table-missing-headers',
                description: 'Data table appears to be missing header cells',
                wcagCriteria: ['1.3.1'],
                severity: 'serious',
                suggestion: 'Add <th> elements with scope attribute for header cells',
            });
        }
    }
    return issues;
}
function formatIssues(issues, context) {
    if (issues.length === 0) {
        return '## No accessibility issues detected\n\nThe HTML snippet passed basic pattern checks. Note: This is not a comprehensive audit - manual testing and automated tools like axe-core are recommended for full coverage.';
    }
    const lines = [
        `## Found ${issues.length} potential accessibility issue${issues.length > 1 ? 's' : ''}`,
        '',
    ];
    if (context) {
        lines.push(`**Context:** ${context}`);
        lines.push('');
    }
    // Group by severity
    const bySeverity = {
        critical: issues.filter(i => i.severity === 'critical'),
        serious: issues.filter(i => i.severity === 'serious'),
        moderate: issues.filter(i => i.severity === 'moderate'),
        minor: issues.filter(i => i.severity === 'minor'),
    };
    for (const [severity, sevIssues] of Object.entries(bySeverity)) {
        if (sevIssues.length === 0)
            continue;
        lines.push(`### ${severity.charAt(0).toUpperCase() + severity.slice(1)} (${sevIssues.length})`);
        lines.push('');
        sevIssues.forEach((issue, idx) => {
            lines.push(`**${idx + 1}. ${issue.description}**`);
            lines.push(`- Type: \`${issue.type}\``);
            lines.push(`- WCAG: ${issue.wcagCriteria.join(', ')}`);
            if (issue.element) {
                lines.push(`- Element: \`${issue.element}\``);
            }
            lines.push(`- Fix: ${issue.suggestion}`);
            lines.push('');
        });
    }
    lines.push('---');
    lines.push('*Note: This is pattern-based detection. Use tools like axe-core for comprehensive testing.*');
    return lines.join('\n');
}
export async function checkPattern(args) {
    const { html, context } = args;
    if (!html || html.trim().length === 0) {
        return 'Error: No HTML provided. Please provide an HTML snippet to check.';
    }
    const issues = checkForIssues(html, context);
    return formatIssues(issues, context);
}
//# sourceMappingURL=check-pattern.js.map