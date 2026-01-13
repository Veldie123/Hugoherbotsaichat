import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Target, X } from "lucide-react";

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
    stappenplan?: string[];
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

  // Initialize edited data when technique changes or when starting to edit
  useEffect(() => {
    if (technique && isEditing && !editedData) {
      setEditedData({
        naam: technique.naam,
        fase: technique.fase,
        tags: technique.tags || [],
        doel: technique.doel || "",
        hoe: technique.hoe || "",
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
        <DialogHeader>
          <DialogTitle className="text-[24px] leading-[32px] text-hh-ink">
            Techniek Details
          </DialogTitle>
          <DialogDescription className="text-[14px] text-hh-muted">
            Alle informatie over deze techniek
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Techniek Nummer Badge + Naam */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-[16px] font-bold shrink-0">
              {technique.number}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={displayData.naam}
                  onChange={(e) =>
                    setEditedData({ ...editedData, naam: e.target.value })
                  }
                  className="text-[20px] font-semibold"
                  placeholder="Techniek naam"
                />
              ) : (
                <h3 className="text-[20px] leading-[28px] font-semibold text-hh-ink">
                  {displayData.naam}
                </h3>
              )}
            </div>
          </div>

          {/* Fase */}
          <div>
            <label className="text-[13px] text-hh-muted mb-2 block">
              Fase:
            </label>
            {isEditing ? (
              <Input
                value={displayData.fase}
                onChange={(e) =>
                  setEditedData({ ...editedData, fase: e.target.value })
                }
                placeholder="Fase nummer"
              />
            ) : (
              <span className="text-[16px] text-hh-text font-medium">
                {displayData.fase}
              </span>
            )}
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