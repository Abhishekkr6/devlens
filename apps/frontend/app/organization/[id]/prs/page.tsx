import PRsClient from "./PRsClient";
import DashboardLayout from "../../../../components/Layout/DashboardLayout";

export default function PRsPage({ params }: { params: { id: string } }) {
    return (
        <DashboardLayout>
            <PRsClient orgId={params.id} />
        </DashboardLayout>
    );
}
