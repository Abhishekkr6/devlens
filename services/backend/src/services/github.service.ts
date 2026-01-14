import axios from "axios";

export const exchangeCodeForToken = async (code: string) => {
  if (!code) {
    throw new Error("Missing OAuth code");
  }
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing GitHub OAuth env (GITHUB_CLIENT_ID/SECRET)");
  }
  try {
    const res = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
      },
      {
        headers: { Accept: "application/json" },
      }
    );
    if (!res.data?.access_token) {
      const errMsg = `No access_token in response: ${JSON.stringify(res.data)}`;
      throw new Error(errMsg);
    }
    return res.data.access_token;
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const detail = `GitHub token exchange failed${status ? ` (status ${status})` : ""}: ${data ? JSON.stringify(data) : error?.message}`;
    const wrapped = new Error(detail);
    (wrapped as any).cause = error;
    throw wrapped;
  }
};

export const getGithubUser = async (token: string) => {
  if (!token) throw new Error("Missing GitHub access token");
  try {
    const res = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${token}` },
    });
    return res.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    throw new Error(`GitHub user fetch failed${status ? ` (status ${status})` : ""}: ${data ? JSON.stringify(data) : error?.message}`);
  }
};

export const getGithubEmail = async (token: string) => {
  if (!token) throw new Error("Missing GitHub access token");
  try {
    const res = await axios.get("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${token}` },
    });
    return res.data.find((e: any) => e.primary)?.email;
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    throw new Error(`GitHub email fetch failed${status ? ` (status ${status})` : ""}: ${data ? JSON.stringify(data) : error?.message}`);
  }
};

export const verifyRepositoryExists = async (repoFullName: string, token: string) => {
  if (!repoFullName) throw new Error("Missing repository name");
  if (!token) throw new Error("Missing GitHub access token");

  try {
    const res = await axios.get(`https://api.github.com/repos/${repoFullName}`, {
      headers: { Authorization: `token ${token}` },
    });
    return {
      exists: true,
      repo: res.data,
    };
  } catch (error: any) {
    const status = error?.response?.status;

    // 404 means repo doesn't exist
    if (status === 404) {
      return {
        exists: false,
        reason: "Repository not found",
      };
    }

    // 403 means forbidden (might be permission issue)
    if (status === 403) {
      return {
        exists: false,
        reason: "Access denied. Make sure you have permission to access this repository.",
      };
    }

    // Other errors
    const data = error?.response?.data;
    throw new Error(`GitHub repository verification failed${status ? ` (status ${status})` : ""}: ${data ? JSON.stringify(data) : error?.message}`);
  }
};

/**
 * Create a webhook on a GitHub repository
 * @param repoFullName - Full repository name (owner/repo)
 * @param token - GitHub access token (requires admin:repo_hook scope)
 * @param webhookUrl - The URL GitHub should send webhook events to
 * @param secret - Webhook secret for signature validation
 * @returns Object with success status, webhook ID, or error message
 */
export const createRepositoryWebhook = async (
  repoFullName: string,
  token: string,
  webhookUrl: string,
  secret: string
): Promise<{ success: boolean; webhookId?: number; error?: string }> => {
  if (!repoFullName) throw new Error("Missing repository name");
  if (!token) throw new Error("Missing GitHub access token");
  if (!webhookUrl) throw new Error("Missing webhook URL");
  if (!secret) throw new Error("Missing webhook secret");

  try {
    const res = await axios.post(
      `https://api.github.com/repos/${repoFullName}/hooks`,
      {
        name: "web",
        active: true,
        events: ["push", "pull_request"],
        config: {
          url: webhookUrl,
          content_type: "json",
          secret: secret,
          insecure_ssl: "0",
        },
      },
      {
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return {
      success: true,
      webhookId: res.data.id,
    };
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;

    // 403 usually means insufficient permissions
    if (status === 403) {
      return {
        success: false,
        error: "Insufficient permissions. Please ensure the GitHub token has 'admin:repo_hook' scope.",
      };
    }

    // 404 means repo doesn't exist or no access
    if (status === 404) {
      return {
        success: false,
        error: "Repository not found or no access.",
      };
    }

    // 422 might mean webhook already exists
    if (status === 422) {
      return {
        success: false,
        error: "Webhook may already exist or validation failed.",
      };
    }

    return {
      success: false,
      error: `Webhook creation failed: ${data?.message || error?.message || "Unknown error"}`,
    };
  }
};

/**
 * Fetch all repositories accessible to the authenticated user
 * @param token - GitHub access token
 * @returns Array of repository objects
 */
export const getUserRepositories = async (token: string) => {
  if (!token) throw new Error("Missing GitHub access token");

  try {
    const res = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `token ${token}` },
      params: {
        per_page: 100,
        sort: 'updated',
        affiliation: 'owner,collaborator,organization_member'
      }
    });
    return res.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    throw new Error(`GitHub repos fetch failed${status ? ` (status ${status})` : ""}: ${data ? JSON.stringify(data) : error?.message}`);
  }
};

