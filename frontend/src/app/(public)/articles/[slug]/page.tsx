import { ArticlesFeedDetailView } from "@/features/articles-feed";

type Props = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <ArticlesFeedDetailView slug={slug} />;
}
