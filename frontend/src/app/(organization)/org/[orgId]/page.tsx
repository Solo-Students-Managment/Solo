type OrgPageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function OrganizationHomePage({ params }: OrgPageProps) {
  const { orgId } = await params;
  return (
    <main className="p-6">
      <h1 className="font-display text-2xl">Organization</h1>
      <p className="text-muted tabular-nums">{orgId}</p>
    </main>
  );
}
