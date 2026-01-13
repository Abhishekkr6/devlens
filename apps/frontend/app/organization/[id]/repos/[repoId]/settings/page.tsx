import RepoSettingsClient from "./RepoSettingsClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function RepoSettingsPage({
    params,
}: {
    params: Promise<{ id: string; repoId: string }>;
}) {
    const { id, repoId } = await params;

    return (
        <DashboardLayout>
            <RepoSettingsClient orgId={id} repoId={repoId} />
        </DashboardLayout>
    );
}
