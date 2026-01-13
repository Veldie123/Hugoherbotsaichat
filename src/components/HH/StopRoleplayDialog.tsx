import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";

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
      <DialogContent className="max-w-[520px] p-0 overflow-hidden">
        {/* Header with friendly green accent */}
        <div className="bg-green-50 border-b border-green-200 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-[24px] font-bold text-hh-text mb-2">
                Goed bezig! 👏
              </DialogTitle>
              <DialogDescription className="text-[15px] text-hh-muted leading-relaxed">
                Je rollenspel is afgerond. Nu krijg je gedetailleerde feedback van Hugo.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-[14px] text-blue-900 font-medium mb-1">
              📊 Wat komt er nu?
            </p>
            <ul className="text-[14px] text-blue-800 space-y-1.5 ml-4">
              <li>• Je persoonlijke score & analyse</li>
              <li>• Hugo's tips per gebruikte techniek</li>
              <li>• Concrete verbeterpunten voor volgende keer</li>
            </ul>
          </div>
          
          <p className="text-[14px] text-hh-muted text-center">
            Klaar om je resultaten te bekijken?
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 bg-hh-ui-50 border-t border-hh-border">
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-12 text-[15px]"
          >
            Bekijk Feedback 🎯
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
