import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle2, BarChart3, Lightbulb, Target } from "lucide-react";

interface StopRoleplayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StopRoleplayDialog({
  open,
  onOpenChange,
  onConfirm,
}: StopRoleplayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden border-hh-border">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1E2A3B' }}>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-[20px] font-semibold text-hh-text">
              Sessie afgerond
            </DialogTitle>
          </div>
          <DialogDescription className="text-[14px] text-hh-muted leading-relaxed">
            Je oefensessie is voltooid. Bekijk nu je persoonlijke feedback en verbeterpunten.
          </DialogDescription>
        </div>

        {/* Body - what's next */}
        <div className="px-6 pb-6">
          <div className="border border-hh-border rounded-lg divide-y divide-hh-border">
            <div className="flex items-center gap-3 p-3">
              <BarChart3 className="w-4 h-4 text-hh-primary flex-shrink-0" />
              <span className="text-[13px] text-hh-text">Je persoonlijke score & analyse</span>
            </div>
            <div className="flex items-center gap-3 p-3">
              <Lightbulb className="w-4 h-4 text-hh-primary flex-shrink-0" />
              <span className="text-[13px] text-hh-text">Hugo's tips per gebruikte techniek</span>
            </div>
            <div className="flex items-center gap-3 p-3">
              <Target className="w-4 h-4 text-hh-primary flex-shrink-0" />
              <span className="text-[13px] text-hh-text">Concrete verbeterpunten voor volgende keer</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-hh-border bg-hh-ui-50">
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full font-medium h-11 text-[14px]"
            style={{ backgroundColor: '#1E2A3B' }}
          >
            Bekijk Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
