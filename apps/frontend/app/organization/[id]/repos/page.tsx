import RepoPageClient from "./RepoPageClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <RepoPageClient orgId={id} />
    </DashboardLayout>
  );
}
