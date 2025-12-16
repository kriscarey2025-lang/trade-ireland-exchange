import { useBoardPosts } from '@/hooks/useCommunityPosts';
import { StickyNote } from './StickyNote';
import { Skeleton } from '@/components/ui/skeleton';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshCw } from 'lucide-react';
import { useCallback } from 'react';

interface CorkBoardProps {
  county?: string | null;
}

export function CorkBoard({ county }: CorkBoardProps) {
  const { data: posts, isLoading, error, refetch } = useBoardPosts(county);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const { containerRef, isRefreshing, pullDistance, pullProgress } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

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
        ref={containerRef}
        className="relative p-8 rounded-lg min-h-[400px] flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        {/* Pull to refresh indicator */}
        {(pullDistance > 0 || isRefreshing) && (
          <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber-100 transition-opacity"
            style={{ opacity: pullProgress }}
          >
            <RefreshCw 
              className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{ transform: `rotate(${pullProgress * 360}deg)` }}
            />
            <span className="text-sm">
              {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        )}
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
      ref={containerRef}
      className="relative p-6 rounded-lg min-h-[500px] overflow-auto"
      style={{
        background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%)',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.3), 0 4px 20px rgba(0,0,0,0.2)',
        transform: `translateY(${pullDistance}px)`,
        transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none',
      }}
    >
      {/* Pull to refresh indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber-800 bg-amber-100 px-3 py-1.5 rounded-full shadow-md transition-opacity z-20"
          style={{ 
            opacity: Math.min(pullProgress, 1),
            transform: `translateY(${Math.min(pullDistance, 60)}px)`,
          }}
        >
          <RefreshCw 
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{ transform: isRefreshing ? undefined : `rotate(${pullProgress * 360}deg)` }}
          />
          <span className="text-xs font-medium">
            {isRefreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      )}

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
