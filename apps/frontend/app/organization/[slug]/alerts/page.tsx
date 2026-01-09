import AlertsClient from "./AlertsClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <DashboardLayout>
            <AlertsClient orgSlug={slug} />
        </DashboardLayout>
    );
}
