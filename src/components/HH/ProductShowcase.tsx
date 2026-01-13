/**
 * PRODUCT SHOWCASE COMPONENT - Carousel Version
 * Real app screenshots imported from Figma assets
 * Side-by-side layout: Features left, Screenshot right
 */

import { useState } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import liveTrainingPhoto from "figma:asset/df8d0345ec97872464a36f2f13fb9ed0586c1cae.png";
import videoCursusScreenshot from "figma:asset/6a04748baf4dd37751e816f59305b1501c7ce511.png";
import roleplayScreenshot from "figma:asset/e06d60464ed4edd0aa80bbfba3e7f07dc13ba713.png";
import gespreksAnalyseScreenshot from "figma:asset/1af8abb9ceb6e3c60c3300376a7da965e4890433.png";

// Mobile screenshots (better readability)
import liveCoachingMobileScreenshot from "figma:asset/417195605e7e3ffb7b88e25d81abae07b961cead.png";
import videoCursusMobileScreenshot from "figma:asset/d0bd4ebd3f322728212239d9843fb7ed91353fb1.png";
import gespreksAnalyseMobileScreenshot from "figma:asset/8468c7d7d61a204dd5d6d0a9a1e725c4a7a838e2.png";
import roleplayMobileScreenshot from "figma:asset/1aaf1ee8003f092eca4483dcbc2efb6f7376380d.png";

interface ShowcaseSlide {
  id: string;
  badge: string;
  title: string;
  description: string | React.ReactNode;
  features: string[];
  imageSrc: string;
  mobileImageSrc?: string; // Mobile-specific screenshot
  imageAlt: string;
}

export function ProductShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: ShowcaseSlide[] = [
    {
      id: "live",
      badge: "Live training",
      title: "Dagelijkse live training",
      description:
        "Elke werkdag live met Hugo (ma–vr) — 45-60 min training + Q&A. Ik zeg je niet alleen wat je moet doen maar ook exact hoe je het moet doen.",
      features: [
        "45–60 min per dag + Q&A met Hugo",
        "Thema's: opening, diagnose, waarde, voorstel, bezwaren, prijs, closing",
        "Opnames met chapters binnen 2 uur — terugkijken wanneer je wil",
      ],
      imageSrc: liveTrainingPhoto,
      mobileImageSrc: liveCoachingMobileScreenshot,
      imageAlt: "HugoHerbots.ai - Dagelijkse live training met Hugo",
    },
    {
      id: "video",
      badge: "Video-cursus",
      title: "25 technieken in 5 fasen",
      description:
        "Leer alle 25 salestechnieken van Hugo — van voorbereiding tot afsluiting. Korte, gefocuste video's met concrete voorbeelden en oefeningen.",
      features: [
        "25 technieken verdeeld over 5 fasen",
        "Van voorbereiding tot afsluiting — stap voor stap",
        "Concrete voorbeelden en praktische toepassingen",
      ],
      imageSrc: videoCursusScreenshot,
      mobileImageSrc: videoCursusMobileScreenshot,
      imageAlt: "HugoHerbots.ai Video Cursus - Leer alle 25 technieken",
    },
    {
      id: "roleplay",
      badge: "Rollenspellen",
      title: "Rollenspellen: oefen met AI",
      description:
        "Train verkopen in jouw eigen context via chat, bellen of video-call met Hugo's AI-avatar. Direct feedback, persoonlijke scores en concrete verbeterpunten.",
      features: [
        "Chat, bellen of video-call — kies hoe je wil oefenen",
        "Scenario's in jouw eigen context en situaties",
        "Direct feedback en persoonlijke scores per techniek",
      ],
      imageSrc: roleplayScreenshot,
      mobileImageSrc: roleplayMobileScreenshot,
      imageAlt: "HugoHerbots.ai Rollenspellen - Oefen met AI-avatar",
    },
    {
      id: "analysis",
      badge: "Gespreksanalyse",
      title: "Gespreksanalyse: upload calls of live feedback",
      description: (
        <>
          Upload je gesprekken en krijg binnen het uur feedback op alle 25 technieken. Of laat Hugo<sup className="text-[10px] text-hh-primary">AI</sup> live meeluisteren en ontvang real-time coaching tijdens je call.
        </>
      ),
      features: [
        "Upload opgenomen gesprekken — feedback binnen het uur",
        "Live meeluisteren — real-time coaching tijdens je call",
        "Gedetailleerde analyse per techniek met concrete verbeterpunten",
      ],
      imageSrc: gespreksAnalyseScreenshot,
      mobileImageSrc: gespreksAnalyseMobileScreenshot,
      imageAlt: "HugoHerbots.ai Gespreksanalyse - Upload calls of live feedback",
    },
  ];

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Desktop: Tabs Navigation at Top */}
      <div className="hidden lg:block">
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {slides.map((slideItem, idx) => (
            <Button
              key={idx}
              variant={idx === currentSlide ? "default" : "outline"}
              size="lg"
              onClick={() => goToSlide(idx)}
              className={idx === currentSlide ? "bg-hh-primary text-white" : ""}
            >
              {slideItem.badge}
            </Button>
          ))}
        </div>
      </div>

      {/* Desktop: Two-Column Layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left: Features & Description */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-hh-text">
              {slide.title}
            </h3>
            
            <p className="text-hh-muted">
              {slide.description}
            </p>
          </div>

          {/* Feature List */}
          <ul className="space-y-3">
            {slide.features.map((feature, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
                <span className="text-hh-text">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: App Screenshot in Browser Frame */}
        <div>
          <Card className="rounded-2xl shadow-hh-lg border-hh-border overflow-hidden">
            <img
              src={slide.imageSrc}
              alt={slide.imageAlt}
              className="w-full h-auto"
            />
          </Card>
        </div>
      </div>

      {/* Mobile: Horizontal swipe cards (Tesla-style) */}
      <div className="lg:hidden">
        <div className="overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
            {slides.map((slideItem, idx) => (
              <Card
                key={idx}
                className="p-6 rounded-[16px] shadow-hh-md border-hh-border w-[82vw] flex-shrink-0"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="space-y-4">
                  {/* Badge */}
                  <Badge className="bg-hh-primary/10 text-hh-primary border-hh-primary/20">
                    {slideItem.badge}
                  </Badge>
                  
                  {/* Title */}
                  <h3 className="text-[20px] leading-[28px] text-hh-text">
                    {slideItem.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-[14px] leading-[20px] text-hh-muted">
                    {slideItem.description}
                  </p>

                  {/* Feature List */}
                  <ul className="space-y-2">
                    {slideItem.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 text-hh-success flex-shrink-0 mt-0.5" />
                        <span className="text-[14px] leading-[20px] text-hh-text">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Screenshot */}
                  <div className="pt-2">
                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-hh-ui-50 to-hh-ui-100 p-4 flex items-center justify-center">
                      <img
                        src={slideItem.mobileImageSrc || slideItem.imageSrc}
                        alt={slideItem.imageAlt}
                        className="w-auto h-auto max-w-full"
                        style={{ maxHeight: '500px' }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}