import logger from '../../utils/logger';

interface CodeQualityMetrics {
    maintainabilityIndex: number; // 0-100
    cyclomaticComplexity: number;
    linesOfCode: number;
    codeSmells: number;
    technicalDebtMinutes: number;
    halsteadMetrics: {
        volume: number;
        difficulty: number;
        effort: number;
    };
    grade: string;
}

interface FileAnalysis {
    path: string;
    content: string;
    language: string;
}

export class QualityMetricsService {
    async analyzeCodeQuality(files: FileAnalysis[]): Promise<CodeQualityMetrics> {
        try {
            const totalLines = this.countLinesOfCode(files);
            const complexity = this.calculateCyclomaticComplexity(files);
            const codeSmells = this.detectCodeSmells(files);
            const halstead = this.calculateHalsteadMetrics(files);
            const maintainability = this.calculateMaintainabilityIndex(totalLines, complexity, halstead.volume);
            const technicalDebt = this.estimateTechnicalDebt(codeSmells, complexity);

            return {
                maintainabilityIndex: maintainability,
                cyclomaticComplexity: complexity,
                linesOfCode: totalLines,
                codeSmells,
                technicalDebtMinutes: technicalDebt,
                halsteadMetrics: halstead,
                grade: this.getQualityGrade(maintainability)
            };
        } catch (error) {
            logger.error({ error }, 'Quality metrics calculation error');
            throw error;
        }
    }

    private countLinesOfCode(files: FileAnalysis[]): number {
        let totalLines = 0;

        files.forEach(file => {
            const lines = file.content.split('\n');
            const codeLines = lines.filter(line => {
                const trimmed = line.trim();
                return trimmed.length > 0 &&
                    !trimmed.startsWith('//') &&
                    !trimmed.startsWith('/*') &&
                    !trimmed.startsWith('*') &&
                    !trimmed.startsWith('#');
            });
            totalLines += codeLines.length;
        });

        return totalLines;
    }

    private calculateCyclomaticComplexity(files: FileAnalysis[]): number {
        let totalComplexity = 0;

        files.forEach(file => {
            const content = file.content;

            const ifCount = (content.match(/\bif\b/g) || []).length;
            const elseIfCount = (content.match(/\belse\s+if\b/g) || []).length;
            const forCount = (content.match(/\bfor\b/g) || []).length;
            const whileCount = (content.match(/\bwhile\b/g) || []).length;
            const caseCount = (content.match(/\bcase\b/g) || []).length;
            const catchCount = (content.match(/\bcatch\b/g) || []).length;
            const ternaryCount = (content.match(/\?[^:]*:/g) || []).length;
            const andCount = (content.match(/&&/g) || []).length;
            const orCount = (content.match(/\|\|/g) || []).length;

            const fileComplexity = 1 + ifCount + elseIfCount + forCount + whileCount +
                caseCount + catchCount + ternaryCount + andCount + orCount;

            totalComplexity += fileComplexity;
        });

        return totalComplexity;
    }

