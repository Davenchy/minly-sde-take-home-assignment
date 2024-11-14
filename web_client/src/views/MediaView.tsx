import { MediaCard } from "@/components/MediaCard"
import { MediaSource } from "@/components/MediaSource"
import { useUser } from "@/hooks/use-user"
import type { IMedia } from "@/lib/api/api"
import { useQuery } from "@tanstack/react-query"

type MediaEndpoint = (token: string) => Promise<IMedia[]>

export function MediaView({ endpoint }: { endpoint: MediaEndpoint }) {
  const { token } = useUser()
  const { isPending, isLoading, data } = useQuery({
    queryKey: ["media"],
    initialData: [],
    queryFn: async () => {
      return await endpoint(token)
    },
  })

  if (isPending || isLoading) return <p>Loading...</p>

  if (data.length === 0)
    return (
      <h2 className="text-3xl text-center p-4 py-64 text-bold">
        Be the first and share your moment
      </h2>
    )

  return (
    <div className="overflow-y-auto space-y-4 h-full">
      {data.map((media: IMedia) => (
        <MediaCard key={media.id} media={media}>
          <MediaSource mediaId={media.id}>
            {src => <img src={src} alt="testing" />}
          </MediaSource>
        </MediaCard>
      ))}
    </div>
  )
}
