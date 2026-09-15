type PublicProfilePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  return (
    <main className="p-6">
      <h1 className="font-display text-2xl">Public profile</h1>
      <p className="text-muted">{slug}</p>
    </main>
  );
}