    private detectCodeSmells(files: FileAnalysis[]): number {
        let smellCount = 0;

        files.forEach(file => {
            const content = file.content;
            const lines = content.split('\n');

            const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)\s*{/g) || [];
            const arrowFunctionMatches = content.match(/=\s*\([^)]*\)\s*=>\s*{/g) || [];
            const totalFunctions = functionMatches.length + arrowFunctionMatches.length;

            // Estimate long functions (simplified)
            const avgLinesPerFunction = lines.length / Math.max(totalFunctions, 1);
            if (avgLinesPerFunction > 50) {
                smellCount += Math.floor(totalFunctions / 2);
            }

            const deepNesting = (content.match(/{[^}]*{[^}]*{[^}]*{/g) || []).length;
            smellCount += deepNesting;

            const magicNumbers = (content.match(/\b(?!0\b|1\b|-1\b)\d{2,}\b/g) || []).length;
            smellCount += Math.floor(magicNumbers / 3);

            const longParamLists = (content.match(/\([^)]*,\s*[^)]*,\s*[^)]*,\s*[^)]*,\s*[^)]*\)/g) || []).length;
            smellCount += longParamLists;

            const lineMap = new Map<string, number>();
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.length > 20) {
                    lineMap.set(trimmed, (lineMap.get(trimmed) || 0) + 1);
                }
            });
            const duplicates = Array.from(lineMap.values()).filter(count => count > 2).length;
            smellCount += duplicates;

            if (lines.length > 500) {
                smellCount += Math.floor(lines.length / 500);
            }

            const todoCount = (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi) || []).length;
            smellCount += todoCount;

            if (file.language === 'typescript' || file.language === 'javascript') {
                const consoleCount = (content.match(/console\.(log|debug|info)/g) || []).length;
                smellCount += consoleCount;
            }

            // 9. Empty catch blocks
            const emptyCatch = (content.match(/catch\s*\([^)]*\)\s*{\s*}/g) || []).length;
            smellCount += emptyCatch * 2; // Empty catch is serious

            // 10. Large switch statements (>10 cases)
            const switchMatches = content.match(/switch\s*\([^)]*\)\s*{([^}]*)}/g) || [];
            switchMatches.forEach(switchBlock => {
                const caseCount = (switchBlock.match(/\bcase\b/g) || []).length;
                if (caseCount > 10) {
                    smellCount += 1;
                }
            });
        });

        return smellCount;
    }

    private calculateHalsteadMetrics(files: FileAnalysis[]): {
        volume: number;
        difficulty: number;
        effort: number;
    } {
        let totalOperators = 0;
        let totalOperands = 0;
        let uniqueOperators = new Set<string>();
        let uniqueOperands = new Set<string>();

        const operatorPatterns = [
            /[+\-*/%=<>!&|^~]/g,
            /\b(if|else|for|while|switch|case|return|throw|new|typeof|instanceof)\b/g
        ];

        const operandPatterns = [
            /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g,
            /\b\d+(\.\d+)?\b/g,
            /"[^"]*"|'[^']*'|`[^`]*`/g
        ];

        files.forEach(file => {
            const content = file.content;

            // Count operators
            operatorPatterns.forEach(pattern => {
                const matches = content.match(pattern) || [];
                totalOperators += matches.length;
                matches.forEach(op => uniqueOperators.add(op));
            });

            // Count operands
            operandPatterns.forEach(pattern => {
                const matches = content.match(pattern) || [];
                totalOperands += matches.length;
                matches.forEach(op => uniqueOperands.add(op));
            });
        });

        const n1 = uniqueOperators.size; // Unique operators
        const n2 = uniqueOperands.size;  // Unique operands
        const N1 = totalOperators;       // Total operators
        const N2 = totalOperands;        // Total operands

        // Halstead metrics
        const vocabulary = n1 + n2;
        const length = N1 + N2;
        const volume = length * Math.log2(vocabulary || 1);
        const difficulty = (n1 / 2) * (N2 / (n2 || 1));
        const effort = volume * difficulty;

        return {
            volume: Math.round(volume),
            difficulty: Math.round(difficulty * 100) / 100,
            effort: Math.round(effort)
        };
    }

    private calculateMaintainabilityIndex(
        linesOfCode: number,
        complexity: number,
        volume: number
    ): number {
        const loc = Math.max(linesOfCode, 1);
        const vol = Math.max(volume, 1);
        const comp = Math.max(complexity, 1);

        const mi = 171 - 5.2 * Math.log(vol) - 0.23 * comp - 16.2 * Math.log(loc);

        // Normalize to 0-100 scale
        const normalized = Math.max(0, Math.min(100, (mi / 171) * 100));

        return Math.round(normalized);
    }

    private estimateTechnicalDebt(codeSmells: number, complexity: number): number {
        const smellDebt = codeSmells * 15;
        const complexityDebt = Math.max(0, (complexity - 10)) * 5;

        return Math.round(smellDebt + complexityDebt);
    }

    getQualityGrade(maintainabilityIndex: number): string {
        if (maintainabilityIndex >= 85) return 'A';
        if (maintainabilityIndex >= 70) return 'B';
        if (maintainabilityIndex >= 50) return 'C';
        if (maintainabilityIndex >= 25) return 'D';
        return 'F';
    }

    calculateTrend(current: number, previous: number): 'improving' | 'stable' | 'degrading' {
        const diff = current - previous;
        if (diff > 5) return 'improving';
        if (diff < -5) return 'degrading';
        return 'stable';
    }
}

let qualityMetricsServiceInstance: QualityMetricsService | null = null;

export const getQualityMetricsService = (): QualityMetricsService => {
    if (!qualityMetricsServiceInstance) {
        qualityMetricsServiceInstance = new QualityMetricsService();
    }
    return qualityMetricsServiceInstance;
};
