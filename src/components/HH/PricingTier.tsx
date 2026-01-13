import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Check, Clock, Info } from "lucide-react";

interface PricingTierProps {
  name: string;
  price: string;
  period?: string;
  priceNote?: string;
  expirationDate?: string;
  whyDiscount?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
  onCtaClick?: () => void;
}

export function PricingTier({
  name,
  price,
  period = "per maand",
  priceNote,
  expirationDate,
  whyDiscount,
  features,
  cta,
  highlighted = false,
  badge,
  onCtaClick,
}: PricingTierProps) {
  return (
    <Card
      className={`p-4 sm:p-6 rounded-[16px] border-2 transition-all hover:shadow-hh-lg relative ${
        highlighted
          ? "border-hh-primary shadow-hh-md bg-gradient-to-b from-hh-ui-50 to-hh-bg"
          : "border-hh-border shadow-hh-sm"
      }`}
    >
      {badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-hh-warn text-white border-hh-warn">
          {badge}
        </Badge>
      )}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h3 className="text-[20px] leading-[28px] sm:text-[24px] sm:leading-[32px] font-semibold text-hh-text mb-2">
            {name}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] font-semibold text-hh-text">
              {price}
            </span>
            {period && (
              <span className="text-[14px] leading-[20px] sm:text-[16px] sm:leading-[24px] text-hh-muted">
                {period}
              </span>
            )}
          </div>
          {priceNote && (
            <p className="text-[12px] leading-[18px] text-hh-muted mt-1">
              {priceNote}
            </p>
          )}
          {expirationDate && (
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-hh-warn" />
              <span className="text-[12px] leading-[18px] text-hh-warn">
                {expirationDate}
              </span>
            </div>
          )}
          {whyDiscount && (
            <div className="flex items-center gap-2 mt-2">
              <Info className="w-4 h-4 text-hh-warn" />
              <span className="text-[12px] leading-[18px] text-hh-warn">
                {whyDiscount}
              </span>
            </div>
          )}
        </div>

        <Button
          className="w-full"
          variant={highlighted ? "ink" : "outline"}
          size="lg"
          onClick={onCtaClick}
        >
          {cta}
        </Button>

        <div className="space-y-3 pt-4 border-t border-hh-border">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
              <span className="text-[16px] leading-[24px] text-hh-text">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}