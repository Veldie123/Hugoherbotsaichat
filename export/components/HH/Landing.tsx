/**
 * LANDING PAGE - HugoHerbots.ai
 * Real app screenshots imported from Figma assets
 */

import { ArrowRight, Play, BarChart3, Video, Mic, BookOpen, Users, TrendingUp, MessageSquare, Calendar, Target } from "lucide-react";
import { Logo } from "./Logo";
import { PricingTier } from "./PricingTier";
import { ProductShowcase } from "./ProductShowcase";
import { StickyHeader } from "./StickyHeader";
import { StickyBottomCTA } from "./StickyBottomCTA";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { getDailyQuote } from "../../data/hugoQuotes";
import dashboardScreenshot from "figma:asset/f3ff38e032c4e51e4efb9ba72d91252d5280b05b.png";
import roleplayScreenshot from "figma:asset/5e0311347e22c63626fd6f5cd1e39d5971c229ea.png";
import libraryScreenshot from "figma:asset/4e55fbf1203c2007aa7c57bd7c361b9b2b4fe19c.png";
import teamSessionsScreenshot from "figma:asset/30efcc2323f296e7ae756f9998473ab6432db5f0.png";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import hugoVideoPlaceholder from "figma:asset/110ec621be27a3e45bb05b418b6d4504c1aa0208.png";
import hugoWhiteboardPhoto from "figma:asset/0a29760778720081acca342f614a027e8439d7d6.png";
import hugoCloseupPhoto from "figma:asset/25bbfb6a461015b72878d13942354ef2dfc06457.png";
import hugoPortrait from "figma:asset/9fadffbf5efd08d95548ac3acedf2a4c54db789e.png";
import hugoWalking from "figma:asset/3303da6db66b7132ebc5f2f6276712c9a0fd485e.png";
import hugoBlackBg from "figma:asset/55ebfcc50643aeb65dc90a7859ec62c9544506cf.png";
import hugoHeroPortrait from "figma:asset/550fe0531dc160fbdfb0559064b6febd0bd2aec5.png";
import hugoWriting from "figma:asset/ffe328d4703b02e265880fd122f17bde74ebfa9d.png";
import hugoFlipboard from "figma:asset/c0405e66f17c9453845b8d671752aa8fc7440998.png";

type Page = "landing" | "pricing" | "about" | "login" | "signup" | "preview" | "onboarding" | "dashboard" | "roleplay" | "library" | "builder" | "sessions" | "analytics" | "settings";

interface LandingProps {
  navigate?: (page: Page) => void;
}

