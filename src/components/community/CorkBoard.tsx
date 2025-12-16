import { useBoardPosts } from '@/hooks/useCommunityPosts';
import { StickyNote } from './StickyNote';
import { Skeleton } from '@/components/ui/skeleton';

interface CorkBoardProps {
  county?: string | null;
}

export function CorkBoard({ county }: CorkBoardProps) {
  const { data: posts, isLoading, error } = useBoardPosts(county);

  if (isLoading) {
    return (
      <div className="bg-amber-800 p-6 rounded-lg shadow-inner min-h-[500px]">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-[80px] md:h-[180px] bg-amber-700/50" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-amber-800 p-6 rounded-lg shadow-inner min-h-[300px] flex items-center justify-center">
        <p className="text-amber-100">Failed to load posts. Please try again.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div 
        className="relative p-8 rounded-lg min-h-[400px] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Cork texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 rounded-lg"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="text-center z-10">
          <p className="text-amber-100 text-lg font-medium mb-2">
            {county ? `No posts for ${county}` : 'The board is empty'}
          </p>
          <p className="text-amber-200/70 text-sm">Be the first to post a note!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative p-6 rounded-lg min-h-[500px]"
      style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Cork texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 rounded-lg pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Wooden frame effect */}
      <div className="absolute inset-0 border-8 border-amber-900/50 rounded-lg pointer-events-none" />

      <div className="relative z-10 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {posts.map((post) => (
          <StickyNote key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
