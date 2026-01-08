import DevelopersClient from "./DevelopersClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <DashboardLayout>
            <DevelopersClient orgId={id} />
        </DashboardLayout>
    );
}