export function Landing({ navigate }: LandingProps) {
  const [isYearly, setIsYearly] = useState(true); // Default to yearly

  const handleNavigate = (page: Page) => {
    window.scrollTo(0, 0); // Scroll to top on navigation
    if (navigate) navigate(page);
  };

  return (
    <div className="bg-hh-bg">
      {/* Hero Section - Light Gray Background */}
      <div className="bg-hh-ui-50">
        {/* Sticky Header */}
        <StickyHeader currentPage="landing" navigate={handleNavigate} />

        {/* Hero - Large Background Photo with Text Overlay */}
        <section className="relative overflow-hidden" style={{ minHeight: 'calc(100vh - 80px)' }}>
          {/* Background Image - Hugo Writing */}
          <div className="absolute inset-0">
            <img 
              src={hugoWriting} 
              alt="Hugo Herbots"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle gradient overlay for text readability on left side */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end" style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '20vh' }}>
            <div className="w-full pb-16 lg:pb-24">
              {/* Left - Text Content */}
              <div className="space-y-6 sm:space-y-8 max-w-2xl">
                {/* Opening - Personal Introduction */}
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-[40px] leading-[1.05] sm:text-[56px] lg:text-[88px] text-hh-text tracking-tight font-light">
                    40 jaar sales trainer,<br/>nu jouw persoonlijke coach
                  </h1>
                  <p 
                    className="text-[20px] leading-[1.5] sm:text-[24px] lg:text-[28px] text-hh-ink md:text-white max-w-lg font-light"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                  >
                    "Will + Skill + Drill"
                  </p>
                </div>

                {/* CTAs - HH Brand Style */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    id="hero-cta"
                    size="lg"
                    className="bg-hh-primary text-white hover:bg-hh-primary/90 w-full sm:w-auto"
                    onClick={() => handleNavigate("preview")}
                  >
                    Train met Hugo <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Desktop Only: 4 Feature Items */}
                <div className="hidden md:block space-y-4 pt-8 lg:pt-12 max-w-md">
                  {[
                    {
                      icon: Video,
                      label: "Live coaching sessies",
                      desc: "Dagelijks ma-vr met Q&A"
                    },
                    {
                      icon: Mic,
                      label: "AI-gebaseerde training",
                      desc: "Oefen 24/7 met directe feedback"
                    },
                    {
                      icon: BookOpen,
                      label: "Video cursus",
                      desc: "25 technieken in 5 fasen"
                    },
                    {
                      icon: BarChart3,
                      label: "Analytics",
                      desc: "Track je groei"
                    }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-hh-primary/10 flex items-center justify-center">
                        <feature.icon className="w-4 h-4 text-hh-primary" />
                      </div>
                      <div>
                        <h3 className="text-[16px] leading-[20px] font-medium text-hh-text">
                          {feature.label}
                        </h3>
                        <p className="text-[14px] leading-[18px] text-hh-muted">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* App Showcase Section - Zo werkt het - WHITE BACKGROUND */}
      <section className="bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32" id="zo-werkt-het">
        <div className="text-center mb-16 sm:mb-20">
          <Badge className="bg-hh-primary/10 text-hh-primary border-hh-primary/20 mb-6 text-[14px] sm:text-[16px] px-4 py-1.5">
            Zo werkt het
          </Badge>
          <h2 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] text-hh-text mb-6 px-4">
            4 modules. 4 manieren om te trainen. 4×100% Hugo Herbots.
          </h2>
          <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] lg:text-[20px] lg:leading-[32px] text-hh-muted max-w-3xl mx-auto px-4">
            AI role-plays, live coaching, video cursus, gespreksanalyse — alles gebaseerd op 40 jaar praktijk.
          </p>
        </div>

        <ProductShowcase />
      </section>

      {/* De Methode - 5 Fasen Section - LIGHT GRAY BACKGROUND */}
      <section className="bg-hh-ui-50 py-20 sm:py-32" id="epic-methode">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-hh-primary/10 text-hh-primary border-hh-primary/20 mb-6 text-[14px] sm:text-[16px] px-4 py-1.5">
              EPIC Methode
            </Badge>
            <h2 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] text-hh-text mb-6">
              De methode: 5 fasen, 25 technieken
            </h2>
            <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-hh-muted max-w-2xl mx-auto">
              De laatste geboren verkoper is gisteren gestorven.
            </p>
          </div>

          {/* Desktop: Grid | Mobile: Horizontal scroll */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                phase: "Fase 0",
                title: "Pre-contact (Desktop research)",
                desc: "Desktop research, SWOT analyse, CRM check, One Minute Manager voorbereiding. Kom goed voorbereid aan tafel.",
                techniques: ["Desktop research", "SWOT analyse", "CRM analyse", "One Minute Manager"],
                color: "hh-muted",
              },
              {
                phase: "Fase 1",
                title: "Openingsfase",
                desc: "Creëer het juiste koopklimaat. Start met een gentleman's agreement en een sterke firmavoorstelling. Stel de perfecte instapvraag.",
                techniques: ["Koopklimaat creëren", "Gentleman's agreement", "Firmavoorstelling", "Instapvraag"],
                color: "hh-primary",
              },
              {
                phase: "Fase 2",
                title: "Ontdekkingsfase",
                desc: "Stel feitgerichte én meningsgerichte vragen. Luister actief en empathisch. Gebruik pingpong en LEAD questioning om dieper te graven.",
                techniques: [
                  "Feitgerichte vragen",
                  "Open vragen",
                  "Actief luisteren",
                  "Pingpong techniek",
                  "LEAD questioning"
                ],
                color: "hh-secondary",
              },
              {
                phase: "Fase 3",
                title: "Aanbevelingsfase",
                desc: "Toon empathie, presenteer oplossing, voordeel én baat. Vraag mening onder alternatieve vorm.",
                techniques: ["Empathie tonen", "Oplossing", "Voordeel", "Baat", "Mening vragen"],
                color: "hh-accent",
              },
              {
                phase: "Fase 4",
                title: "Beslissingsfase",
                desc: "Proefafsluiting, handle vragen/bezwaren/twijfels met rust en vertrouwen. Omarm angst en bezorgdheden.",
                techniques: ["Proefafsluiting", "Klant stelt vragen", "Bezwaren", "Twijfels", "Angst/Bezorgdheden"],
                color: "hh-success",
              },
              {
                phase: "Algemeen",
                title: "Overal toepasbaar",
                desc: "Deze techniek gebruik je in alle fases — antwoord altijd op de vraag die écht gesteld wordt.",
                techniques: ["Antwoord op de vraag"],
                color: "hh-muted",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className={`p-6 rounded-[16px] shadow-hh-md border-hh-border hover:shadow-hh-lg transition-shadow ${idx === 5 ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                <Badge className={`bg-${item.color}/10 text-${item.color} border-${item.color}/20 mb-3`}>
                  {item.phase}
                </Badge>
                <h3 className="text-[20px] leading-[28px] sm:text-[24px] sm:leading-[32px] text-hh-text mb-2">
                  {item.title}
                </h3>
                <p className="text-[14px] leading-[20px] sm:text-[16px] sm:leading-[24px] text-hh-muted mb-4">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.techniques.map((tech, techIdx) => (
                    <Badge
                      key={techIdx}
                      variant="outline"
                      className="text-[11px] sm:text-[12px]"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
              {[
                {
                  phase: "Fase 0",
                  title: "Pre-contact (Desktop research)",
                  desc: "Desktop research, SWOT analyse, CRM check, One Minute Manager voorbereiding. Kom goed voorbereid aan tafel.",
                  techniques: ["Desktop research", "SWOT analyse", "CRM analyse", "One Minute Manager"],
                  color: "hh-muted",
                },
                {
                  phase: "Fase 1",
                  title: "Openingsfase",
                  desc: "Creëer het juiste koopklimaat. Start met een gentleman's agreement en een sterke firmavoorstelling. Stel de perfecte instapvraag.",
                  techniques: ["Koopklimaat creëren", "Gentleman's agreement", "Firmavoorstelling", "Instapvraag"],
                  color: "hh-primary",
                },
                {
                  phase: "Fase 2",
                  title: "Ontdekkingsfase",
                  desc: "Stel feitgerichte én meningsgerichte vragen. Luister actief en empathisch. Gebruik pingpong en LEAD questioning om dieper te graven.",
                  techniques: [
                    "Feitgerichte vragen",
                    "Open vragen",
                    "Actief luisteren",
                    "Pingpong techniek",
                    "LEAD questioning"
                  ],
                  color: "hh-secondary",
                },
                {
                  phase: "Fase 3",
                  title: "Aanbevelingsfase",
                  desc: "Toon empathie, presenteer oplossing, voordeel én baat. Vraag mening onder alternatieve vorm.",
                  techniques: ["Empathie tonen", "Oplossing", "Voordeel", "Baat", "Mening vragen"],
                  color: "hh-accent",
                },
                {
                  phase: "Fase 4",
                  title: "Beslissingsfase",
                  desc: "Proefafsluiting, handle vragen/bezwaren/twijfels met rust en vertrouwen. Omarm angst en bezorgdheden.",
                  techniques: ["Proefafsluiting", "Klant stelt vragen", "Bezwaren", "Twijfels", "Angst/Bezorgdheden"],
                  color: "hh-success",
                },
                {
                  phase: "Algemeen",
                  title: "Overal toepasbaar",
                  desc: "Deze techniek gebruik je in alle fases — antwoord altijd op de vraag die écht gesteld wordt.",
                  techniques: ["Antwoord op de vraag"],
                  color: "hh-muted",
                },
              ].map((item, idx) => (
                <Card
                  key={idx}
                  className="p-6 rounded-[16px] shadow-hh-md border-hh-border w-[82vw] flex-shrink-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <Badge className={`bg-${item.color}/10 text-${item.color} border-${item.color}/20 mb-3`}>
                    {item.phase}
                  </Badge>
                  <h3 className="text-[20px] leading-[28px] text-hh-text mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] leading-[20px] text-hh-muted mb-4">
                    {item.desc}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.techniques.map((tech, techIdx) => (
                      <Badge
                        key={techIdx}
                        variant="outline"
                        className="text-[11px]"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Over Hugo - Sectie 1: "Laatste hoofdstuk" + 1-op-10 eerlijkheid */}
      <section className="bg-white py-20 sm:py-32" id="over-hugo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Gecentreerde titel - consistent met andere secties */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-hh-primary/10 text-hh-primary border-hh-primary/20 mb-6 text-[14px] sm:text-[16px] px-4 py-1.5">
              Het verhaal achter de coach
            </Badge>
            <h2 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] text-hh-text mb-6">
              Ik ben Hugo Herbots.<br/>En dit is mijn laatste hoofdstuk.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Story */}
            <div className="space-y-6">
              {/* Story - Eerlijkheid tekst */}
              <div className="space-y-4">
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  40 jaar training, 20.000 verkopers getraind in meer dan 500 bedrijven.
                </p>
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  Maar in alle eerlijkheid? <span className="font-[700]">Slechts 1 op de 10 werd een echte topverkoper.</span>
                </p>
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  Waarom? Omdat je ook niet leert golfen door ernaar te kijken — je moet het doen.
                </p>
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  En economisch was één-op-één training onverantwoord — welk bedrijf betaalt 
                  €2.000 per halve dag voor individuele coaching?
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border text-center">
                  <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] font-[700] text-hh-text mb-1">
                    40+
                  </div>
                  <div className="text-[12px] leading-[16px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                    Jaar training
                  </div>
                </Card>
                <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border text-center">
                  <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] font-[700] text-hh-text mb-1">
                    20K+
                  </div>
                  <div className="text-[12px] leading-[16px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                    Mensen getraind
                  </div>
                </Card>
                <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border text-center">
                  <div className="text-[28px] leading-[36px] sm:text-[32px] sm:leading-[40px] font-[700] text-hh-text mb-1">
                    500+
                  </div>
                  <div className="text-[12px] leading-[16px] sm:text-[14px] sm:leading-[20px] text-hh-muted">
                    Bedrijven
                  </div>
                </Card>
              </div>

              {/* Photo Grid - Hugo Walking + Pricing Card - GELIJKE HOOGTE */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="relative rounded-[16px] overflow-hidden shadow-hh-md">
                  <img 
                    src={hugoWalking} 
                    alt="Hugo Herbots walking"
                    className="w-full h-full object-cover"
                    style={{ aspectRatio: '4/5' }}
                  />
                </div>
                <Card className="p-4 sm:p-6 rounded-[16px] shadow-hh-md border-0 bg-hh-ink text-white flex flex-col justify-center" style={{ aspectRatio: '4/5' }}>
                  <div className="flex flex-col h-full justify-center items-center">
                    <div className="text-[11px] leading-[16px] sm:text-[14px] sm:leading-[20px] text-hh-ui-300 mb-1 sm:mb-2">
                      Vroeger live
                    </div>
                    <div className="text-[32px] leading-[40px] sm:text-[48px] sm:leading-[56px] font-[700] mb-1 sm:mb-2">
                      €2K
                    </div>
                    <div className="text-[10px] leading-[14px] sm:text-[12px] sm:leading-[16px] text-hh-ui-300 mb-4 sm:mb-6">
                      per halve dag
                    </div>
                    <div className="w-full border-t border-hh-ui-600 pt-4 sm:pt-6 text-center">
                      <div className="text-[11px] leading-[16px] sm:text-[14px] sm:leading-[20px] text-hh-ui-300 mb-1 sm:mb-2">
                        Nu met AI
                      </div>
                      <div className="text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] font-[700] mb-1">
                        €499
                      </div>
                      <div className="text-[10px] leading-[14px] sm:text-[12px] sm:leading-[16px] text-hh-ui-300">
                        per maand 24/7
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Large Hugo Portrait */}
            <div className="relative">
              <div className="relative rounded-[24px] overflow-hidden shadow-hh-lg">
                <img 
                  src={hugoPortrait} 
                  alt="Hugo Herbots - Sales trainer en coach"
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Over Hugo - Sectie 2: "Waarom AI?" (Gespiegeld - tekst links, foto rechts) */}
      <section className="bg-hh-ui-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Large Hugo Flipboard Photo */}
            <div className="relative order-2 lg:order-1">
              <div className="relative rounded-[24px] overflow-hidden shadow-hh-lg">
                <img 
                  src={hugoFlipboard} 
                  alt="Hugo Herbots teaching with flipboard"
                  className="w-full h-full object-cover"
                  style={{ aspectRatio: '3/4' }}
                />
              </div>
            </div>

            {/* Right Column - AI Story */}
            <div className="space-y-6 order-1 lg:order-2">
              {/* Waarom AI nu anders is */}
              <div className="space-y-4">
                <h3 className="text-[24px] leading-[32px] sm:text-[28px] sm:leading-[36px] lg:text-[32px] lg:leading-[40px] text-hh-text font-[700]">
                  Waarom nu? Waarom AI?
                </h3>
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  Nu kan het anders. Dankzij AI train je met mij — niet één keer per week in een 
                  groep, maar <span className="font-[700]">elke dag, privé. Van thuis, veilig.</span> Met directe 
                  feedback zoals ik dat live zou geven.
                </p>
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  Vanaf €149 per maand. Geen groepssessies waar je bang bent om fouten te maken. 
                  Gewoon jij en ik, 24/7 beschikbaar.
                </p>
                <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-text">
                  Ik ben nu in het laatste hoofdstuk van mijn leven. 40 jaar verfijnde 
                  scripts, 25 technieken, 20.000+ sessies — ik wil niet dat deze kennis 
                  verdwijnt.
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button 
                  size="lg" 
                  variant="ink" 
                  className="text-[16px] h-12 px-6"
                  onClick={() => handleNavigate("preview")}
                >
                  Train met Hugo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Social Proof */}
      <section className="bg-white py-20 sm:py-32" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 mb-6 text-[14px] sm:text-[16px]">
              Wat professionals zeggen
            </Badge>
            <h2 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] text-hh-text mb-4">
              Echte resultaten van echte teams
            </h2>
            <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-hh-muted max-w-2xl mx-auto">
              Van SDR's tot VP's Sales — Hugo's methode werkt in elk stadium van je carrière
            </p>
          </div>

          {/* Desktop: Grid | Mobile: Horizontal scroll */}
          <div className="hidden md:grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                quote: "Wie schrijft die blijft, zegt Hugo — en het klopt. Ik haatte sales. 6% conversie, elke maand stress. 9 maanden met Hugo → 12% conversie. Dubbel zoveel commissie.",
                name: "Sarah van Dijk",
                role: "SDR",
                company: "SaaS",
                metric: "+100%",
                metricLabel: "Conversie stijging",
              },
              {
                quote: "Eindelijk een training die écht werkt. Geen theorie, maar praktijk. Mijn team gebruikt de technieken dagelijks.",
                name: "Mark de Jong",
                role: "VP Sales",
                company: "Enterprise Software",
                stat: "€450K",
                statLabel: "Extra ARR in Q1",
              },
              {
                quote: "De live sessies met Hugo zijn het verschil. Real-time vragen stellen en direct antwoorden — precies wat ik nodig had.",
                name: "Lisa Vermeer",
                role: "Account Executive",
                company: "B2B Tech",
                stat: "92%",
                statLabel: "Closing rate",
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="p-6 rounded-[16px] shadow-hh-md border-hh-border bg-hh-ui-50 hover:shadow-hh-lg transition-shadow"
              >
                <div className="flex flex-col h-full">
                  {/* Stat Badge */}
                  <div className="mb-4">
                    <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20">
                      {testimonial.stat ? `${testimonial.stat} ${testimonial.statLabel}` : `${testimonial.metric} ${testimonial.metricLabel}`}
                    </Badge>
                  </div>

                  {/* Quote */}
                  <p className="text-[16px] leading-[24px] text-hh-text italic mb-6 flex-grow">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hh-primary to-hh-secondary flex items-center justify-center text-white text-[18px] font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-[16px] leading-[20px] text-hh-text font-medium">
                        {testimonial.name}
                      </p>
                      <p className="text-[14px] leading-[18px] text-hh-muted">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden overflow-x-auto -mx-4 px-4 pb-2">
            <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
              {[
                {
                  quote: "Wie schrijft die blijft, zegt Hugo — en het klopt. Ik haatte sales. 6% conversie, elke maand stress. 9 maanden met Hugo → 12% conversie. Dubbel zoveel commissie.",
                  name: "Sarah van Dijk",
                  role: "SDR",
                  company: "SaaS",
                  metric: "+100%",
                  metricLabel: "Conversie stijging",
                },
                {
                  quote: "Eindelijk een training die écht werkt. Geen theorie, maar praktijk. Mijn team gebruikt de technieken dagelijks.",
                  name: "Mark de Jong",
                  role: "VP Sales",
                  company: "Enterprise Software",
                  stat: "€450K",
                  statLabel: "Extra ARR in Q1",
                },
                {
                  quote: "De live sessies met Hugo zijn het verschil. Real-time vragen stellen en direct antwoorden — precies wat ik nodig had.",
                  name: "Lisa Vermeer",
                  role: "Account Executive",
                  company: "B2B Tech",
                  stat: "92%",
                  statLabel: "Closing rate",
                },
              ].map((testimonial, idx) => (
                <Card
                  key={idx}
                  className="p-6 rounded-[16px] shadow-hh-md border-hh-border bg-hh-ui-50 w-[82vw] flex-shrink-0"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="flex flex-col h-full">
                    {/* Stat Badge */}
                    <div className="mb-4">
                      <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20">
                        {testimonial.stat ? `${testimonial.stat} ${testimonial.statLabel}` : `${testimonial.metric} ${testimonial.metricLabel}`}
                      </Badge>
                    </div>

                    {/* Quote */}
                    <p className="text-[16px] leading-[24px] text-hh-text italic mb-6 flex-grow">
                      "{testimonial.quote}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hh-primary to-hh-secondary flex items-center justify-center text-white text-[18px] font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[16px] leading-[20px] text-hh-text font-medium">
                          {testimonial.name}
                        </p>
                        <p className="text-[14px] leading-[18px] text-hh-muted">
                          {testimonial.role} • {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32" id="prijzen">
        <div className="text-center mb-12 sm:mb-16">
          <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 mb-6 text-[14px] sm:text-[16px] px-4 py-1.5">
            Founder Annual –50% (beperkt)
          </Badge>
          <h2 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] text-hh-text mb-6">
            Vroeger: €2.000 per halve dag. Nu: vanaf €149/maand onbeperkt.
          </h2>
          <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] lg:text-[20px] lg:leading-[32px] text-hh-muted max-w-3xl mx-auto mb-8">
            Live met Hugo kost €2.000 per halve dag voor een kleine groep. Met de AI-salescoach en dagelijkse live sessies oefen je elke dag — wanneer het jou past.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className={`text-[16px] leading-[24px] ${!isYearly ? 'text-hh-text font-medium' : 'text-hh-muted'}`}>
              Maandelijks
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-hh-primary"
            />
            <span className={`text-[16px] leading-[24px] ${isYearly ? 'text-hh-text font-medium' : 'text-hh-muted'}`}>
              Jaarlijks
            </span>
            {isYearly && (
              <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 ml-2">
                Bespaar 50%
              </Badge>
            )}
          </div>
        </div>
        
        {/* Desktop: Grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
          <PricingTier
            name="Pro"
            price={isYearly ? "€119" : "€149"}
            period="/maand"
            priceNote={isYearly ? "Gefactureerd jaarlijks" : undefined}
            features={[
              "AI-avatar simulaties (onbeperkt)",
              "Persoonlijk dashboard & feedback",
              "Custom scenarios",
              "Community & challenges",
              "Email support",
              "Exports & rapportages",
            ]}
            cta="Train met Hugo"
            onCtaClick={() => handleNavigate("preview")}
          />
          <PricingTier
            name="Founder (Early Bird)"
            price={isYearly ? "€249,50" : "€499"}
            period="/maand"
            priceNote={isYearly ? "Gefactureerd jaarlijks" : undefined}
            features={[
              "Alles van Pro",
              "Dagelijkse live sessies (ma–vr) + Q&A",
              "Onmiddellijk herbekijken met chapters",
              "Founder Annual –50% (beperkte plaatsen)",
              "Prioriteit op nieuwe scenario's",
              "Priority support",
            ]}
            cta="Train met Hugo"
            highlighted
            badge={isYearly ? "–50% Early Bird" : "Meest gekozen"}
            onCtaClick={() => handleNavigate("preview")}
          />
          <PricingTier
            name="Company (10+ seats)"
            price="Op aanvraag"
            features={[
              "Alles van Founder",
              "Teamdashboard & reporting",
              "Custom scenario's & integraties (SSO/LMS/CRM)",
              "Dedicated success manager",
              "Interne Q&A-momenten voor je team",
            ]}
            cta="Plan een gesprek"
          />
        </div>

        {/* Mobile: Horizontal swipe cards */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4 pb-2">
          <div className="flex gap-4" style={{ scrollSnapType: 'x mandatory' }}>
            <div className="w-[82vw] flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <PricingTier
                name="Pro"
                price={isYearly ? "€119" : "€149"}
                period="/maand"
                priceNote={isYearly ? "Gefactureerd jaarlijks" : undefined}
                features={[
                  "AI-avatar simulaties (onbeperkt)",
                  "Persoonlijk dashboard & feedback",
                  "Custom scenarios",
                  "Community & challenges",
                  "Email support",
                  "Exports & rapportages",
                ]}
                cta="Train met Hugo"
                onCtaClick={() => handleNavigate("preview")}
              />
            </div>
            <div className="w-[82vw] flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <PricingTier
                name="Founder (Early Bird)"
                price={isYearly ? "€249,50" : "€499"}
                period="/maand"
                priceNote={isYearly ? "Gefactureerd jaarlijks" : undefined}
                features={[
                  "Alles van Pro",
                  "Dagelijkse live sessies (ma–vr) + Q&A",
                  "Onmiddellijk herbekijken met chapters",
                  "Founder Annual –50% (beperkte plaatsen)",
                  "Prioriteit op nieuwe scenario's",
                  "Priority support",
                ]}
                cta="Train met Hugo"
                highlighted
                badge={isYearly ? "–50% Early Bird" : "Meest gekozen"}
                onCtaClick={() => handleNavigate("preview")}
              />
            </div>
            <div className="w-[82vw] flex-shrink-0" style={{ scrollSnapAlign: 'start' }}>
              <PricingTier
                name="Company (10+ seats)"
                price="Op aanvraag"
                features={[
                  "Alles van Founder",
                  "Teamdashboard & reporting",
                  "Custom scenario's & integraties (SSO/LMS/CRM)",
                  "Dedicated success manager",
                  "Interne Q&A-momenten voor je team",
                ]}
                cta="Plan een gesprek"
              />
            </div>
          </div>
        </div>
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => handleNavigate("pricing")}
          >
            Bekijk volledige prijzen →
          </Button>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-hh-ui-50 py-20 sm:py-32" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="bg-hh-primary/10 text-hh-primary border-hh-primary/20 mb-6 text-[14px] sm:text-[16px] px-4 py-1.5">
              FAQ
            </Badge>
            <h2 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] text-hh-text mb-12 sm:mb-16">
              Veelgestelde vragen
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Hoe werkt Hugo's AI-salescoach?",
                a: "Je oefent gesprekken met mijn avatar. Na elke sessie krijg je directe feedback op 25 technieken — precies zoals ik live coach.",
              },
              {
                q: "Kan ik eigen scenario's toevoegen?",
                a: "Ja, vanaf Pro. Upload je cases, bezwaren en context  ik pas de training daarop aan.",
              },
              {
                q: "Is er een gratis trial?",
                a: "Ja. 14 dagen volledig proberen, zonder creditcard.",
              },
              {
                q: "Kan ik opzeggen wanneer ik wil?",
                a: "Ja, altijd. Geen verplichte looptijd. Zeg op via je account en je toegang stopt aan het einde van je betaalperiode.",
              },
              {
                q: "Wat als ik geen tijd heb voor dagelijkse live sessies?",
                a: "Geen probleem. Alle live sessies worden binnen 2 uur herbekeken beschikbaar gesteld met chapters. Je kunt ze terugkijken wanneer het jou uitkomt.",
              },
              {
                q: "Is dit geschikt voor mijn sector?",
                a: "Ja. De technieken zijn universeel toepasbaar — B2B, B2C, SaaS, enterprise, fintech. Psychologie verandert niet per sector.",
              },
              {
                q: "Wat gebeurt er na de 14 dagen trial?",
                a: "Als je niet annuleert, begint je betaalde abonnement automatisch. Je krijgt 48 uur voor afloop een herinnering.",
              },
              {
                q: "Kan ik Hugo een vraag stellen?",
                a: "Ja, tijdens de dagelijkse live Q&A sessies (ma–vr). Of stel je vraag via de community en ik beantwoord binnen 24 uur.",
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
                <h3 className="text-[18px] leading-[26px] font-semibold text-hh-text mb-2">
                  {item.q}
                </h3>
                <p className="text-[16px] leading-[24px] text-hh-muted">
                  {item.a}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-hh-ink py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-[36px] leading-[44px] sm:text-[44px] sm:leading-[52px] lg:text-[56px] lg:leading-[64px] text-white mb-6">
            25 technieken. 5 fasen. €149/maand.
          </h2>
          <p className="text-[18px] leading-[28px] sm:text-[20px] sm:leading-[32px] text-hh-ui-300 mb-10 max-w-2xl mx-auto">
            Sales is mensenwerk. 'People buy people' — en de psychologie leer je hier.
          </p>
          <Button 
            size="lg" 
            variant="ink" 
            className="text-[18px] h-14 px-8"
            onClick={() => handleNavigate("preview")}
          >
            Train met Hugo <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hh-border py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <Logo variant="horizontal" className="text-hh-ink mb-4 text-[18px]" />
              <p className="text-[14px] leading-[20px] text-hh-muted">
                AI-salescoach door Hugo Herbots
              </p>
            </div>
            <div>
              <h4 className="text-[16px] leading-[24px] font-medium text-hh-text mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-[14px] leading-[20px] text-hh-muted">
                <li>
                  <button 
                    onClick={() => handleNavigate("pricing")} 
                    className="hover:text-hh-primary transition-colors"
                  >
                    Prijzen
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigate("landing")} 
                    className="hover:text-hh-primary transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigate("preview")} 
                    className="hover:text-hh-primary transition-colors"
                  >
                    Bekijk demo met Hugo
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[16px] leading-[24px] font-medium text-hh-text mb-3">
                Bedrijf
              </h4>
              <ul className="space-y-2 text-[14px] leading-[20px] text-hh-muted">
                <li>
                  <button 
                    onClick={() => handleNavigate("about")} 
                    className="hover:text-hh-primary transition-colors"
                  >
                    Over Hugo
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-hh-primary transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[16px] leading-[24px] font-medium text-hh-text mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-[14px] leading-[20px] text-hh-muted">
                <li><a href="#" className="hover:text-hh-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-hh-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-hh-border text-center text-[14px] leading-[20px] text-hh-muted">
            © 2025 HugoHerbots.ai. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>

      {/* Sticky Bottom CTA - Mobile only */}
      <StickyBottomCTA navigate={handleNavigate} />
    </div>
  );
}