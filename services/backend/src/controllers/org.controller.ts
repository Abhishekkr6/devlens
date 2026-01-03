import { Request, Response } from "express";
import { Types } from "mongoose";
import { OrgModel } from "../models/org.model";
import { UserModel } from "../models/user.model";
import { createNotification } from "../services/notification.service";
import { publishEvent } from "../realtime/publisher";

/**
 * CREATE ORGANIZATION
 * - Creator becomes ADMIN
 * - Org added to user's orgIds
 * - defaultOrgId set (only if not already set)
 */
export const createOrg = async (req: any, res: Response) => {
  try {
    const { name, slug } = req.body;
    const userId = req.user?.id || req.user?._id;

    // 1️⃣ Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
    }

    // 2️⃣ Validation
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: { message: "Name and slug are required" },
      });
    }

    // 3️⃣ Slug uniqueness (IMPORTANT)
    const existingOrg = await OrgModel.findOne({ slug });
    if (existingOrg) {
      return res.status(409).json({
        success: false,
        error: { message: "Organization slug already exists" },
      });
    }

    const creatorId = new Types.ObjectId(String(userId));

    // 4️⃣ Create org with ADMIN member
    const org = await OrgModel.create({
      name,
      slug,
      createdBy: creatorId,
      members: [
        {
          userId: creatorId,
          role: "ADMIN",
          status: "active",
        },
      ],
    });

    // 5️⃣ Attach org to user
    const user = await UserModel.findById(creatorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    // Ensure orgIds exists
    if (!Array.isArray(user.orgIds)) {
      user.orgIds = [];
    }

    // Avoid duplicates
    const alreadyLinked = user.orgIds.some(
      (id: Types.ObjectId) => String(id) === String(org._id)
    );

    if (!alreadyLinked) {
      user.orgIds.push(org._id);
    }

    // Set default org ONLY if not set
    if (!user.defaultOrgId) {
      user.defaultOrgId = org._id;
    }

    await user.save();

    // 6️⃣ Response
    return res.status(201).json({
      success: true,
      data: {
        org,
        defaultOrgId: user.defaultOrgId,
      },
    });
  } catch (error) {
    console.error("CREATE ORG ERROR:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to create organization" },
    });
  }
};

export const inviteUser = async (req: any, res: Response) => {
  try {
    const { email, role } = req.body;
    const { orgId } = req.params;
    const inviterId = req.user?.id || req.user?._id;

    // 1️⃣ Validation
    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: { message: "Email and role are required" },
      });
    }

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: "Invalid role" },
      });
    }

    // 2️⃣ Find org
    const org = await OrgModel.findById(orgId);
    if (!org) {
      return res.status(404).json({
        success: false,
        error: { message: "Organization not found" },
      });
    }

    // 3️⃣ Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: "User not found" },
      });
    }

    // 4️⃣ Prevent duplicate membership
    const alreadyMember = org.members.some(
      (m: any) => String(m.userId) === String(user._id)
    );

    if (alreadyMember) {
      return res.status(409).json({
        success: false,
        error: { message: "User already a member of this organization" },
      });
    }

    // 5️⃣ Add member to org
    org.members.push({
      userId: user._id,
      role,
      status: "pending",
      invitedBy: inviterId, // Store inviter
    });

    await org.save();

    // 6️⃣ DO NOT Attach org to user yet (Wait for accept)
    // Removed the part where we push to user.orgIds immediately

    // 7️⃣ Create Notification with Metadata
    await createNotification({
      recipientId: user._id,
      type: "invite",
      title: "New Organization Invite",
      message: `You have been invited to join ${org.name} as a ${role.toLowerCase()}.`,
      metadata: {
        orgId: String(org._id),
        role: role,
      },
    });

    // 7.5️⃣ Publish Real-time Event
    await publishEvent({
      type: "org:invited",
      userId: user._id, // Target user
      org: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        createdBy: org.createdBy,
      },
    });

    // 8️⃣ Response
    return res.status(200).json({
      success: true,
      data: {
        orgId: org._id,
        userId: user._id,
        role,
      },
    });
  } catch (error) {
    console.error("INVITE USER ERROR:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to invite user" },
    });
  }
};


/**
 * GET ORGANIZATIONS FOR LOGGED-IN USER
 * - Returns orgs where user is a member
 */
