import { Progress } from "../ui/progress";

interface ProgressBarProps {
  label: string;
  value: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function ProgressBar({
  label,
  value,
  size = "md",
  showValue = true,
}: ProgressBarProps) {
  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[14px] leading-[20px] text-hh-text">{label}</span>
        {showValue && (
          <span className="text-[14px] leading-[20px] font-medium text-hh-muted">
            {value}%
          </span>
        )}
      </div>
      <Progress value={value} className={heights[size]} />
    </div>
  );
}
