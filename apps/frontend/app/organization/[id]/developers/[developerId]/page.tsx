import DeveloperProfileClient from "./DeveloperProfileClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ id: string; developerId: string }> }) {
    const { id, developerId } = await params;
    return (
        <DashboardLayout>
            <DeveloperProfileClient orgId={id} developerId={developerId} />
        </DashboardLayout>
    );
}
