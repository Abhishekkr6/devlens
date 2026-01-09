import RepoPageClient from "./RepoPageClient";
import DashboardLayout from "@/components/Layout/DashboardLayout";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <DashboardLayout>
      <RepoPageClient orgSlug={slug} />
    </DashboardLayout>
  );
}
