import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let wcagData = null;
export function loadCriteria() {
    if (wcagData) {
        return wcagData;
    }
    const dataPath = join(__dirname, '../data/wcag-criteria.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    wcagData = JSON.parse(rawData);
    return wcagData;
}
export function findByNumber(criterionId) {
    const data = loadCriteria();
    const normalized = criterionId.replace(/^wcag/i, '').trim();
    return data.criteria.find(c => c.id === normalized) || null;
}
export function findByKeyword(keyword) {
    const data = loadCriteria();
    const lowerKeyword = keyword.toLowerCase();
    return data.criteria.filter(c => c.name.toLowerCase().includes(lowerKeyword) ||
        c.description.toLowerCase().includes(lowerKeyword) ||
        c.guideline.toLowerCase().includes(lowerKeyword) ||
        c.tests.some(t => t.toLowerCase().includes(lowerKeyword)));
}
export function findByLevel(level) {
    const data = loadCriteria();
    return data.criteria.filter(c => c.level === level);
}
export function findByPrinciple(principle) {
    const data = loadCriteria();
    const lowerPrinciple = principle.toLowerCase();
    return data.criteria.filter(c => c.principle.toLowerCase().includes(lowerPrinciple));
}
export function getAllCriteria() {
    const data = loadCriteria();
    return data.criteria;
}
export function getMetadata() {
    const data = loadCriteria();
    return data.metadata;
}
//# sourceMappingURL=wcag-service.js.map