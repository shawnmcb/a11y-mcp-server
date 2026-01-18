import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { lookupWcag, lookupWcagInputSchema } from './tools/lookup-wcag.js';
import { checkPattern, checkPatternInputSchema } from './tools/check-pattern.js';
import { suggestFix, suggestFixInputSchema } from './tools/suggest-fix.js';
import { documentComponent, documentComponentInputSchema } from './tools/document-component.js';
import { auditSummary, auditSummaryInputSchema } from './tools/audit-summary.js';
const PORT = process.env.PORT || 8080;
const server = new McpServer({
    name: 'a11y-mcp-server',
    version: '1.0.0',
});
// Register a11y_lookup_wcag tool
server.tool('a11y_lookup_wcag', 'Look up WCAG criteria by number, keyword, or level. Returns criterion details including description, techniques, failures, and test suggestions.', lookupWcagInputSchema, async (args) => {
    const result = await lookupWcag(args);
    return {
        content: [{ type: 'text', text: result }],
    };
});
// Register a11y_check_pattern tool
server.tool('a11y_check_pattern', 'Analyze HTML code snippet for common accessibility issues. Returns list of issues with WCAG references and fix suggestions.', checkPatternInputSchema, async (args) => {
    const result = await checkPattern(args);
    return {
        content: [{ type: 'text', text: result }],
    };
});
// Register a11y_suggest_fix tool
server.tool('a11y_suggest_fix', 'Get remediation patterns for accessibility issues. Includes before/after code examples and related patterns.', suggestFixInputSchema, async (args) => {
    const result = await suggestFix(args);
    return {
        content: [{ type: 'text', text: result }],
    };
});
// Register a11y_document_component tool
server.tool('a11y_document_component', 'Generate accessibility documentation for UI components. Includes keyboard interactions, ARIA attributes, and screen reader expectations.', documentComponentInputSchema, async (args) => {
    const result = await documentComponent(args);
    return {
        content: [{ type: 'text', text: result }],
    };
});
// Register a11y_audit_summary tool
server.tool('a11y_audit_summary', 'Generate an accessibility audit report from a list of issues. Includes executive summary, severity analysis, and remediation priorities.', auditSummaryInputSchema, async (args) => {
    const result = await auditSummary(args);
    return {
        content: [{ type: 'text', text: result }],
    };
});
// Express app setup
const app = express();
app.use(express.json());
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', server: 'a11y-mcp-server', version: '1.0.0' });
});
// MCP endpoint
app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
    });
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});
app.listen(PORT, () => {
    console.log(`a11y-mcp-server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
});
//# sourceMappingURL=index.js.map