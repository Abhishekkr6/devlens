import ActivityClient from "./ActivityClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <DashboardLayout>
            <ActivityClient orgId={id} />
        </DashboardLayout>
    );
}
