
import AlertsClient from "./AlertsClient";

export default function Page({ params }: { params: { id: string } }) {
    return <AlertsClient orgId={params.id} />;
}
