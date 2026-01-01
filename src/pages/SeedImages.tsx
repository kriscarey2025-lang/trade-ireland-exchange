import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import holisticMassageImage from "@/assets/services/holistic-massage.jpg";
import gardeningImage from "@/assets/services/gardening.jpg";
import germanLanguageImage from "@/assets/services/german-language.jpg";

const serviceImageMappings = [
  {
    serviceId: "ce3eef35-40de-4a95-863b-31cb78073edf",
    imageSrc: holisticMassageImage,
    fileName: "holistic-massage.jpg",
    title: "Lymphatic drainage massage"
  },
  {
    serviceId: "9fe2997f-756b-44cf-af30-379756c36c81",
    imageSrc: gardeningImage,
    fileName: "gardening.jpg",
    title: "Gardening Duties"
  },
  {
    serviceId: "43708d6c-d615-4377-91e7-ee26a962426a",
    imageSrc: germanLanguageImage,
    fileName: "german-language.jpg",
    title: "German Language Help"
  }
];

async function imageToBase64(imageSrc: string): Promise<string> {
  const response = await fetch(imageSrc);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function SeedImages() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleSeedImages = async () => {
    setIsLoading(true);
    try {
      const imageData = await Promise.all(
        serviceImageMappings.map(async (mapping) => ({
          serviceId: mapping.serviceId,
          base64Image: await imageToBase64(mapping.imageSrc),
          fileName: mapping.fileName,
        }))
      );

      const { data, error } = await supabase.functions.invoke("seed-service-images", {
        body: { imageData },
      });

      if (error) {
        throw error;
      }

      setResults(data.results || []);
      toast.success("Images seeded successfully!");
    } catch (error) {
      console.error("Error seeding images:", error);
      toast.error("Failed to seed images");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Seed Service Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {serviceImageMappings.map((mapping) => (
              <div key={mapping.serviceId} className="flex items-center gap-4 p-3 border rounded-lg">
                <img
                  src={mapping.imageSrc}
                  alt={mapping.title}
                  className="w-20 h-14 object-cover rounded"
                />
                <div>
                  <p className="font-medium">{mapping.title}</p>
                  <p className="text-sm text-muted-foreground">{mapping.fileName}</p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSeedImages} disabled={isLoading} className="w-full">
            {isLoading ? "Seeding..." : "Seed Images to Database"}
          </Button>

          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Results:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-sm ${
                    result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.success ? `✓ ${result.imageUrl}` : `✗ ${result.error}`}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
