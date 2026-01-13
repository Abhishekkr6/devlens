import RepoDetailClient from "./RepoDetailClient";

export default async function RepoDetailPage({
    params,
}: {
    params: Promise<{ id: string; repoId: string }>;
}) {
    const { id, repoId } = await params;

    return <RepoDetailClient orgId={id} repoId={repoId} />;
}