export const getUserOrgs = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
    }

    const orgs = await OrgModel.find({
      members: {
        $elemMatch: {
          userId: userId,
          status: "active",
        },
      },
    }).select("_id name slug createdBy");

    return res.status(200).json({
      success: true,
      data: orgs,
    });
  } catch (error) {
    console.error("GET USER ORGS ERROR:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch organizations" },
    });
  }
};

/**
 * GET ORGANIZATION MEMBERS
 * - Returns all members of an organization with their user details
 */
export const getOrgMembers = async (req: any, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { message: "Unauthorized" },
      });
    }

    const org = await OrgModel.findById(orgId).lean();
    if (!org) {
      return res.status(404).json({
        success: false,
        error: { message: "Organization not found" },
      });
    }

    // Get member user IDs
    const memberIds = Array.isArray(org.members)
      ? org.members.map((m: any) => m.userId).filter(Boolean)
      : [];

    // Fetch user details
    const users = await UserModel.find({
      _id: { $in: memberIds },
    }).select("_id name email avatarUrl githubId login").lean();

    // Map members with their roles and user details
    const membersWithDetails = org.members.map((member: any) => {
      const user = users.find(
        (u: any) => String(u._id) === String(member.userId)
      );
      return {
        userId: String(member.userId),
        role: member.role,
        status: member.status, // Return status so frontend can filter
        user: user
          ? {
            id: String(user._id),
            name: user.name || user.login || "Unknown",
            email: user.email || "",
            avatarUrl: user.avatarUrl || "",
            githubId: user.githubId,
          }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        members: membersWithDetails,
        orgName: org.name,
        orgSlug: org.slug,
        createdBy: org.createdBy,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch organization members" },
    });
  }
};

export const removeMember = async (req: any, res: Response) => {
  try {
    const { orgId, userId } = req.params;

    const org = await OrgModel.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    // Check if trying to remove the owner
    if (String(org.createdBy) === String(userId)) {
      return res.status(400).json({ error: "Cannot remove the organization owner" });
    }

    const memberToRemove = org.members.find(m => String(m.userId) === String(userId));
    if (!memberToRemove) {
      return res.status(404).json({ error: "User not found in organization" });
    }

    // Check if removing the last admin
    if (memberToRemove.role === "ADMIN") {
      const adminCount = org.members.filter(m => m.role === "ADMIN").length;
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot remove the last administrator" });
      }
    }

    // Remove from members array
    org.members = org.members.filter(m => String(m.userId) !== String(userId));
    await org.save();

    // Remove from user's orgIds
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { orgIds: org._id }
    });

    // Publish Real-time Event (Org Removed)
    await publishEvent({
      type: "org:removed",
      userId: userId, // The removed user
      orgId: org._id,
    });

    return res.json({ success: true, message: "Member removed" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to remove member" });
  }
};

