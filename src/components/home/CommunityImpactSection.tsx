import { TrendingUp, Users, Leaf, Heart, MessageSquare, Lightbulb } from "lucide-react";
const impactStories = [{
  quote: "I've been retired for five years and felt a bit useless, honestly. Now I'm teaching three local teenagers woodworking, and in return, one of them keeps my computer running smoothly. I haven't felt this useful in years.",
  author: "Michael, 68",
  location: "Cork",
  skill: "Woodworking for tech help"
}, {
  quote: "As a single mum, I couldn't afford piano lessons for my daughter. Through SwapSkills, she's learning from a lovely retired music teacher, and I help with her grocery shopping. Win-win!",
  author: "Sarah, 34",
  location: "Dublin",
  skill: "Shopping for music lessons"
}, {
  quote: "My garden was a complete state. Now it's the pride of the street, and I've taught my helper how to fix almost anything around the house. We've become good friends over cups of tea.",
  author: "Patrick, 72",
  location: "Galway",
  skill: "DIY for gardening"
}];
const benefits = [{
  icon: Users,
  title: "Stronger Communities",
  description: "Every skill swap creates a connection. These connections weave together to form the fabric of real community — neighbours who know each other, trust each other, and look out for each other.",
  color: "bg-primary/10 text-primary"
}, {
  icon: Leaf,
  title: "Environmental Impact",
  description: "Local skill sharing means less driving to distant service providers, less packaging, less waste. It's a small but meaningful contribution to a more sustainable Ireland.",
  color: "bg-success/10 text-success"
}, {
  icon: Heart,
  title: "Mental Wellbeing",
  description: "Loneliness is a growing crisis in Ireland. Every swap is an opportunity for genuine human connection, for feeling valued, for being part of something bigger than yourself.",
  color: "bg-accent/10 text-accent"
}, {
  icon: TrendingUp,
  title: "Economic Resilience",
  description: "When skills stay local, communities become more self-sufficient. Money that would have left the area stays within the community, strengthening the local economy.",
  color: "bg-highlight/10 text-highlight"
}];
export function CommunityImpactSection() {
  return <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        
      </div>
    </section>;
}