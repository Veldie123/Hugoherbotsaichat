import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Target, X, Info, Clock, Lightbulb, ListOrdered, MessageSquareQuote } from "lucide-react";
import { getCodeBadgeColors } from "../../utils/phaseColors";

interface TechniqueDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technique: {
    id?: string;
    nummer: string;
    naam: string;
    fase: string;
    tags?: string[];
    doel?: string;
    hoe?: string;
    wat?: string;
    waarom?: string;
    wanneer?: string;
    verkoper_intentie?: string[];
    context_requirements?: string[];
    stappenplan?: string[];
    voorbeeld?: string[];
  } | null;
  onSave?: (updatedTechnique: any) => void;
  isEditable?: boolean;
}

export function TechniqueDetailsDialog({
  open,
  onOpenChange,
  technique,
  onSave,
  isEditable = false,
}: TechniqueDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  useEffect(() => {
    if (technique && isEditing && !editedData) {
      setEditedData({
        naam: technique.naam,
        fase: technique.fase,
        tags: technique.tags || [],
        doel: technique.doel || "",
        hoe: technique.hoe || "",
        wat: technique.wat || "",
        waarom: technique.waarom || "",
        wanneer: technique.wanneer || "",
        verkoper_intentie: technique.verkoper_intentie || [],
        context_requirements: technique.context_requirements || [],
        stappenplan: technique.stappenplan || [],
      });
    }
  }, [technique, isEditing, editedData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      naam: technique?.naam || "",
      fase: technique?.fase || "",
      tags: technique?.tags || [],
      doel: technique?.doel || "",
      hoe: technique?.hoe || "",
      wat: technique?.wat || "",
      waarom: technique?.waarom || "",
      wanneer: technique?.wanneer || "",
      verkoper_intentie: technique?.verkoper_intentie || [],
      context_requirements: technique?.context_requirements || [],
      stappenplan: technique?.stappenplan || [],
    });
  };

  const handleSave = () => {
    if (onSave && technique && editedData) {
      onSave({
        ...technique,
        ...editedData,
      });
    }
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(null);
  };

  const handleAddTag = (tag: string) => {
    if (editedData && !editedData.tags.includes(tag)) {
      setEditedData({
        ...editedData,
        tags: [...editedData.tags, tag],
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        tags: editedData.tags.filter((tag: string) => tag !== tagToRemove),
      });
    }
  };

  if (!technique) return null;

  const displayData = isEditing ? editedData : technique;
  const codeBadgeColors = getCodeBadgeColors(technique.nummer);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-hh-border/50">
          <DialogTitle className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[15px] font-bold shrink-0 ${codeBadgeColors}`}>
              {technique.nummer}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={displayData.naam}
                  onChange={(e) =>
                    setEditedData({ ...editedData, naam: e.target.value })
                  }
                  className="text-[22px] font-semibold"
                  placeholder="Techniek naam"
                />
              ) : (
                <h2 className="text-[22px] leading-[28px] font-semibold text-hh-ink">
                  {displayData.naam}
                </h2>
              )}
              <p className="text-[13px] text-hh-muted mt-1">Fase {displayData.fase}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tags */}
          {displayData.tags && displayData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayData.tags?.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-[12px] bg-slate-50 text-slate-600 border-slate-200 font-normal px-3 py-1"
                >
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1.5 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {isEditing && (
                <Input
                  placeholder="Nieuwe tag..."
                  className="w-32 h-7 text-[12px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      handleAddTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Doel */}
            {displayData.doel && (
              <div className="bg-slate-50/70 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-hh-ink/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-hh-ink" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-hh-ink">Doel</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={displayData.doel}
                    onChange={(e) =>
                      setEditedData({ ...editedData, doel: e.target.value })
                    }
                    placeholder="Beschrijf het doel..."
                    rows={3}
                    className="text-[13px]"
                  />
                ) : (
                  <p className="text-[13px] leading-[20px] text-hh-text">
                    {displayData.doel}
                  </p>
                )}
              </div>
            )}

            {/* Wat */}
            {displayData.wat && (
              <div className="bg-slate-50/70 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-hh-ink/10 flex items-center justify-center">
                    <Info className="w-4 h-4 text-hh-ink" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-hh-ink">Wat</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={displayData.wat}
                    onChange={(e) =>
                      setEditedData({ ...editedData, wat: e.target.value })
                    }
                    placeholder="Wat houdt dit in..."
                    rows={2}
                    className="text-[13px]"
                  />
                ) : (
                  <p className="text-[13px] leading-[20px] text-hh-text">
                    {displayData.wat}
                  </p>
                )}
              </div>
            )}

            {/* Waarom */}
            {displayData.waarom && (
              <div className="bg-slate-50/70 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-hh-ink/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-hh-ink" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-hh-ink">Waarom</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={displayData.waarom}
                    onChange={(e) =>
                      setEditedData({ ...editedData, waarom: e.target.value })
                    }
                    placeholder="Waarom is dit belangrijk..."
                    rows={2}
                    className="text-[13px]"
                  />
                ) : (
                  <p className="text-[13px] leading-[20px] text-hh-text">
                    {displayData.waarom}
                  </p>
                )}
              </div>
            )}

            {/* Wanneer */}
            {displayData.wanneer && (
              <div className="bg-slate-50/70 rounded-xl p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-hh-ink/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-hh-ink" />
                  </div>
                  <h4 className="text-[14px] font-semibold text-hh-ink">Wanneer</h4>
                </div>
                {isEditing ? (
                  <Textarea
                    value={displayData.wanneer}
                    onChange={(e) =>
                      setEditedData({ ...editedData, wanneer: e.target.value })
                    }
                    placeholder="Wanneer pas je dit toe..."
                    rows={2}
                    className="text-[13px]"
                  />
                ) : (
                  <p className="text-[13px] leading-[20px] text-hh-text">
                    {displayData.wanneer}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Hoe Section - Full Width */}
          {displayData.hoe && (
            <div className="bg-white border border-hh-border/60 rounded-xl p-5">
              <h4 className="text-[14px] font-semibold text-hh-ink mb-3">Hoe</h4>
              {isEditing ? (
                <Textarea
                  value={displayData.hoe}
                  onChange={(e) =>
                    setEditedData({ ...editedData, hoe: e.target.value })
                  }
                  placeholder="Beschrijf hoe..."
                  rows={4}
                  className="text-[13px]"
                />
              ) : (
                <p className="text-[13px] leading-[20px] text-hh-text">
                  {displayData.hoe}
                </p>
              )}
            </div>
          )}

          {/* Stappenplan Section */}
          {displayData.stappenplan && displayData.stappenplan.length > 0 && (
            <div className="bg-white border border-hh-border/60 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-hh-ink/10 flex items-center justify-center">
                  <ListOrdered className="w-4 h-4 text-hh-ink" />
                </div>
                <h4 className="text-[14px] font-semibold text-hh-ink">Stappenplan</h4>
              </div>
              <ol className="space-y-3">
                {displayData.stappenplan.map((stap: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 text-[13px] leading-[20px] text-hh-text"
                  >
                    <span className="w-6 h-6 rounded-full bg-hh-ink text-white text-[11px] font-medium flex items-center justify-center shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    {isEditing ? (
                      <Input
                        value={stap}
                        onChange={(e) => {
                          const newStappen = [...displayData.stappenplan];
                          newStappen[index] = e.target.value;
                          setEditedData({
                            ...editedData,
                            stappenplan: newStappen,
                          });
                        }}
                        className="text-[13px] flex-1"
                      />
                    ) : (
                      <span className="pt-0.5">{stap}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Voorbeelden Section */}
          {displayData.voorbeeld && displayData.voorbeeld.length > 0 && (
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-[14px] font-semibold text-hh-ink">Voorbeelden</h4>
              </div>
              <ul className="space-y-3">
                {displayData.voorbeeld.map((voorbeeld: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[13px] leading-[20px] text-hh-text"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                    <span className="italic">"{voorbeeld}"</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-4 border-t border-hh-border/50 gap-3">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} className="px-5">
                Annuleren
              </Button>
              <Button
                className="bg-hh-ink hover:bg-hh-ink/90 px-5"
                onClick={handleSave}
              >
                Opslaan
              </Button>
            </>
          ) : (
            <>
              {isEditable && (
                <Button
                  className="bg-hh-ink hover:bg-hh-ink/90 px-5"
                  onClick={handleEdit}
                >
                  Bewerken
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-5"
              >
                Sluiten
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
