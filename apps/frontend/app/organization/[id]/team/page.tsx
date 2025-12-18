"use client";
import { useState } from "react";
import { api } from "../../../../lib/api";

interface TeamPageProps {
  params: {
    orgId: string;
    [key: string]: string;
  };
}

export default function TeamPage({ params }: TeamPageProps) {
  const { orgId } = params;

  // 🔥 DEBUG LINE
  console.log("TEAM PAGE ORG ID = ", orgId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");

  const invite = async () => {

    // 🔥 DEBUG LINE
    console.log("INVITE CLICKED WITH ORG ID = ", orgId);

    if (!orgId) {
      alert("ORG ID is missing. Routing is wrong.");
      return;
    }

    await api.post(`/orgs/${orgId}/invite`, { email, role });
    alert("User invited");
  };

  return (
    <div>
      <h1>Invite Member</h1>

      <input
        placeholder="User email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="role-select">Role</label>
      <select
        id="role-select"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="ADMIN">Admin</option>
        <option value="MEMBER">Member</option>
        <option value="VIEWER">Viewer</option>
      </select>

      <button onClick={invite}>Invite</button>
    </div>
  );
}
