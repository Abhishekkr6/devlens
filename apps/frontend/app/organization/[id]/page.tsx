
import DashboardClient from "./DashboardClient";

export default function Page({ params }: { params: { id: string } }) {
    return <DashboardClient orgId={params.id} />;
}