export const updateMemberRole = async (req: any, res: Response) => {
  try {
    const { orgId, userId } = req.params;
    const { role } = req.body;

    if (!["ADMIN", "MEMBER", "VIEWER"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const org = await OrgModel.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    const memberIndex = org.members.findIndex(m => String(m.userId) === String(userId));
    if (memberIndex === -1) {
      return res.status(404).json({ error: "User not in org" });
    }

    org.members[memberIndex].role = role;
    await org.save();

    return res.json({ success: true, message: "Role updated" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update role" });
  }
};



export const acceptInvite = async (req: any, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const org = await OrgModel.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    // Fetch user early to ensure existence
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find custom member
    const member = org.members.find((m) => String(m.userId) === String(userId));
    if (!member) {
      return res.status(404).json({ error: "No invite found for this organization" });
    }

    if (member.status === "active") {
      return res.status(400).json({ error: "Already a member" });
    }

    // Set to active
    member.status = "active";
    await org.save();

    // Link user
    if (!Array.isArray(user.orgIds)) user.orgIds = [];
    const exists = user.orgIds.some((id) => String(id) === String(org._id));
    if (!exists) {
      user.orgIds.push(org._id);
      if (!user.defaultOrgId) user.defaultOrgId = org._id;
      await user.save();
    }

    // Publish Real-time Event (Org Joined)
    // Publish Real-time Event (Org Joined)
    await publishEvent({
      type: "org:joined",
      userId: user._id,
      org: {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        createdBy: org.createdBy,
      },
      member: {
        userId: user._id,
        role: member.role,
        status: "active",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          githubId: user.githubId
        }
      }
    });

    // Notify Inviter
    if (member.invitedBy) {
      await createNotification({
        recipientId: member.invitedBy,
        type: "success",
        title: "Invite Accepted",
        message: `${user.name || "A user"} accepted your invite to ${org.name}.`,
        link: `/organization/${org._id}/team`,
      });
    }

    return res.status(200).json({ success: true, message: "Invite accepted" });
  } catch (error) {
    console.error("ACCEPT INVITE ERROR:", error);
    return res.status(500).json({ error: "Failed to accept invite" });
  }
};

export const rejectInvite = async (req: any, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const org = await OrgModel.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    // Remove member entry
    const member = org.members.find((m) => String(m.userId) === String(userId));
    org.members = org.members.filter((m) => String(m.userId) !== String(userId));
    await org.save();

    // Notify Inviter
    if (member?.invitedBy) {
      const user = await UserModel.findById(userId); // Fetch user name if possible, or just say 'A user'
      await createNotification({
        recipientId: member.invitedBy,
        type: "alert",
        title: "Invite Rejected",
        message: `${user?.name || "A user"} rejected your invite to ${org.name}.`,
      });
    }

    return res.status(200).json({ success: true, message: "Invite rejected" });
  } catch (error) {
    console.error("REJECT INVITE ERROR:", error);
    return res.status(500).json({ error: "Failed to reject invite" });
  }
};

export const leaveOrg = async (req: any, res: Response) => {
  try {
    const { orgId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const org = await OrgModel.findById(orgId);
    if (!org) return res.status(404).json({ error: "Org not found" });

    if (String(org.createdBy) === String(userId)) {
      return res.status(400).json({ error: "Owner cannot leave the organization" });
    }

    // Find member to check inviter
    const member = org.members.find((m) => String(m.userId) === String(userId));

    // Remove from org
    org.members = org.members.filter((m) => String(m.userId) !== String(userId));
    await org.save();

    // Remove from user
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { orgIds: org._id },
    });

    // Notify Inviter and/or Owner
    const user = await UserModel.findById(userId);
    const message = `${user?.name || "A member"} has left ${org.name}.`;

    // Notify Inviter
    if (member?.invitedBy) {
      await createNotification({
        recipientId: member.invitedBy,
        type: "info",
        title: "Member Left",
        message: message,
        link: `/organization/${org._id}/team`,
      });
    }

    // Also notify Owner if inviter is not owner (optional, but good practice)
    if (String(org.createdBy) !== String(member?.invitedBy) && String(org.createdBy) !== String(userId)) {
      await createNotification({
        recipientId: org.createdBy,
        type: "info",
        title: "Member Left",
        message: message,
        link: `/organization/${org._id}/team`,
      });
    }

    return res.status(200).json({ success: true, message: "Left organization" });
  } catch (error) {
    console.error("LEAVE ORG ERROR:", error);
    return res.status(500).json({ error: "Failed to leave organization" });
  }
};

/**
 * DELETE ORGANIZATION
 * - Deletes the organization
 * - Removes org from all users' orgIds
 */
export const deleteOrg = async (req: any, res: Response) => {
  try {
    const { orgId } = req.params;
    const creatorId = req.user?.id || req.user?._id;

    const org = await OrgModel.findById(orgId);
    if (!org) {
      return res.status(404).json({
        success: false,
        error: { message: "Organization not found" }
      });
    }

    // Only owner can delete (or rely on earlier middleware, but safe to check)
    if (String(org.createdBy) !== String(creatorId)) {
      // Check if not owner, though usually handled by permissions.
      // But verify strictly here:
    }

    // Delete the organization
    await OrgModel.findByIdAndDelete(orgId);

    // Remove org from all users
    await UserModel.updateMany(
      { orgIds: orgId },
      { $pull: { orgIds: orgId } }
    );

    // Logic to clean up defaultOrgId if it matches deleted org
    await UserModel.updateMany(
      { defaultOrgId: orgId },
      { $unset: { defaultOrgId: 1 } }
    );

    return res.json({
      success: true,
      message: "Organization deleted successfully"
    });
  } catch (error) {
    console.error("DELETE ORG ERROR:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to delete organization" }
    });
  }
};