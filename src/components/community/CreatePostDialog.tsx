import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePost } from '@/hooks/useCommunityPosts';
import { PostCategory, CATEGORY_CONFIG, IRISH_COUNTIES } from '@/types/community';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function CreatePostDialog() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory | ''>('');
  const [location, setLocation] = useState('');
  const [county, setCounty] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category) return;

    createPost.mutate(
      {
        title,
        description,
        category: category as PostCategory,
        location: location || undefined,
        county: county || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle('');
          setDescription('');
          setCategory('');
          setLocation('');
          setCounty('');
        },
      }
    );
  };

  const handleClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
  };

  if (!user) {
    return (
      <Button onClick={handleClick} className="gap-2">
        <Plus className="h-4 w-4" />
        Post a Note
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Post a Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Post to Community Board</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PostCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title for your post"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some details..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Town/Area</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Galway City"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Select value={county} onValueChange={setCounty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select county" />
                </SelectTrigger>
                <SelectContent>
                  {IRISH_COUNTIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!title || !description || !category || createPost.isPending}
          >
            {createPost.isPending ? 'Posting...' : 'Post Note'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
