import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface WcagCriterion {
  id: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
  principle: string;
  guideline: string;
  description: string;
  techniques: string[];
  failures: string[];
  tests: string[];
}

export interface WcagData {
  metadata: {
    version: string;
    lastUpdated: string;
    source: string;
  };
  principles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  criteria: WcagCriterion[];
}

let wcagData: WcagData | null = null;

export function loadCriteria(): WcagData {
  if (wcagData) {
    return wcagData;
  }

  const dataPath = join(__dirname, '../data/wcag-criteria.json');
  const rawData = readFileSync(dataPath, 'utf-8');
  wcagData = JSON.parse(rawData) as WcagData;
  return wcagData;
}

export function findByNumber(criterionId: string): WcagCriterion | null {
  const data = loadCriteria();
  const normalized = criterionId.replace(/^wcag/i, '').trim();
  return data.criteria.find(c => c.id === normalized) || null;
}

export function findByKeyword(keyword: string): WcagCriterion[] {
  const data = loadCriteria();
  const lowerKeyword = keyword.toLowerCase();

  return data.criteria.filter(c =>
    c.name.toLowerCase().includes(lowerKeyword) ||
    c.description.toLowerCase().includes(lowerKeyword) ||
    c.guideline.toLowerCase().includes(lowerKeyword) ||
    c.tests.some(t => t.toLowerCase().includes(lowerKeyword))
  );
}

export function findByLevel(level: 'A' | 'AA' | 'AAA'): WcagCriterion[] {
  const data = loadCriteria();
  return data.criteria.filter(c => c.level === level);
}

export function findByPrinciple(principle: string): WcagCriterion[] {
  const data = loadCriteria();
  const lowerPrinciple = principle.toLowerCase();
  return data.criteria.filter(c =>
    c.principle.toLowerCase().includes(lowerPrinciple)
  );
}

export function getAllCriteria(): WcagCriterion[] {
  const data = loadCriteria();
  return data.criteria;
}

export function getMetadata() {
  const data = loadCriteria();
  return data.metadata;
}
