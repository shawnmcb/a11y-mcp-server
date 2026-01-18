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
export declare function loadCriteria(): WcagData;
export declare function findByNumber(criterionId: string): WcagCriterion | null;
export declare function findByKeyword(keyword: string): WcagCriterion[];
export declare function findByLevel(level: 'A' | 'AA' | 'AAA'): WcagCriterion[];
export declare function findByPrinciple(principle: string): WcagCriterion[];
export declare function getAllCriteria(): WcagCriterion[];
export declare function getMetadata(): {
    version: string;
    lastUpdated: string;
    source: string;
};
//# sourceMappingURL=wcag-service.d.ts.map