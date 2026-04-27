import { AlbumDetailClient } from "@/components/album/album-detail";

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  return <AlbumDetailClient albumId={id} />;
}
