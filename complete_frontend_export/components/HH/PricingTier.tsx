import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

interface PricingTierProps {
  name: string;
  price: string;
  period?: string;
  priceNote?: string;
  features: string[];
  cta?: string;
  highlighted?: boolean;
  badge?: string;
  onCtaClick?: () => void;
  className?: string;
}

export function PricingTier({
  name,
  price,
  period = "",
  priceNote,
  features,
  cta = "Kies plan",
  highlighted = false,
  badge,
  onCtaClick,
  className = "",
}: PricingTierProps) {
  return (
    <Card
      className={`relative p-6 sm:p-8 flex flex-col h-full ${
        highlighted ? "border-hh-primary border-2 shadow-lg" : ""
      } ${className}`}
    >
      {badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hh-primary text-white border-0">
          {badge}
        </Badge>
      )}

      <div className="mb-6">
        <h3 className="text-[20px] leading-[28px] font-semibold text-hh-text mb-2">
          {name}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] sm:text-[40px] leading-[1] font-bold text-hh-text">
            {price}
          </span>
          {period && (
            <span className="text-[14px] leading-[20px] text-hh-muted">
              {period}
            </span>
          )}
        </div>
        {priceNote && (
          <p className="text-[12px] leading-[16px] text-hh-muted mt-1">
            {priceNote}
          </p>
        )}
      </div>

      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
            <span className="text-[14px] leading-[20px] text-hh-text">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        className={`w-full ${
          highlighted
            ? "bg-hh-primary hover:bg-hh-primary/90"
            : "bg-hh-text hover:bg-hh-text/90"
        }`}
        onClick={onCtaClick}
      >
        {cta}
      </Button>
    </Card>
  );
}
