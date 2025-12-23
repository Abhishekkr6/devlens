import AlertsClient from "./AlertsClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <DashboardLayout>
            <AlertsClient orgId={id} />
        </DashboardLayout>
    );
}
