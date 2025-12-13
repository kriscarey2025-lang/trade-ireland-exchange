import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface ConversationPromptsProps {
  serviceTitle?: string | null;
  serviceCategory?: string | null;
  serviceType?: string | null;
  onSelectPrompt: (prompt: string) => void;
}

export function ConversationPrompts({
  serviceTitle,
  serviceCategory,
  serviceType,
  onSelectPrompt
}: ConversationPromptsProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["conversation-prompts", serviceTitle, serviceCategory],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("conversation-prompts", {
        body: {
          serviceTitle,
          serviceCategory,
          serviceType
        }
      });

      if (error) throw error;
      return data?.prompts as string[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 1,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["conversation-prompts"] });
    refetch();
  };

  if (isLoading) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading suggestions...</span>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Suggested questions</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetching}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => onSelectPrompt(prompt)}
              className="h-auto py-1.5 px-3 text-xs whitespace-normal text-left hover:bg-primary/10 hover:border-primary"
            >
              {prompt}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
