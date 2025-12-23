import ActivityClient from "./ActivityClient";
import DashboardLayout from "../../../../components/Layout/DashboardLayout";

export default function ActivityPage({ params }: { params: { id: string } }) {
    return (
        <DashboardLayout>
            <ActivityClient orgId={params.id} />
        </DashboardLayout>
    );
}
