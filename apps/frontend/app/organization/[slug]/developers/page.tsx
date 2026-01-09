import DevelopersClient from "./DevelopersClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return (
        <DashboardLayout>
            <DevelopersClient orgSlug={slug} />
        </DashboardLayout>
    );
}
