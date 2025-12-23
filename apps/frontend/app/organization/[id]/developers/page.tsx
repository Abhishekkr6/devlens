import DevelopersClient from "./DevelopersClient";
import DashboardLayout from "../../../../components/Layout/DashboardLayout";

export default function DevelopersPage({ params }: { params: { id: string } }) {
    return (
        <DashboardLayout>
            <DevelopersClient orgId={params.id} />
        </DashboardLayout>
    );
}
