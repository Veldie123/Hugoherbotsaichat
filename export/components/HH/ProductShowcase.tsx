import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { MessageSquare, Video, Target, BarChart3, Users, Mic } from "lucide-react";

export function ProductShowcase() {
  const features = [
    {
      icon: MessageSquare,
      title: "AI Roleplays",
      description: "Oefen verkoopgesprekken met Hugo's AI avatar",
    },
    {
      icon: Video,
      title: "Video Library",
      description: "25+ masterclass video's over alle EPIC fasen",
    },
    {
      icon: Target,
      title: "EPIC Methodiek",
      description: "Gestructureerde verkoopmethode in 5 fasen",
    },
    {
      icon: BarChart3,
      title: "Gespreksanalyse",
      description: "Upload gesprekken voor AI-feedback",
    },
    {
      icon: Users,
      title: "Live Coaching",
      description: "Dagelijkse live sessies met Hugo (ma-vr)",
    },
    {
      icon: Mic,
      title: "Audio/Video Chat",
      description: "Oefen met voice of video voor realistische ervaring",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-full bg-hh-primary/10 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-hh-primary" />
            </div>
            <h3 className="text-[16px] leading-[24px] font-semibold text-hh-text mb-2">
              {feature.title}
            </h3>
            <p className="text-[14px] leading-[20px] text-hh-muted">
              {feature.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
