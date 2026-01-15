import { ChevronRight, ChevronDown, Info, MessageSquare } from "lucide-react";
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
}: EPICSidebarProps) {
  return (
    <div className="h-full bg-hh-ui-50/30 border-r border-hh-border overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header - Title + Badges */}
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

        {/* Epic Sales Flow Progress */}
        <div className="pb-4 border-b border-hh-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[14px] font-semibold text-hh-text">Epic Sales Flow</h3>
            <span className="text-[11px] text-hh-muted">4/12 onderwerpen • 33%</span>
          </div>
          <div className="flex gap-0.5">
            {[
              { label: "Voorber.", color: "bg-emerald-500", width: "100%" },
              { label: "Opening", color: "bg-emerald-500", width: "100%" },
              { label: "Ontdekking", color: "bg-blue-400", width: "60%" },
              { label: "Voorstel", color: "bg-slate-200", width: "0%" },
              { label: "Afsluiting", color: "bg-slate-200", width: "0%" },
            ].map((fase, index) => (
              <div key={index} className="flex-1 flex flex-col gap-1">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${fase.color}`}
                    style={{ width: fase.width }}
                  />
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-hh-muted leading-tight block">{index === 0 ? "-1" : index}</span>
                  <span className="text-[9px] text-hh-muted leading-tight block">{fase.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== FASES SECTION (COLLAPSIBLE) ========== */}
        <div className="space-y-2">
          {/* Fases Accordion Header */}
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

          {/* Phases Content */}
          {fasesAccordionOpen && (
            <div className="ml-4 space-y-2">
              {Object.entries(phaseNames).map(([phaseNum, phaseName]) => {
                const phase = parseInt(phaseNum);
                const isExpanded = expandedPhases.includes(phase);
                const techniques = techniquesByPhase[phase] || [];
                
                // Get actual sub-techniques (excluding phase headers)
                const subTechniques = getTopLevelTechniques(phase);
                
                // Don't show phase if it has no sub-techniques
                if (subTechniques.length === 0) return null;

                return (
                  <div key={phase} className="space-y-1">
                    {/* Phase Header */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        togglePhase(phase);
                        setCurrentPhase(phase);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                        "border-hh-border bg-white hover:bg-hh-ui-50"
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
                            "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                            phase === 0 ? "bg-slate-500 text-white" :
                            phase === 1 ? "bg-emerald-500 text-white" :
                            phase === 2 ? "bg-blue-500 text-white" :
                            phase === 3 ? "bg-amber-500 text-white" :
                            "bg-purple-500 text-white"
                          )}
                        >
                          {phase}
                        </div>
                        <span className="text-[13px] leading-[18px] font-medium text-hh-text">
                          {phaseName}
                        </span>
                      </div>
                      <Badge className={getFaseBadgeColor(phase)}>
                        0/{techniques.length}
                      </Badge>
                    </button>

                    {/* Techniques List */}
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {getTopLevelTechniques(phase).map((technique: any) => {
                          const isParent = hasChildren(technique, phase);
                          const isExpandedParent = expandedParents.includes(technique.nummer);
                          const isRecommended = recommendedTechnique === technique.nummer;

                          return (
                            <div key={technique.nummer}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (isParent) {
                                    toggleParentTechnique(technique.nummer);
                                  } else {
                                    setSelectedTechnique(technique.naam);
                                  }
                                }}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-[12px] leading-[16px] transition-all",
                                  selectedTechnique === technique.naam
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
                                    <span className="text-hh-muted font-mono text-[10px]">
                                      {technique.nummer}
                                    </span>
                                    <span className="flex-1">{technique.naam}</span>
                                  </div>
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
                                      <MessageSquare className={cn("w-3.5 h-3.5", isUserView ? "text-hh-ink hover:text-hh-ink" : "text-purple-600 hover:text-purple-700")} />
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
                                </div>
                              </button>

                              {/* Child Techniques */}
                              {isExpandedParent && (
                                <div className="ml-4 space-y-1">
                                  {getChildTechniques(technique.nummer, phase).map((child: any) => {
                                    const isChildRecommended = recommendedTechnique === child.nummer;
                                    
                                    return (
                                      <button
                                        key={child.nummer}
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setSelectedTechnique(child.naam);
                                        }}
                                        className={cn(
                                          "w-full text-left px-3 py-2 rounded-lg text-[12px] leading-[16px] transition-all",
                                          selectedTechnique === child.naam
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
                                            <span className="text-hh-muted font-mono text-[10px]">
                                              {child.nummer}
                                            </span>
                                            <span className="flex-1">{child.naam}</span>
                                          </div>
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
                                              <MessageSquare className={cn("w-3.5 h-3.5", isUserView ? "text-hh-ink hover:text-hh-ink" : "text-purple-600 hover:text-purple-700")} />
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
                                        </div>
                                      </button>
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

        {/* ========== HOUDINGEN SECTION (COLLAPSIBLE) ========== */}
        <div className="space-y-2 pt-2 border-t border-hh-border">
          {/* Houdingen Accordion Header */}
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

          {/* Klant Houdingen Content */}
          {houdingenAccordionOpen && (
            <div className="ml-4 space-y-2">
              {klantHoudingen.map((houding) => {
                const isExpanded = expandedHoudingen.includes(houding.id);
                const isActive = activeHouding === houding.id;

                return (
                  <div key={houding.id} className="space-y-1">
                    {/* Houding Header */}
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

                    {/* Aanbevolen Technieken */}
                    {isExpanded && (
                      <div className="ml-10 space-y-1">
                        {houding.recommended_technique_ids && houding.recommended_technique_ids.length > 0 ? (
                          <div className="space-y-1">
                            {houding.recommended_technique_ids.map((techniqueId: string) => {
                              // Find the technique in technieken_index
                              const technique = Object.values(technieken_index.technieken).find(
                                (t: any) => t.nummer === techniqueId
                              ) as any;

                              if (!technique) return null;

                              const isRecommended = recommendedTechnique === techniqueId;

                              return (
                                <button
                                  key={techniqueId}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedTechnique(technique.naam);
                                  }}
                                  className={cn(
                                    "w-full text-left px-3 py-2 rounded-lg text-[12px] leading-[16px] transition-all",
                                    selectedTechnique === technique.naam
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
                                      <span className="text-hh-muted font-mono text-[10px]">
                                        {technique.nummer}
                                      </span>
                                      <span className="flex-1">{technique.naam}</span>
                                    </div>
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
                                        <MessageSquare className={cn("w-3.5 h-3.5", isUserView ? "text-hh-ink hover:text-hh-ink" : "text-purple-600 hover:text-purple-700")} />
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