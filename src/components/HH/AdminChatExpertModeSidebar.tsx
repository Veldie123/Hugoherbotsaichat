import { ChevronRight, ChevronDown, Info, MessageSquare, Check, Lock } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "../ui/utils";
import technieken_index from "../../data/technieken_index";

interface EPICSidebarProps {
  fasesAccordionOpen: boolean;
  setFasesAccordionOpen: (open: boolean) => void;
  houdingenAccordionOpen: boolean;
  setHoudingenAccordionOpen: (open: boolean) => void;
  expandedPhases: number[];
  togglePhase: (phase: number) => void;
  setCurrentPhase: (phase: number) => void;
  expandedParents: string[];
  toggleParentTechnique: (id: string) => void;
  expandedHoudingen: string[];
  toggleHouding: (id: string) => void;
  selectedTechnique: string;
  setSelectedTechnique: (technique: string) => void;
  activeHouding: string | null;
  recommendedTechnique: string | null;
  openTechniqueDetails: (techniqueNumber: string) => void;
  startTechniqueChat: (techniqueNumber: string, techniqueName: string) => void;
  techniquesByPhase: Record<number, any[]>;
  phaseNames: Record<number, string>;
  getFaseBadgeColor: (phase: number) => string;
  getTopLevelTechniques: (phase: number) => any[];
  hasChildren: (technique: any, phase: number) => boolean;
  getChildTechniques: (parentNumber: string, phase: number) => any[];
  klantHoudingen: Array<{
    id: string;
    key: string;
    naam: string;
    beschrijving: string;
    technieken: string[];
    recommended_technique_ids?: string[];
  }>;
  difficultyLevel: "beginner" | "gemiddeld" | "expert";
  isUserView?: boolean;
  completedTechniques?: string[];
  currentUnlockedPhase?: number;
}

