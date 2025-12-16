import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/services/ServiceCard";
import { mockServices } from "@/lib/mockData";
import { ArrowRight } from "lucide-react";
export function FeaturedServicesSection() {
  // Show first 3 services
  const featuredServices = mockServices.slice(0, 3);
  return;
}