import RepoDetailClient from "./RepoDetailClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function RepoDetailPage({
    params,
}: {
    params: Promise<{ id: string; repoId: string }>;
}) {
    const { id, repoId } = await params;

    return (
        <DashboardLayout>
            <RepoDetailClient orgId={id} repoId={repoId} />
        </DashboardLayout>
    );
}
