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
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");

  const invite = async () => {
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


// "use client";

// import { useState } from "react";
// import { api } from "../../../../lib/api";

// export default function TeamPage({ params }: any) {
//   const { orgId } = params;
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("VIEWER");
//   const [loading, setLoading] = useState(false);

//   const invite = async () => {
//     if (!email) {
//       alert("Email is required");
//       return;
//     }

//     if (loading) return;
//     setLoading(true);

//     try {
//       await api.post(`/orgs/${orgId}/invite`, { email, role });
//       alert("User invited successfully");
//       setEmail("");
//     } catch (err: any) {
//       alert(err.response?.data?.error || "Invite failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h1>Invite Member</h1>

//       <input
//         placeholder="User email"
//         value={email}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <select value={role} onChange={(e) => setRole(e.target.value)}>
//         <option value="ADMIN">Admin</option>
//         <option value="MEMBER">Member</option>
//         <option value="VIEWER">Viewer</option>
//       </select>

//       <button disabled={loading} onClick={invite}>
//         {loading ? "Inviting..." : "Invite"}
//       </button>
//     </div>
//   );
// }
