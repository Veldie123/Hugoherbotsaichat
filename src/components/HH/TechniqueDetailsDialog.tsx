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
import { Target, X, HelpCircle, Clock, User, Settings } from "lucide-react";

interface TechniqueDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technique: {
    id: string;
    number: string;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-[16px] font-bold shrink-0">
              {technique.number}
            </div>
            {isEditing ? (
              <Input
                value={displayData.naam}
                onChange={(e) =>
                  setEditedData({ ...editedData, naam: e.target.value })
                }
                className="text-[24px] font-semibold flex-1"
                placeholder="Techniek naam"
              />
            ) : (
              <span className="text-[24px] leading-[32px] font-semibold text-hh-ink">
                {displayData.naam}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Fase label */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-hh-muted">Fase:</span>
            <span className="text-[14px] font-medium text-hh-ink">{displayData.fase}</span>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[13px] text-hh-muted mb-2 block">
              Tags:
            </label>
            <div className="flex flex-wrap gap-2">
              {displayData.tags?.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-[12px] bg-hh-ui-50 border-hh-border"
                >
                  {tag}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-600"
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
          </div>

          {/* Doel Section */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="text-[16px] font-semibold text-hh-ink">Doel</h4>
            </div>
            {isEditing ? (
              <Textarea
                value={displayData.doel}
                onChange={(e) =>
                  setEditedData({ ...editedData, doel: e.target.value })
                }
                placeholder="Beschrijf het doel van deze techniek..."
                rows={3}
                className="text-[14px]"
              />
            ) : (
              <p className="text-[14px] leading-[22px] text-hh-text">
                {displayData.doel}
              </p>
            )}
          </div>

          {/* Wat Section */}
          {displayData.wat && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <h4 className="text-[16px] font-semibold text-hh-ink">Wat</h4>
              </div>
              {isEditing ? (
                <Textarea
                  value={displayData.wat}
                  onChange={(e) =>
                    setEditedData({ ...editedData, wat: e.target.value })
                  }
                  placeholder="Wat houdt deze techniek in..."
                  rows={2}
                  className="text-[14px]"
                />
              ) : (
                <p className="text-[14px] leading-[22px] text-hh-text">
                  {displayData.wat}
                </p>
              )}
            </div>
          )}

          {/* Waarom Section */}
          {displayData.waarom && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-amber-600" />
                <h4 className="text-[16px] font-semibold text-hh-ink">Waarom</h4>
              </div>
              {isEditing ? (
                <Textarea
                  value={displayData.waarom}
                  onChange={(e) =>
                    setEditedData({ ...editedData, waarom: e.target.value })
                  }
                  placeholder="Waarom is deze techniek belangrijk..."
                  rows={2}
                  className="text-[14px]"
                />
              ) : (
                <p className="text-[14px] leading-[22px] text-hh-text">
                  {displayData.waarom}
                </p>
              )}
            </div>
          )}

          {/* Wanneer Section */}
          {displayData.wanneer && (
            <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-cyan-600" />
                <h4 className="text-[16px] font-semibold text-hh-ink">Wanneer</h4>
              </div>
              {isEditing ? (
                <Textarea
                  value={displayData.wanneer}
                  onChange={(e) =>
                    setEditedData({ ...editedData, wanneer: e.target.value })
                  }
                  placeholder="Wanneer pas je deze techniek toe..."
                  rows={2}
                  className="text-[14px]"
                />
              ) : (
                <p className="text-[14px] leading-[22px] text-hh-text">
                  {displayData.wanneer}
                </p>
              )}
            </div>
          )}

          {/* Hoe Section */}
          <div>
            <h4 className="text-[16px] font-semibold text-hh-ink mb-3">Hoe</h4>
            {isEditing ? (
              <Textarea
                value={displayData.hoe}
                onChange={(e) =>
                  setEditedData({ ...editedData, hoe: e.target.value })
                }
                placeholder="Beschrijf hoe deze techniek toegepast wordt..."
                rows={4}
                className="text-[14px]"
              />
            ) : (
              <p className="text-[14px] leading-[22px] text-hh-text">
                {displayData.hoe}
              </p>
            )}
          </div>

          {/* Verkoper Intentie Section */}
          {displayData.verkoper_intentie && displayData.verkoper_intentie.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-indigo-600" />
                <h4 className="text-[16px] font-semibold text-hh-ink">Verkoper Intentie</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayData.verkoper_intentie.map((intentie: string, index: number) => (
                  <Badge
                    key={index}
                    className="text-[12px] bg-indigo-100 text-indigo-700 border-indigo-200"
                  >
                    {intentie}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Context Requirements Section */}
          {displayData.context_requirements && displayData.context_requirements.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-5 h-5 text-slate-600" />
                <h4 className="text-[16px] font-semibold text-hh-ink">Context Requirements</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayData.context_requirements.map((req: string, index: number) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-[12px] bg-slate-100 text-slate-700 border-slate-300"
                  >
                    {req}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stappenplan Section */}
          {displayData.stappenplan && displayData.stappenplan.length > 0 && (
            <div>
              <h4 className="text-[16px] font-semibold text-hh-ink mb-3">
                Stappenplan
              </h4>
              <ol className="space-y-2">
                {displayData.stappenplan.map((stap: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[14px] leading-[22px] text-hh-text"
                  >
                    <span className="text-purple-600 font-semibold shrink-0">
                      {index + 1}.
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
                        className="text-[14px]"
                      />
                    ) : (
                      <span>{stap}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Voorbeelden Section */}
          {displayData.voorbeeld && displayData.voorbeeld.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <h4 className="text-[16px] font-semibold text-hh-ink mb-3">
                Voorbeelden
              </h4>
              <ul className="space-y-2">
                {displayData.voorbeeld.map((voorbeeld: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-[14px] leading-[22px] text-hh-text"
                  >
                    <span className="text-green-600 shrink-0">•</span>
                    <span>{voorbeeld}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Annuleren
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSave}
              >
                Opslaan
              </Button>
            </>
          ) : (
            <>
              {isEditable && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={handleEdit}
                >
                  Bewerk Info
                </Button>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Sluiten
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
