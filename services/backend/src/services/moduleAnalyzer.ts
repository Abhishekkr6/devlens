import { CommitModel } from "../models/commit.model";
import logger from "../utils/logger";

/**
 * Module Analyzer Service
 * 
 * Analyzes commit files and assigns module paths based on file patterns.
 * This replaces the background worker processing with inline synchronous analysis.
 * 
 * @module services/moduleAnalyzer
 */

interface CommitDocument {
    _id: any;
    files?: string[];
    message?: string;
}

/**
 * Analyzes an array of commits and updates them with module path information
 * 
 * @param commits - Array of commit documents to analyze
 * @returns Promise that resolves when all commits are processed
 * 
 * @example
 * ```typescript
 * const commits = await CommitModel.find({ processed: false });
 * await analyzeCommitModules(commits);
 * ```
 */
export async function analyzeCommitModules(commits: CommitDocument[]): Promise<void> {
    if (!commits || commits.length === 0) {
        logger.debug("No commits to analyze");
        return;
    }

    try {
        const analysisPromises = commits.map(async (commit) => {
            // Skip commits without files
            if (!commit.files || commit.files.length === 0) {
                return;
            }

            const moduleSet = new Set<string>();

            // Analyze each file path to determine which modules are affected
            commit.files.forEach((filePath: string) => {
                // Frontend module detection
                if (filePath.startsWith("apps/frontend")) {
                    moduleSet.add("frontend");
                }

                // Backend module detection
                if (filePath.startsWith("services/backend")) {
                    moduleSet.add("backend");
                }

                // Authentication module detection
                if (filePath.includes("auth")) {
                    moduleSet.add("auth");
                }

                // Database/Models module detection
                if (filePath.includes("database") || filePath.includes("models")) {
                    moduleSet.add("database");
                }

                // UI Components module detection
                if (filePath.includes("components")) {
                    moduleSet.add("ui");
                }

                // Worker module detection
                if (filePath.includes("worker")) {
                    moduleSet.add("worker");
                }

                // API module detection
                if (filePath.includes("api") || filePath.includes("routes")) {
                    moduleSet.add("api");
                }

                // Configuration module detection
                if (filePath.includes("config") || filePath.includes(".env")) {
                    moduleSet.add("config");
                }

                // Documentation module detection
                if (filePath.includes("docs") || filePath.includes("README")) {
                    moduleSet.add("docs");
                }

                // Testing module detection
                if (filePath.includes("test") || filePath.includes("spec")) {
                    moduleSet.add("testing");
                }
            });

            // Update commit with analyzed module paths
            await CommitModel.findByIdAndUpdate(
                commit._id,
                {
                    modulePaths: Array.from(moduleSet),
                    processed: true,
                },
                { new: true }
            );
        });

        // Process all commits in parallel for better performance
        await Promise.all(analysisPromises);

        logger.info(
            {
                commitCount: commits.length,
                totalModules: new Set(commits.flatMap(c => c.files || [])).size
            },
            "Module analysis completed successfully (inline processing)"
        );
    } catch (err) {
        logger.error(
            {
                err: err instanceof Error ? err.message : String(err),
                commitCount: commits.length
            },
            "Module analysis failed - commits saved but not analyzed"
        );

        // Don't throw error - webhook should succeed even if analysis fails
        // This ensures webhook delivery is acknowledged to GitHub
    }
}

/**
 * Analyzes a single commit and updates it with module path information
 * 
 * @param commit - Single commit document to analyze
 * @returns Promise that resolves when commit is processed
 */
export async function analyzeCommitModule(commit: CommitDocument): Promise<void> {
    return analyzeCommitModules([commit]);
}