export function EPICSidebar({
  fasesAccordionOpen,
  setFasesAccordionOpen,
  houdingenAccordionOpen,
  setHoudingenAccordionOpen,
  expandedPhases,
  togglePhase,
  setCurrentPhase,
  expandedParents,
  toggleParentTechnique,
  expandedHoudingen,
  toggleHouding,
  selectedTechnique,
  setSelectedTechnique,
  activeHouding,
  recommendedTechnique,
  openTechniqueDetails,
  startTechniqueChat,
  techniquesByPhase,
  phaseNames,
  getFaseBadgeColor,
  getTopLevelTechniques,
  hasChildren,
  getChildTechniques,
  klantHoudingen,
  difficultyLevel,
  isUserView = false,
  completedTechniques = ["0.1", "0.2", "0.3", "0.4", "0.5", "1.1", "1.2"],
  currentUnlockedPhase = 2,
}: EPICSidebarProps) {
  
  const isTechniqueLocked = (techniqueNumber: string) => {
    if (!isUserView) return false;
    const phase = parseInt(techniqueNumber.split('.')[0]);
    return phase > currentUnlockedPhase;
  };

  const isTechniqueCompleted = (techniqueNumber: string) => {
    return completedTechniques.includes(techniqueNumber);
  };

  const getPhaseProgress = (phase: number) => {
    const techniques = techniquesByPhase[phase] || [];
    const nonFaseTechniques = techniques.filter((t: any) => !t.is_fase);
    const completed = nonFaseTechniques.filter((t: any) => completedTechniques.includes(t.nummer)).length;
    return { completed, total: nonFaseTechniques.length };
  };

  const hasGrandchildren = (technique: any) => {
    const children = Object.values(technieken_index.technieken).filter(
      (t: any) => t.parent === technique.nummer
    );
    return children.some((child: any) => 
      Object.values(technieken_index.technieken).some((t: any) => t.parent === child.nummer)
    );
  };

  const getGrandchildTechniques = (parentNumber: string) => {
    return Object.values(technieken_index.technieken).filter(
      (t: any) => t.parent === parentNumber
    ).sort((a: any, b: any) => {
      const aNum = a.nummer.split('.').map((n: string) => parseInt(n) || 0);
      const bNum = b.nummer.split('.').map((n: string) => parseInt(n) || 0);
      for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
        if ((aNum[i] || 0) !== (bNum[i] || 0)) {
          return (aNum[i] || 0) - (bNum[i] || 0);
        }
      }
      return 0;
    });
  };

  const totalCompleted = completedTechniques.length;
  const totalTechniques = Object.values(technieken_index.technieken).filter((t: any) => !t.is_fase).length;
  const progressPercent = Math.round((totalCompleted / totalTechniques) * 100);

  return (
    <div className="h-full bg-hh-ui-50/30 border-r border-hh-border overflow-y-auto">
      <div className="p-4 space-y-4">
        {!isUserView && (
          <div className="pb-3 border-b border-hh-border">
            <h3 className="text-[18px] leading-[24px] font-semibold text-hh-text mb-1">
              Chat Expert Mode
            </h3>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-3">
              Training AI Model
            </p>
          </div>
        )}

        <div className="pb-4 border-b border-hh-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-bold text-hh-text">Epic Sales Flow</h3>
            <span className="text-[13px] text-hh-muted">{totalCompleted}/{totalTechniques} onderwerpen • {progressPercent}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            {[
              { phase: 0, label: "Voorber." },
              { phase: 1, label: "Opening" },
              { phase: 2, label: "Ontdekking" },
              { phase: 3, label: "Voorstel" },
              { phase: 4, label: "Afsluiting" },
            ].map((item, index) => {
              const progress = getPhaseProgress(item.phase);
              const isCompleted = progress.completed === progress.total && progress.total > 0;
              const hasProgress = progress.completed > 0;
              const isCurrent = item.phase === currentUnlockedPhase;
              const isLocked = isUserView && item.phase > currentUnlockedPhase;
              
              // Bar background and fill colors
              let barBgColor = "bg-slate-200";
              let barFillColor = "bg-slate-300";
              let barWidth = "0%";
              
              if (isCompleted || (item.phase < currentUnlockedPhase && !isLocked)) {
                barBgColor = "bg-[#4F7396]/20";
                barFillColor = "bg-[#4F7396]";
                barWidth = "100%";
              } else if (isCurrent) {
                barBgColor = "bg-[#10B981]/20";
                barFillColor = "bg-[#10B981]";
                barWidth = progress.total > 0 ? `${(progress.completed / progress.total) * 100}%` : "0%";
              } else if (hasProgress && !isLocked) {
                barBgColor = "bg-slate-200";
                barFillColor = "bg-[#4F7396]";
                barWidth = progress.total > 0 ? `${(progress.completed / progress.total) * 100}%` : "0%";
              } else if (isLocked) {
                barBgColor = "bg-slate-100";
                barFillColor = "bg-slate-200";
                barWidth = "0%";
              }
              
              // Text colors - completed phases in steel blue, current phase in green
              let numberColor = "text-slate-400";
              let labelColor = "text-slate-400";
              if (isCompleted || (item.phase < currentUnlockedPhase && !isLocked)) {
                numberColor = "text-[#4F7396]";
                labelColor = "text-slate-600";
              } else if (isCurrent) {
                numberColor = "text-[#10B981]";
                labelColor = "text-slate-600";
              } else if (!isLocked) {
                numberColor = "text-slate-500";
                labelColor = "text-slate-500";
              }
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className={`w-full h-2 rounded-full overflow-hidden ${barBgColor}`}>
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${barFillColor}`}
                      style={{ width: barWidth }}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={cn("text-[12px] leading-[16px] font-semibold", numberColor)}>
                      {item.phase === 0 ? "-1" : item.phase}
                    </span>
                    <span className={cn("text-[11px] leading-[14px] text-center", labelColor)}>{item.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setFasesAccordionOpen(!fasesAccordionOpen);
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-hh-border bg-white hover:bg-hh-ui-50 transition-all"
          >
            <div className="flex items-center gap-2">
              {fasesAccordionOpen ? (
                <ChevronDown className="w-4 h-4 text-hh-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-hh-muted" />
              )}
              <h4 className="text-[14px] leading-[20px] font-semibold text-hh-text">
                Fases & bijhorende technieken
              </h4>
            </div>
            <Badge className={isUserView ? "bg-hh-ink/10 text-hh-ink border-hh-ink/20" : "bg-purple-100 text-purple-700 border-purple-300"}>
              5 fases
            </Badge>
          </button>

          {fasesAccordionOpen && (
            <div className="ml-4 space-y-2">
              {Object.entries(phaseNames).map(([phaseNum, phaseName]) => {
                const phase = parseInt(phaseNum);
                const isExpanded = expandedPhases.includes(phase);
                const techniques = techniquesByPhase[phase] || [];
                const subTechniques = getTopLevelTechniques(phase);
                const phaseProgress = getPhaseProgress(phase);
                const isPhaseLocked = isUserView && phase > currentUnlockedPhase;
                const isPhaseCompleted = phaseProgress.completed === phaseProgress.total && phaseProgress.total > 0;
                
                if (subTechniques.length === 0) return null;

                return (
                  <div key={phase} className="space-y-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (!isPhaseLocked) {
                          togglePhase(phase);
                          setCurrentPhase(phase);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                        isPhaseLocked 
                          ? "border-hh-border bg-hh-ui-50 opacity-60 cursor-not-allowed"
                          : "border-hh-border bg-white hover:bg-hh-ui-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isPhaseLocked ? (
                          <Lock className="w-4 h-4 text-hh-muted" />
                        ) : isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-hh-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-hh-muted" />
                        )}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                            isPhaseLocked ? "bg-hh-ui-200 text-hh-muted" :
                            isPhaseCompleted ? "bg-emerald-500 text-white" :
                            phase === 0 ? "bg-slate-500 text-white" :
                            phase === 1 ? "bg-emerald-500 text-white" :
                            phase === 2 ? "bg-blue-500 text-white" :
                            phase === 3 ? "bg-amber-500 text-white" :
                            "bg-purple-500 text-white"
                          )}
                        >
                          {isPhaseCompleted ? <Check className="w-3 h-3" /> : phase}
                        </div>
                        <span className={cn(
                          "text-[13px] leading-[18px] font-medium",
                          isPhaseLocked ? "text-hh-muted" : "text-hh-text"
                        )}>
                          {phaseName}
                        </span>
                      </div>
                      <Badge className={cn(
                        isPhaseLocked ? "bg-hh-ui-100 text-hh-muted border-hh-ui-200" :
                        isPhaseCompleted ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                        getFaseBadgeColor(phase)
                      )}>
                        {phaseProgress.completed}/{phaseProgress.total}
                      </Badge>
                    </button>

                    {isExpanded && !isPhaseLocked && (
                      <div className="ml-4 space-y-1">
                        {getTopLevelTechniques(phase).map((technique: any) => {
                          const isParent = hasChildren(technique, phase);
                          const isExpandedParent = expandedParents.includes(technique.nummer);
                          const isRecommended = recommendedTechnique === technique.nummer;
                          const isLocked = isTechniqueLocked(technique.nummer);
                          const isCompleted = isTechniqueCompleted(technique.nummer);

                          return (
                            <div key={technique.nummer}>
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (isLocked) return;
                                  if (isParent) {
                                    toggleParentTechnique(technique.nummer);
                                  } else {
                                    setSelectedTechnique(technique.naam);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    if (!isLocked) {
                                      if (isParent) {
                                        toggleParentTechnique(technique.nummer);
                                      } else {
                                        setSelectedTechnique(technique.naam);
                                      }
                                    }
                                  }
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-[12px] leading-[16px] transition-all cursor-pointer",
                                  isLocked 
                                    ? "bg-hh-ui-50 text-hh-muted cursor-not-allowed opacity-60"
                                    : selectedTechnique === technique.naam
                                    ? isUserView 
                                      ? "bg-hh-ink/5 text-hh-ink border border-hh-ink/20"
                                      : "bg-purple-50 text-purple-800 border border-purple-300"
                                    : isRecommended
                                    ? isUserView
                                      ? "bg-hh-ink/5 border border-hh-ink/10"
                                      : "bg-purple-50/30 border border-purple-200"
                                    : "bg-white text-hh-text hover:bg-hh-ui-50"
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1">
                                    {isUserView && (
                                      <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                        {isCompleted ? (
                                          <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                          </div>
                                        ) : isLocked ? (
                                          <div className="w-5 h-5 rounded-full bg-hh-ui-100 border border-hh-border flex items-center justify-center">
                                            <Lock className="w-2.5 h-2.5 text-hh-muted" />
                                          </div>
                                        ) : null}
                                      </div>
                                    )}
                                    <span className={cn(
                                      "font-mono text-[10px]",
                                      isLocked ? "text-hh-muted/50" : "text-hh-muted"
                                    )}>
                                      {technique.nummer}
                                    </span>
                                    <span className={cn("flex-1", isLocked && "text-hh-muted/70")}>{technique.naam}</span>
                                    {isParent && (
                                      isExpandedParent ? 
                                        <ChevronDown className="w-3 h-3 text-hh-muted" /> : 
                                        <ChevronRight className="w-3 h-3 text-hh-muted" />
                                    )}
                                  </div>
                                  {!isLocked && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          e.preventDefault();
                                          startTechniqueChat(technique.nummer, technique.naam);
                                        }}
                                        className={cn("p-1 rounded transition-colors flex-shrink-0", isUserView ? "hover:bg-hh-ink/10" : "hover:bg-purple-100")}
                                        title="Start chat over deze techniek"
                                      >
                                        <MessageSquare className={cn("w-3.5 h-3.5", isUserView ? "text-hh-ink" : "text-purple-600")} />
                                      </button>
                                      {difficultyLevel !== "gemiddeld" && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            openTechniqueDetails(technique.nummer);
                                          }}
                                          className="p-1 hover:bg-hh-ui-100 rounded transition-colors flex-shrink-0"
                                          title="Bekijk techniek details"
                                        >
                                          <Info className="w-3.5 h-3.5 text-hh-muted hover:text-hh-primary" />
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {isExpandedParent && !isLocked && (
                                <div className="ml-4 space-y-1 mt-1">
                                  {getChildTechniques(technique.nummer, phase).map((child: any) => {
                                    const isChildRecommended = recommendedTechnique === child.nummer;
                                    const isChildLocked = isTechniqueLocked(child.nummer);
                                    const isChildCompleted = isTechniqueCompleted(child.nummer);
                                    const childHasGrandchildren = getGrandchildTechniques(child.nummer).length > 0;
                                    const isChildExpanded = expandedParents.includes(child.nummer);
                                    
                                    return (
                                      <div key={child.nummer}>
                                        <div
                                          role="button"
                                          tabIndex={0}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            if (isChildLocked) return;
                                            if (childHasGrandchildren) {
                                              toggleParentTechnique(child.nummer);
                                            } else {
                                              setSelectedTechnique(child.naam);
                                            }
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                              e.preventDefault();
                                              if (!isChildLocked) {
                                                if (childHasGrandchildren) {
                                                  toggleParentTechnique(child.nummer);
                                                } else {
                                                  setSelectedTechnique(child.naam);
                                                }
                                              }
                                            }
                                          }}
                                          className={cn(
                                            "w-full text-left px-3 py-2 rounded-lg text-[12px] leading-[16px] transition-all cursor-pointer",
                                            isChildLocked 
                                              ? "bg-hh-ui-50 text-hh-muted cursor-not-allowed opacity-60"
                                              : selectedTechnique === child.naam
                                              ? isUserView
                                                ? "bg-hh-ink/5 text-hh-ink border border-hh-ink/20"
                                                : "bg-purple-50 text-purple-800 border border-purple-300"
                                              : isChildRecommended
                                              ? isUserView
                                                ? "bg-hh-ink/5 border border-hh-ink/10"
                                                : "bg-purple-50/30 border border-purple-200"
                                              : "bg-white text-hh-text hover:bg-hh-ui-50"
                                          )}
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1">
                                              {isUserView && (
                                                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                                                  {isChildCompleted ? (
                                                    <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                                                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                                    </div>
                                                  ) : isChildLocked ? (
                                                    <div className="w-5 h-5 rounded-full bg-hh-ui-100 border border-hh-border flex items-center justify-center">
                                                      <Lock className="w-2.5 h-2.5 text-hh-muted" />
                                                    </div>
                                                  ) : null}
                                                </div>
                                              )}
                                              <span className={cn(
                                                "font-mono text-[10px]",
                                                isChildLocked ? "text-hh-muted/50" : "text-hh-muted"
                                              )}>
                                                {child.nummer}
                                              </span>
                                              <span className={cn("flex-1", isChildLocked && "text-hh-muted/70")}>{child.naam}</span>
                                              {childHasGrandchildren && (
                                                isChildExpanded ? 
                                                  <ChevronDown className="w-3 h-3 text-hh-muted" /> : 
                                                  <ChevronRight className="w-3 h-3 text-hh-muted" />
                                              )}
                                            </div>
                                            {!isChildLocked && (
                                              <div className="flex items-center gap-1">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    startTechniqueChat(child.nummer, child.naam);
                                                  }}
                                                  className={cn("p-1 rounded transition-colors flex-shrink-0", isUserView ? "hover:bg-hh-ink/10" : "hover:bg-purple-100")}
                                                  title="Start chat over deze techniek"
                                                >
                                                  <MessageSquare className={cn("w-3.5 h-3.5", isUserView ? "text-hh-ink" : "text-purple-600")} />
                                                </button>
                                                {difficultyLevel !== "gemiddeld" && (
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      e.preventDefault();
                                                      openTechniqueDetails(child.nummer);
                                                    }}
                                                    className="p-1 hover:bg-hh-ui-100 rounded transition-colors flex-shrink-0"
                                                    title="Bekijk techniek details"
                                                  >
                                                    <Info className="w-3.5 h-3.5 text-hh-muted hover:text-hh-primary" />
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {isChildExpanded && childHasGrandchildren && !isChildLocked && (
                                          <div className="ml-4 space-y-1 mt-1">
                                            {getGrandchildTechniques(child.nummer).map((grandchild: any) => {
                                              const isGrandchildLocked = isTechniqueLocked(grandchild.nummer);
                                              const isGrandchildCompleted = isTechniqueCompleted(grandchild.nummer);
                                              const isGrandchildRecommended = recommendedTechnique === grandchild.nummer;
                                              
                                              return (
                                                <div
                                                  key={grandchild.nummer}
                                                  role="button"
                                                  tabIndex={0}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    if (isGrandchildLocked) return;
                                                    setSelectedTechnique(grandchild.naam);
                                                  }}
                                                  onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                      e.preventDefault();
                                                      if (!isGrandchildLocked) {
                                                        setSelectedTechnique(grandchild.naam);
                                                      }
                                                    }
                                                  }}
                                                  className={cn(
                                                    "w-full text-left px-3 py-1.5 rounded-lg text-[11px] leading-[15px] transition-all cursor-pointer",
                                                    isGrandchildLocked 
                                                      ? "bg-hh-ui-50 text-hh-muted cursor-not-allowed opacity-60"
                                                      : selectedTechnique === grandchild.naam
                                                      ? isUserView
                                                        ? "bg-hh-ink/5 text-hh-ink border border-hh-ink/20"
                                                        : "bg-purple-50 text-purple-800 border border-purple-300"
                                                      : isGrandchildRecommended
                                                      ? isUserView
                                                        ? "bg-hh-ink/5 border border-hh-ink/10"
                                                        : "bg-purple-50/30 border border-purple-200"
                                                      : "bg-hh-ui-50/50 text-hh-text hover:bg-hh-ui-100"
                                                  )}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    {isUserView && (
                                                      <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                                        {isGrandchildCompleted ? (
                                                          <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                                          </div>
                                                        ) : isGrandchildLocked ? (
                                                          <div className="w-4 h-4 rounded-full bg-hh-ui-100 border border-hh-border flex items-center justify-center">
                                                            <Lock className="w-2 h-2 text-hh-muted" />
                                                          </div>
                                                        ) : null}
                                                      </div>
                                                    )}
                                                    <span className={cn(
                                                      "font-mono text-[9px]",
                                                      isGrandchildLocked ? "text-hh-muted/50" : "text-hh-muted"
                                                    )}>
                                                      {grandchild.nummer}
                                                    </span>
                                                    <span className={cn("flex-1", isGrandchildLocked && "text-hh-muted/70")}>{grandchild.naam}</span>
                                                    {!isGrandchildLocked && (
                                                      <div className="flex items-center gap-0.5">
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            startTechniqueChat(grandchild.nummer, grandchild.naam);
                                                          }}
                                                          className={cn("p-0.5 rounded transition-colors", isUserView ? "hover:bg-hh-ink/10" : "hover:bg-purple-100")}
                                                          title="Start chat"
                                                        >
                                                          <MessageSquare className={cn("w-3 h-3", isUserView ? "text-hh-ink" : "text-purple-600")} />
                                                        </button>
                                                        <button
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            openTechniqueDetails(grandchild.nummer);
                                                          }}
                                                          className="p-0.5 hover:bg-hh-ui-100 rounded transition-colors"
                                                          title="Info"
                                                        >
                                                          <Info className="w-3 h-3 text-hh-muted hover:text-hh-primary" />
                                                        </button>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-hh-border">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setHoudingenAccordionOpen(!houdingenAccordionOpen);
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg border border-hh-border bg-white hover:bg-hh-ui-50 transition-all"
          >
            <div className="flex items-center gap-2">
              {houdingenAccordionOpen ? (
                <ChevronDown className="w-4 h-4 text-hh-muted" />
              ) : (
                <ChevronRight className="w-4 h-4 text-hh-muted" />
              )}
              <h4 className="text-[14px] leading-[20px] font-semibold text-hh-text">
                Houdingen van de klant & bijhorende technieken
              </h4>
            </div>
            <Badge className={isUserView ? "bg-hh-ink/10 text-hh-ink border-hh-ink/20" : "bg-purple-100 text-purple-700 border-purple-300"}>
              {klantHoudingen.length}
            </Badge>
          </button>

          {houdingenAccordionOpen && (
            <div className="ml-4 space-y-2">
              {klantHoudingen.map((houding) => {
                const isExpanded = expandedHoudingen.includes(houding.id);
                const isActive = activeHouding === houding.id;

                return (
                  <div key={houding.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleHouding(houding.id);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                        isActive
                          ? "border-orange-400 bg-orange-50 shadow-sm"
                          : "border-hh-border bg-white hover:bg-hh-ui-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-hh-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-hh-muted" />
                        )}
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold",
                            isActive
                              ? "bg-orange-500 text-white border-2 border-orange-600"
                              : "bg-orange-100 text-orange-700 border border-orange-300"
                          )}
                        >
                          {houding.id}
                        </div>
                        <span className={cn(
                          "text-[13px] leading-[18px] font-medium",
                          isActive ? "text-orange-900 font-semibold" : "text-hh-text"
                        )}>
                          {houding.naam}
                        </span>
                      </div>
                      <Badge className={isActive ? "bg-orange-500 text-white border-orange-600" : "bg-orange-100 text-orange-700 border-orange-300"}>
                        {houding.recommended_technique_ids?.length || 0}
                      </Badge>
                    </button>

                    {isExpanded && (
                      <div className="ml-10 space-y-1">
                        {houding.recommended_technique_ids && houding.recommended_technique_ids.length > 0 ? (
                          <div className="space-y-1">
                            {houding.recommended_technique_ids.map((techniqueId: string) => {
                              const technique = Object.values(technieken_index.technieken).find(
                                (t: any) => t.nummer === techniqueId
                              ) as any;

                              if (!technique) return null;

                              const isRecommended = recommendedTechnique === techniqueId;
                              const isLocked = isTechniqueLocked(techniqueId);
                              const isCompleted = isTechniqueCompleted(techniqueId);

                              return (
                                <button
                                  key={techniqueId}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (!isLocked) setSelectedTechnique(technique.naam);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-[12px] leading-[16px] transition-all",
                                    isLocked 
                                      ? "bg-hh-ui-50 text-hh-muted cursor-not-allowed opacity-60"
                                      : selectedTechnique === technique.naam
                                      ? isUserView
                                        ? "bg-hh-ink/5 text-hh-ink border border-hh-ink/20"
                                        : "bg-purple-50 text-purple-800 border border-purple-300"
                                      : isRecommended
                                      ? isUserView
                                        ? "bg-hh-ink/5 border border-hh-ink/10"
                                        : "bg-purple-50/30 border border-purple-200"
                                      : "bg-white text-hh-text hover:bg-hh-ui-50"
                                  )}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1">
                                      {isUserView && (
                                        <div className={cn(
                                          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0",
                                          isCompleted ? "bg-emerald-500" : isLocked ? "bg-hh-ui-200" : "bg-hh-ui-100 border border-hh-border"
                                        )}>
                                          {isCompleted && <Check className="w-2.5 h-2.5 text-white" />}
                                          {isLocked && <Lock className="w-2 h-2 text-hh-muted" />}
                                        </div>
                                      )}
                                      <span className="text-hh-muted font-mono text-[10px]">
                                        {technique.nummer}
                                      </span>
                                      <span className="flex-1">{technique.naam}</span>
                                    </div>
                                    {!isLocked && (
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            startTechniqueChat(technique.nummer, technique.naam);
                                          }}
                                          className={cn("p-1 rounded transition-colors flex-shrink-0", isUserView ? "hover:bg-hh-ink/10" : "hover:bg-purple-100")}
                                          title="Start chat over deze techniek"
                                        >
                                          <MessageSquare className={cn("w-3.5 h-3.5", isUserView ? "text-hh-ink" : "text-purple-600")} />
                                        </button>
                                        {difficultyLevel !== "gemiddeld" && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              e.preventDefault();
                                              openTechniqueDetails(technique.nummer);
                                            }}
                                            className="p-1 hover:bg-hh-ui-100 rounded transition-colors flex-shrink-0"
                                            title="Bekijk techniek details"
                                          >
                                            <Info className="w-3.5 h-3.5 text-hh-muted hover:text-hh-primary" />
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })} 
                          </div>
                        ) : (
                          <p className="text-[11px] leading-[14px] text-hh-muted italic px-2">
                            Geen aanbevolen technieken beschikbaar
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
