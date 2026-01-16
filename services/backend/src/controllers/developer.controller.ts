import { Request, Response } from "express";
import { Types } from "mongoose";
import { CommitModel } from "../models/commit.model";
import { PRModel } from "../models/pr.model";
import { UserModel } from "../models/user.model";

export const getDevelopers = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId is required" });
    }

    const now = new Date();
    const last30 = new Date(now);
    last30.setDate(last30.getDate() - 30);

    const last7 = new Date(now);
    last7.setDate(last7.getDate() - 7);

    const orgObjectId = new Types.ObjectId(orgId);

    const [commits30Agg, commits7Agg, prAgg, reviewDocs] = await Promise.all([
      CommitModel.aggregate([
        {
          $match: {
            orgId: orgObjectId,
            timestamp: { $gte: last30 },
            authorGithubId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$authorGithubId",
            commits: { $sum: 1 },
          },
        },
      ]),
      CommitModel.aggregate([
        {
          $match: {
            orgId: orgObjectId,
            timestamp: { $gte: last7 },
            authorGithubId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$authorGithubId",
            commits: { $sum: 1 },
          },
        },
      ]),
      PRModel.aggregate([
        {
          $match: {
            orgId: orgObjectId,
            authorGithubId: { $ne: null },
            createdAt: { $gte: last30 },
          },
        },
        {
          $group: {
            _id: "$authorGithubId",
            prs: { $sum: 1 },
          },
        },
      ]),
      PRModel.find({
        orgId: orgObjectId,
        reviewers: { $exists: true, $ne: [] },
        updatedAt: { $gte: last30 },
      })
        .select("reviewers")
        .lean(),
    ]);

    const commit30Map = new Map<string, number>();
    commits30Agg.forEach((entry) => {
      if (!entry?._id) return;
      commit30Map.set(String(entry._id), entry.commits ?? 0);
    });

    const commit7Map = new Map<string, number>();
    commits7Agg.forEach((entry) => {
      if (!entry?._id) return;
      commit7Map.set(String(entry._id), entry.commits ?? 0);
    });

    const prMap = new Map<string, number>();
    prAgg.forEach((entry) => {
      if (!entry?._id) return;
      prMap.set(String(entry._id), entry.prs ?? 0);
    });

    const reviewMap = new Map<string, number>();
    reviewDocs.forEach((doc) => {
      const reviewers = Array.isArray(doc?.reviewers) ? doc.reviewers : [];
      reviewers.forEach((reviewer: any) => {
        const candidate =
          typeof reviewer === "string"
            ? reviewer
            : typeof reviewer?.login === "string"
              ? reviewer.login
              : typeof reviewer?.githubId === "string"
                ? reviewer.githubId
                : undefined;

        if (!candidate) return;
        const key = String(candidate);
        reviewMap.set(key, (reviewMap.get(key) ?? 0) + 1);
      });
    });

    const allIds = new Set<string>();
    [commit30Map, commit7Map, prMap, reviewMap].forEach((map) => {
      Array.from(map.keys()).forEach((id) => {
        if (id) allIds.add(id);
      });
    });

    const developerIds = Array.from(allIds);

    const users = developerIds.length
      ? await UserModel.find({ githubId: { $in: developerIds } })
        .select("githubId name login avatarUrl role")
        .lean()
      : [];

    const userMap = new Map(users.map((u: any) => [String(u.githubId), u]));

    const maxWeeklyCommits = developerIds.reduce((max, id) => {
      const count = commit7Map.get(id) ?? 0;
      return count > max ? count : max;
    }, 0);

    const resolveFallbackAvatar = (githubId: string | undefined) => {
      if (!githubId) return undefined;
      const isNumeric = !Number.isNaN(Number(githubId));
      return isNumeric
        ? `https://avatars.githubusercontent.com/u/${githubId}`
        : `https://github.com/${githubId}.png`;
    };

    const devList = developerIds
      .map((githubId) => {
        const user = userMap.get(githubId);
        const commits = commit30Map.get(githubId) ?? 0;
        const weeklyCommits = commit7Map.get(githubId) ?? 0;
        const prs = prMap.get(githubId) ?? 0;
        const reviews = reviewMap.get(githubId) ?? 0;

        const weeklyActivity = maxWeeklyCommits
          ? Math.min(Math.round((weeklyCommits / maxWeeklyCommits) * 100), 100)
          : 0;

        return {
          githubId,
          name: user?.name || user?.login || githubId,
          avatarUrl: user?.avatarUrl || resolveFallbackAvatar(githubId),
          role: user?.role || "dev",
          weeklyActivity,
          commits,
          prs,
          reviews,
        };
      })
      .sort((a, b) => b.weeklyActivity - a.weeklyActivity || b.commits - a.commits);

    return res.json({ success: true, data: devList });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

