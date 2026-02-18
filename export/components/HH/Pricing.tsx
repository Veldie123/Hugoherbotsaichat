import { useState } from "react";
import { Button } from "../ui/button";
import { PricingTier } from "./PricingTier";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { StickyHeader } from "./StickyHeader";
import { Logo } from "./Logo";
import { Check, X, Shield, Lock, Zap, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Page = "landing" | "pricing" | "about" | "login" | "signup" | "preview" | "onboarding" | "dashboard" | "roleplay" | "library" | "builder" | "sessions" | "analytics" | "settings";

interface PricingProps {
  navigate?: (page: Page) => void;
}

export function Pricing({ navigate }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false); // Default to monthly (€149 matches marketing copy)

  const handleNavigate = (page: Page) => {
    if (navigate) navigate(page);
  };

  const plans = [
    {
      name: "Pro",
      monthlyPrice: "€149",
      yearlyPrice: "€119",
      features: [
        "AI-avatar simulaties (onbeperkt)",
        "Persoonlijk dashboard & feedback",
        "Video platform (5 fasen, 25 technieken)",
        "Custom scenarios",
        "Community & challenges",
        "Email support",
        "Exports & rapportages",
      ],
      limits: {
        sessions: "Unlimited",
        users: "1",
        scenarios: "Custom",
        liveTraining: "Nee",
        support: "Email",
      },
    },
    {
      name: "Founder (Early Bird)",
      monthlyPrice: "€499",
      yearlyPrice: "€249,50",
      yearlyNote: "Gefactureerd jaarlijks",
      expirationDate: "31 maart 2025",
      whyDiscount: "Voor early adopters die helpen het platform te verbeteren",
      features: [
        "Alles van Pro",
        "Video platform (5 fasen, 25 technieken)",
        "Dagelijkse live sessies (ma–vr) + Q&A",
        "Onmiddellijk herbekijken met chapters",
        "Founder Annual –50% (voor altijd)",
        "Prioriteit op nieuwe scenario's",
        "Priority support",
      ],
      limits: {
        sessions: "Unlimited",
        users: "1",
        scenarios: "Custom",
        liveTraining: "Ja (ma–vr)",
        support: "Priority",
      },
      highlighted: true,
      badge: isYearly ? "–50% Early Bird" : undefined,
    },
    {
      name: "Company (10+ seats)",
      monthlyPrice: "Op aanvraag",
      yearlyPrice: "Op aanvraag",
      features: [
        "Alles van Founder",
        "Video platform (5 fasen, 25 technieken)",
        "Teamdashboard & reporting",
        "Custom scenario's & integraties (SSO/LMS/CRM)",
        "Dedicated success manager",
        "Interne Q&A-momenten voor je team",
      ],
      limits: {
        sessions: "Unlimited",
        users: "10+",
        scenarios: "Enterprise",
        liveTraining: "Ja + Custom",
        support: "Dedicated",
      },
    },
  ];

  const featureComparison = [
    {
      category: "Live Training & Sessies",
      features: [
        { name: "Dagelijkse live sessies (ma–vr)", pro: false, founder: true, company: true },
        { name: "Live opnames met chapters", pro: false, founder: true, company: true },
        { name: "Role-play sessies met AI", pro: "Unlimited", founder: "Unlimited", company: "Unlimited" },
        { name: "Scenario bibliotheek", pro: true, founder: true, company: true },
        { name: "Custom scenarios", pro: true, founder: true, company: true },
        { name: "Scenario builder", pro: false, founder: false, company: true },
      ],
    },
    {
      category: "Feedback & Analytics",
      features: [
        { name: "AI feedback", pro: "Geavanceerd", founder: "Geavanceerd", company: "Enterprise" },
        { name: "Transcript analyse", pro: true, founder: true, company: true },
        { name: "Techniek scores", pro: true, founder: true, company: true },
        { name: "Team analytics", pro: false, founder: false, company: true },
        { name: "Custom reports", pro: false, founder: false, company: true },
      ],
    },
    {
      category: "Team & Beheer",
      features: [
        { name: "Gebruikers", pro: "1", founder: "1", company: "10+" },
        { name: "Admin dashboard", pro: false, founder: false, company: true },
        { name: "Role-based access", pro: false, founder: false, company: true },
        { name: "SSO & integraties", pro: false, founder: false, company: true },
      ],
    },
    {
      category: "Support",
      features: [
        { name: "Email support", pro: true, founder: true, company: true },
        { name: "Priority support", pro: false, founder: true, company: true },
        { name: "Dedicated success manager", pro: false, founder: false, company: true },
        { name: "Custom onboarding", pro: false, founder: false, company: true },
      ],
    },
  ];

  return (
    <div className="bg-hh-bg min-h-screen">
      {/* Sticky Header */}
      <StickyHeader currentPage="pricing" navigate={handleNavigate} />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-16 text-center">
        <Badge className="bg-hh-warn/10 text-hh-warn border-hh-warn/20 mb-6 text-[14px] sm:text-[16px] px-4 py-1.5">
          Founder Annual –50% (beperkt)
        </Badge>
        <h1 className="mb-4 text-[28px] leading-[36px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] px-4">
          De waarde van 40 jaar training, voor een fractie van live
        </h1>
        <p className="text-[14px] leading-[22px] sm:text-[16px] sm:leading-[24px] lg:text-[18px] lg:leading-[26px] text-hh-muted max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
          Price is what you pay, value is what you get! Live met Hugo kost €2.000 per halve dag. Met de AI-salescoach en dagelijkse live sessies oefen je elke dag — wanneer het jou past.
        </p>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
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

        {/* Pricing tiers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            const period = isYearly ? "/maand" : "/maand";
            
            return (
              <PricingTier
                key={plan.name}
                name={plan.name}
                price={price}
                period={period}
                priceNote={isYearly && plan.yearlyNote ? plan.yearlyNote : undefined}
                expirationDate={isYearly && plan.expirationDate ? `Eindigt ${plan.expirationDate}` : undefined}
                whyDiscount={isYearly && plan.whyDiscount ? plan.whyDiscount : undefined}
                features={plan.features}
                cta="Start gratis"
                highlighted={plan.highlighted}
                badge={plan.badge}
                onCtaClick={() => handleNavigate("signup")}
              />
            );
          })}
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-hh-ui-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-hh-primary/10 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-hh-primary" />
              </div>
              <h3 className="text-[16px] leading-[24px] font-medium text-hh-text mb-1">
                GDPR Compliant
              </h3>
              <p className="text-[14px] leading-[20px] text-hh-muted">
                Jouw data is veilig
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-hh-success/10 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-hh-success" />
              </div>
              <h3 className="text-[16px] leading-[24px] font-medium text-hh-text mb-1">
                SSL Encrypted
              </h3>
              <p className="text-[14px] leading-[20px] text-hh-muted">
                Beveiligde verbinding
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-hh-warn/10 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-hh-warn" />
              </div>
              <h3 className="text-[16px] leading-[24px] font-medium text-hh-text mb-1">
                Instant Setup
              </h3>
              <p className="text-[14px] leading-[20px] text-hh-muted">
                Start binnen 2 minuten
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="mb-4">
            Vergelijk alle features
          </h2>
          <p className="text-[18px] leading-[26px] text-hh-muted">
            Zie precies wat je krijgt per plan — eerlijk en transparant
          </p>
        </div>

        <Card className="rounded-[16px] shadow-hh-md border-hh-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Feature</TableHead>
                <TableHead className="text-center">Pro</TableHead>
                <TableHead className="text-center bg-hh-warn/5">Founder</TableHead>
                <TableHead className="text-center">Company</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {featureComparison.map((category, categoryIdx) => (
                <React.Fragment key={category.category}>
                  <TableRow className="bg-hh-ui-50">
                    <TableCell
                      colSpan={4}
                      className="font-semibold text-hh-text"
                    >
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.features.map((feature, idx) => (
                    <TableRow key={`${category.category}-${feature.name}-${idx}`}>
                      <TableCell className="text-hh-text">
                        {feature.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-hh-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-hh-muted mx-auto" />
                          )
                        ) : (
                          <span className="text-hh-text">{feature.pro}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center bg-hh-warn/5">
                        {typeof feature.founder === "boolean" ? (
                          feature.founder ? (
                            <Check className="w-5 h-5 text-hh-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-hh-muted mx-auto" />
                          )
                        ) : (
                          <span className="text-hh-text">{feature.founder}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.company === "boolean" ? (
                          feature.company ? (
                            <Check className="w-5 h-5 text-hh-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-hh-muted mx-auto" />
                          )
                        ) : (
                          <span className="text-hh-text">{feature.company}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* FAQ */}
      <section className="bg-hh-ui-50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="mb-8 text-center">
            Veelgestelde vragen
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Hoe werkt Hugo's AI-salescoach?",
                a: "Je oefent gesprekken met mijn avatar. Na elke sessie krijg je directe feedback op 25 technieken — net als bij live training.",
              },
              {
                q: "Krijg ik live training?",
                a: "Ja. Dagelijks (ma–vr) 45–60 min + Q&A. Opnames zijn binnen 2 uur beschikbaar met chapters.",
              },
              {
                q: "Kan ik eigen scenario's toevoegen?",
                a: "Ja, voor Company. Upload cases, bezwaren en context — wij passen de training daarop aan.",
              },
              {
                q: "Is er een gratis trial?",
                a: "Ja. 14 dagen volledig proberen, zonder creditcard.",
              },
              {
                q: "Wat is het verschil maand vs. jaar?",
                a: "Jaar = –50%: €249,50/mnd, gefactureerd jaarlijks. Beperkt Founder-aanbod.",
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

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="p-12 rounded-[24px] shadow-hh-lg border-hh-primary bg-gradient-to-r from-hh-primary/5 to-transparent text-center">
          <h2 className="mb-4">
            €2.000 per halve dag live. Nu €149/maand onbeperkt.
          </h2>
          <p className="text-[18px] leading-[26px] text-hh-muted mb-8 max-w-2xl mx-auto">
            Probeer 14 dagen. Start binnen 2 minuten. Annuleer wanneer je wilt.
          </p>
          <Button 
            size="lg" 
            variant="ink" 
            className="gap-2"
            onClick={() => handleNavigate("preview")}
          >
            Train met Hugo <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-hh-border py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8 mb-8 sm:mb-6 lg:mb-8">
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
    </div>
  );
}