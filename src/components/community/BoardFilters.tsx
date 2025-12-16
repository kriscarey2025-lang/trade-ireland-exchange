import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { PostCategory, PostStatus, CATEGORY_CONFIG, IRISH_COUNTIES } from '@/types/community';
import { useSearchPosts } from '@/hooks/useCommunityPosts';
import { StickyNote } from './StickyNote';
import { Skeleton } from '@/components/ui/skeleton';

export function BoardFilters() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<PostCategory | 'all'>('all');
  const [county, setCounty] = useState<string>('all');
  const [status, setStatus] = useState<PostStatus | 'all'>('all');
  const [isSearching, setIsSearching] = useState(false);

  const hasFilters = search || category !== 'all' || county !== 'all' || status !== 'all';

  const { data: searchResults, isLoading } = useSearchPosts({
    search: search || undefined,
    category: category !== 'all' ? category : null,
    county: county !== 'all' ? county : null,
    status: status !== 'all' ? status : null,
  });

  const handleSearch = () => {
    if (hasFilters) {
      setIsSearching(true);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setCounty('all');
    setStatus('all');
    setIsSearching(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Posts</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as PostCategory | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">County</label>
                <Select value={county} onValueChange={setCounty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
                    {IRISH_COUNTIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v as PostStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => { handleSearch(); setIsOpen(false); }} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Button onClick={handleSearch} disabled={!hasFilters}>
          Search
        </Button>
      </div>

      {/* Active filters display */}
      {hasFilters && isSearching && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {search && (
            <Badge variant="secondary" className="gap-1">
              "{search}"
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch('')} />
            </Badge>
          )}
          {category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {CATEGORY_CONFIG[category].label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setCategory('all')} />
            </Badge>
          )}
          {county !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {county}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setCounty('all')} />
            </Badge>
          )}
          {status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {status}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStatus('all')} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-6">
            Clear all
          </Button>
        </div>
      )}

      {/* Search Results */}
      {isSearching && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Search Results
            {searchResults && searchResults.length > 0 && (
              <span className="text-muted-foreground font-normal ml-2">
                ({searchResults[0]?.total_count || searchResults.length} found)
              </span>
            )}
          </h3>
          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[180px]" />
              ))}
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((post) => (
                <StickyNote key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No posts found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
