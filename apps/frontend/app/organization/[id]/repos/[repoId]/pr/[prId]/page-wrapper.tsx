import PRDetailClient from "./PRDetailClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({
    params
}: {
    params: Promise<{ id: string; repoId: string; prId: string }>
}) {
    const { id, repoId, prId } = await params;

    return (
        <DashboardLayout>
            <PRDetailClient orgId={id} repoId={repoId} prId={prId} />
        </DashboardLayout>
    );
}
