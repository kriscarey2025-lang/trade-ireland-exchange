import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/SEO';
import { CorkBoard } from '@/components/community/CorkBoard';
import { BoardFilters } from '@/components/community/BoardFilters';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export default function CommunityBoard() {
  const [selectedCounty, setSelectedCounty] = useState<string>('all');

  return (
    <>
      <SEO
        title="Community Board"
        description="Your local community noticeboard. Share events, lost & found, free items, and local news with your neighbours."
        url="https://swap-skills.com/community"
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-secondary/20">
          <div className="container py-8">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Community Board
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your local digital noticeboard — share events, lost & found notices, free items, 
                and community news with your neighbours.
              </p>
            </div>

            {/* Tagline Banner */}
            <div className="relative mb-8 flex justify-center">
              <div className="relative inline-block">
                {/* Pin decoration */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-500 shadow-lg z-10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-300" />
                </div>
                {/* Note card */}
                <div className="bg-amber-50 dark:bg-amber-100 border-2 border-amber-200 rounded-lg px-8 py-5 shadow-lg transform rotate-[-1deg] hover:rotate-0 transition-transform duration-300">
                  <p className="text-lg md:text-xl font-handwriting text-amber-900 italic text-center">
                    "Think of this as your local supermarket noticeboard
                    <br className="hidden sm:block" />
                    <span className="inline sm:hidden"> </span>
                    — just digital."
                  </p>
                  <div className="flex justify-center mt-2">
                    <span className="text-2xl">📌</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 w-full sm:w-auto">
                <BoardFilters 
                  selectedCounty={selectedCounty} 
                  onCountyChange={setSelectedCounty} 
                />
              </div>
              <CreatePostDialog />
            </div>

            {/* The Cork Board */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📌 Latest Posts
                <span className="text-sm font-normal text-muted-foreground">(Most recent 20)</span>
                {selectedCounty !== 'all' && (
                  <Badge variant="secondary" className="ml-2 gap-1">
                    {selectedCounty}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setSelectedCounty('all')} 
                    />
                  </Badge>
                )}
              </h2>
              <CorkBoard county={selectedCounty !== 'all' ? selectedCounty : null} />
            </section>

            {/* Info Section */}
            <section className="bg-card rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">How it works</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Post a note to share with your local community</li>
                <li>• Notes are colour-coded by category for easy browsing</li>
                <li>• The board shows the 20 most recent active posts</li>
                <li>• Use search & filters to find older or archived posts</li>
                <li>• Mark your post as resolved when it's no longer needed</li>
              </ul>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
