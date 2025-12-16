import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Plus, MapPin, Package } from "lucide-react";
import { useUserServices, ServiceWithUser } from "@/hooks/useServices";
import { categoryLabels, categoryIcons } from "@/lib/categories";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface UserListingsProps {
  userId: string;
}

export function UserListings({ userId }: UserListingsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: services, isLoading, error } = useUserServices(userId);

  const handleDelete = async (serviceId: string) => {
    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      toast.error("Failed to delete listing");
      return;
    }

    toast.success("Listing deleted successfully");
    queryClient.invalidateQueries({ queryKey: ["user-services", userId] });
    queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  if (isLoading) {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">My Listings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">My Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Failed to load your listings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">My Listings</CardTitle>
          <CardDescription>
            {services && services.length > 0 
              ? `You have ${services.length} listing${services.length === 1 ? '' : 's'}`
              : "Manage your offers and requests"
            }
          </CardDescription>
        </div>
        <Button 
          size="sm" 
          className="rounded-xl"
          onClick={() => navigate("/services/new")}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Listing
        </Button>
      </CardHeader>
      <CardContent>
        {services && services.length > 0 ? (
          <div className="space-y-3">
            {services.map((service) => (
              <ListingItem 
                key={service.id} 
                service={service} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
            <Button 
              onClick={() => navigate("/services/new")}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Listing
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ListingItemProps {
  service: ServiceWithUser;
  onDelete: (id: string) => void;
}

function ListingItem({ service, onDelete }: ListingItemProps) {
  const navigate = useNavigate();
  const isOffer = service.type === "free_offer" || service.type === "skill_swap";

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            variant={isOffer ? "default" : "accent"}
            className="shrink-0 text-xs rounded-md"
          >
            {isOffer ? "Offering" : "Looking for"}
          </Badge>
          <Badge variant="outline" className="shrink-0 text-xs rounded-md">
            <span className="mr-1">{categoryIcons[service.category]}</span>
            {categoryLabels[service.category]}
          </Badge>
          {service.status !== "active" && (
            <Badge variant="secondary" className="shrink-0 text-xs rounded-md capitalize">
              {service.status}
            </Badge>
          )}
        </div>
        
        <Link 
          to={`/services/${service.id}`}
          className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
        >
          {service.title}
        </Link>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {service.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {service.location}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg h-8 w-8 p-0"
          onClick={() => navigate(`/services/${service.id}/edit`)}
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{service.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(service.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