export const getDeveloperProfile = async (req: Request, res: Response) => {
  try {
    const { orgId, developerId } = req.params;

    if (!orgId || !developerId) {
      return res.status(400).json({
        success: false,
        message: "orgId and developerId are required"
      });
    }

    const orgObjectId = new Types.ObjectId(orgId);

    // Fetch developer's commits
    const commits = await CommitModel.find({
      orgId: orgObjectId,
      authorGithubId: developerId
    })
      .sort({ timestamp: -1 })
      .select("message timestamp repoId filesChangedCount")
      .populate("repoId", "repoName")
      .lean();

    // Fetch developer's PRs
    const prs = await PRModel.find({
      orgId: orgObjectId,
      authorGithubId: developerId
    })
      .sort({ createdAt: -1 })
      .select("title number state createdAt mergedAt repoId")
      .populate("repoId", "repoName")
      .lean();

    // Get user info
    const user = await UserModel.findOne({ githubId: developerId })
      .select("githubId name login avatarUrl role email createdAt")
      .lean();

    // Calculate metrics
    const totalCommits = commits.length;
    const totalPRs = prs.length;

    // Get commits from last week for trend
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const lastWeekCommits = commits.filter(c => c.timestamp && new Date(c.timestamp) >= oneWeekAgo).length;
    const prevWeekCommits = commits.filter(c => {
      if (!c.timestamp) return false;
      const date = new Date(c.timestamp);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    const commitsChange = prevWeekCommits > 0
      ? `${((lastWeekCommits - prevWeekCommits) / prevWeekCommits * 100).toFixed(0)}%`
      : "+0%";

    // Calculate PR trends
    const lastWeekPRs = prs.filter(p => p.createdAt && new Date(p.createdAt) >= oneWeekAgo).length;
    const prevWeekPRs = prs.filter(p => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    const prsChange = prevWeekPRs > 0
      ? `${((lastWeekPRs - prevWeekPRs) / prevWeekPRs * 100).toFixed(0)}%`
      : "+0%";

    // Calculate contribution activity (last 52 weeks)
    const contributionActivity: Array<{ date: string; count: number }> = [];
    const today = new Date();
    for (let i = 51; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = commits.filter(c => {
        if (!c.timestamp) return false;
        const commitDate = new Date(c.timestamp);
        return commitDate >= weekStart && commitDate < weekEnd;
      }).length;

      contributionActivity.push({
        date: weekStart.toISOString().split('T')[0],
        count
      });
    }

    // Get recent activity (last 10 items)
    const recentActivity: any[] = [];

    commits.slice(0, 5).forEach((commit: any) => {
      recentActivity.push({
        type: "commit",
        message: commit.message,
        repo: commit.repoId?.repoName || "unknown",
        timestamp: commit.timestamp
      });
    });

    prs.slice(0, 5).forEach((pr: any) => {
      recentActivity.push({
        type: pr.state === "merged" ? "pr_merged" : "pr_opened",
        message: pr.title,
        repo: pr.repoId?.repoName || "unknown",
        timestamp: pr.createdAt,
        prNumber: pr.number
      });
    });

    // Sort by timestamp
    recentActivity.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get active repositories
    const repoCommitCounts: Record<string, { commits: number; prs: number; name: string }> = {};

    commits.forEach((commit: any) => {
      const repoName = commit.repoId?.repoName || "unknown";
      if (!repoCommitCounts[repoName]) {
        repoCommitCounts[repoName] = { commits: 0, prs: 0, name: repoName };
      }
      repoCommitCounts[repoName].commits++;
    });

    prs.forEach((pr: any) => {
      const repoName = pr.repoId?.repoName || "unknown";
      if (!repoCommitCounts[repoName]) {
        repoCommitCounts[repoName] = { commits: 0, prs: 0, name: repoName };
      }
      repoCommitCounts[repoName].prs++;
    });

    const activeRepos = Object.values(repoCommitCounts)
      .sort((a, b) => (b.commits + b.prs) - (a.commits + a.prs))
      .slice(0, 5)
      .map(repo => ({
        name: repo.name,
        role: "Contributor",
        commits: repo.commits,
        prs: repo.prs
      }));

    // Calculate code reviews (count PRs where this developer is a reviewer)
    const reviewedPRs = await PRModel.find({
      orgId: orgObjectId,
      reviewers: { $exists: true, $ne: [] }
    })
      .select("reviewers createdAt mergedAt lastReviewAt")
      .lean();

    let codeReviews = 0;
    let lastWeekReviews = 0;
    let prevWeekReviews = 0;
    let totalReviewTimeHours = 0;
    let reviewedPRsCount = 0;

    reviewedPRs.forEach((pr: any) => {
      const reviewers = Array.isArray(pr?.reviewers) ? pr.reviewers : [];
      const isReviewer = reviewers.some((reviewer: any) => {
        const candidate =
          typeof reviewer === "string"
            ? reviewer
            : typeof reviewer?.login === "string"
              ? reviewer.login
              : typeof reviewer?.githubId === "string"
                ? reviewer.githubId
                : undefined;
        return candidate === developerId;
      });

      if (isReviewer) {
        codeReviews++;

        // Count for trend calculation
        if (pr.createdAt) {
          const prDate = new Date(pr.createdAt);
          if (prDate >= oneWeekAgo) {
            lastWeekReviews++;
          } else if (prDate >= twoWeeksAgo && prDate < oneWeekAgo) {
            prevWeekReviews++;
          }
        }

        // Calculate review time (createdAt to mergedAt or lastReviewAt)
        if (pr.createdAt) {
          const createdTime = new Date(pr.createdAt).getTime();
          let completionTime: number | null = null;

          if (pr.mergedAt) {
            completionTime = new Date(pr.mergedAt).getTime();
          } else if (pr.lastReviewAt) {
            completionTime = new Date(pr.lastReviewAt).getTime();
          }

          if (completionTime && completionTime > createdTime) {
            const reviewTimeMs = completionTime - createdTime;
            const reviewTimeHours = reviewTimeMs / (1000 * 60 * 60);
            totalReviewTimeHours += reviewTimeHours;
            reviewedPRsCount++;
          }
        }
      }
    });

    const reviewsChange = prevWeekReviews > 0
      ? `${((lastWeekReviews - prevWeekReviews) / prevWeekReviews * 100).toFixed(0)}%`
      : lastWeekReviews > 0 ? "+100%" : "+0%";

    // Calculate average review time
    let avgReviewTime = "N/A";
    if (reviewedPRsCount > 0) {
      const avgHours = totalReviewTimeHours / reviewedPRsCount;
      if (avgHours < 1) {
        avgReviewTime = `${Math.round(avgHours * 60)}m`;
      } else if (avgHours < 24) {
        avgReviewTime = `${avgHours.toFixed(1)}h`;
      } else {
        const days = avgHours / 24;
        avgReviewTime = `${days.toFixed(1)}d`;
      }
    }

    // Calculate weekly activity percentage (based on commits in last 7 days)
    const weeklyActivity = Math.min(100, Math.round((lastWeekCommits / 20) * 100));

    return res.json({
      success: true,
      data: {
        profile: {
          githubId: developerId,
          name: user?.name || user?.login || developerId,
          email: user?.email || "Not available",
          avatarUrl: user?.avatarUrl || `https://github.com/${developerId}.png`,
          joinedAt: user?.createdAt
            ? new Date(user.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          weeklyActivity
        },
        metrics: {
          totalCommits,
          commitsChange,
          totalPRs,
          prsChange,
          codeReviews,
          reviewsChange,
          avgReviewTime,
          reviewTimeChange: "+0%"
        },
        contributionActivity,
        recentActivity: recentActivity.slice(0, 10),
        activeRepos
      }
    });
  } catch (err) {
    console.error("getDeveloperProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch developer profile"
    });
  }
};

