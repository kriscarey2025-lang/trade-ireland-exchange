import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VerifiedBadge } from "./VerifiedBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Upload, 
  Loader2, 
  Shield, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileImage,
  X
} from "lucide-react";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

interface VerificationRequest {
  id: string;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

interface VerificationRequestCardProps {
  userId: string;
  verificationStatus: VerificationStatus;
  existingRequest: VerificationRequest | null;
  onStatusChange: (newStatus: VerificationStatus) => void;
}

export function VerificationRequestCard({
  userId,
  verificationStatus,
  existingRequest,
  onStatusChange,
}: VerificationRequestCardProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select an ID document to upload");
      return;
    }

    setUploading(true);

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("id-documents")
        .upload(fileName, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create verification request
      const { error: requestError } = await supabase
        .from("verification_requests")
        .upsert({
          user_id: userId,
          document_url: fileName,
          document_type: "id_card",
          status: "pending",
          submitted_at: new Date().toISOString(),
        });

      if (requestError) throw requestError;

      // Update profile verification status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ verification_status: "pending" })
        .eq("id", userId);

      if (profileError) throw profileError;

      toast.success("Verification request submitted successfully!");
      onStatusChange("pending");
      clearFile();
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast.error(error.message || "Failed to submit verification request");
    } finally {
      setUploading(false);
    }
  };

  // Already verified
  if (verificationStatus === "verified") {
    return (
      <Card className="shadow-elevated border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                ID Verified
                <VerifiedBadge status="verified" size="sm" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Your identity has been verified. Other users can see your verified badge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending verification
  if (verificationStatus === "pending" || existingRequest?.status === "pending") {
    return (
      <Card className="shadow-elevated border-warning/20 bg-warning/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Verification Pending
                <VerifiedBadge status="pending" size="sm" />
              </h3>
              <p className="text-sm text-muted-foreground">
                Your ID is being reviewed. This usually takes 1-2 business days.
              </p>
              {existingRequest?.submitted_at && (
                <p className="text-xs text-muted-foreground mt-1">
                  Submitted on {new Date(existingRequest.submitted_at).toLocaleDateString("en-IE")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected - allow resubmission
  if (verificationStatus === "rejected" || existingRequest?.status === "rejected") {
    return (
      <Card className="shadow-elevated border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Verification Not Approved</CardTitle>
          </div>
          <CardDescription>
            Your previous verification request was not approved. You can submit a new request.
          </CardDescription>
          {existingRequest?.admin_notes && (
            <Alert variant="destructive" className="mt-3">
              <AlertDescription>{existingRequest.admin_notes}</AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id-document">Upload a new ID document</Label>
            <Input
              ref={fileInputRef}
              id="id-document"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
              className="cursor-pointer"
            />
          </div>

          {previewUrl && (
            <div className="relative">
              <img
                src={previewUrl}
                alt="ID Preview"
                className="max-h-48 rounded-lg border object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="w-full rounded-xl"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit New Request
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Unverified - first time request
  return (
    <Card className="shadow-elevated border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Verify Your Identity</CardTitle>
        </div>
        <CardDescription>
          Optional: Upload a photo of your ID to earn a verified badge. This helps build trust
          with other community members.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">What we accept:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Passport, Driving License, or National ID
            </li>
          </ul>
          <p className="text-xs text-muted-foreground mt-2">
            Your document is stored securely and only visible to our admin team for verification.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="id-document">Upload ID Document</Label>
          <Input
            ref={fileInputRef}
            id="id-document"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={uploading}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Max 10MB.
          </p>
        </div>

        {previewUrl && (
          <div className="relative">
            <img
              src={previewUrl}
              alt="ID Preview"
              className="max-h-48 rounded-lg border object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={clearFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || uploading}
          className="w-full rounded-xl"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
