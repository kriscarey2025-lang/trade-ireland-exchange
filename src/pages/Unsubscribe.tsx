import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleUnsubscribe = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Invalid unsubscribe link. Please try again from your email.");
        return;
      }

      try {
        // Decode the token to get user_id
        const userId = atob(token);

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          setStatus("error");
          setMessage("Invalid unsubscribe link. Please try again from your email.");
          return;
        }

        // Update user preferences to disable weekly digest
        const { error } = await supabase
          .from("user_preferences")
          .update({ weekly_digest_enabled: false })
          .eq("user_id", userId);

        if (error) {
          console.error("Error unsubscribing:", error);
          setStatus("error");
          setMessage("Something went wrong. Please try again or contact support.");
          return;
        }

        setStatus("success");
        setMessage("You have been successfully unsubscribed from the weekly digest.");
      } catch (err) {
        console.error("Error:", err);
        setStatus("error");
        setMessage("Invalid unsubscribe link. Please try again from your email.");
      }
    };

    handleUnsubscribe();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mb-6">
            <span className="text-3xl font-display font-bold bg-gradient-to-r from-primary via-amber-400 to-secondary bg-clip-text text-transparent">
              🤝 Swap Skills
            </span>
          </div>

          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Processing...</h1>
              <p className="text-muted-foreground">Please wait while we update your preferences.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Successfully Unsubscribed</h1>
              <p className="text-muted-foreground mb-8">{message}</p>
              <div className="space-y-3">
                <Link to="/">
                  <Button className="w-full">Go to Home</Button>
                </Link>
                <Link to="/profile">
                  <Button variant="outline" className="w-full">Manage Preferences</Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-4">Oops!</h1>
              <p className="text-muted-foreground mb-8">{message}</p>
              <div className="space-y-3">
                <Link to="/">
                  <Button className="w-full">Go to Home</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="w-full">Contact Support</Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
