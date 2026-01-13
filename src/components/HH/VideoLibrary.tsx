import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { EPICSalesFlow } from "./EPICSalesFlow";
import hugoVideoPlaceholder from "figma:asset/110ec621be27a3e45bb05b418b6d4504c1aa0208.png";
import { Play, Pause, Volume2, Maximize, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { EPIC_TECHNIQUES, getTechniquesByPhase } from "../../data/epicTechniques";

interface VideoLibraryProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function VideoLibrary({ navigate, isAdmin }: VideoLibraryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTechnique, setCurrentTechnique] = useState("2.1.3");

  // E.P.I.C Sales Flow data using real EPIC techniques
  const scenarioFlowData = [
    {
      id: 0,
      name: "Voorbereiding",
      color: "#6B7A92",
      themas: [],
      uitleg: "Start hier om een sterke basis te leggen voor het gesprek.",
      steps: getTechniquesByPhase("1").map((tech, idx) => ({
        id: tech.detector_id,
        name: tech.naam,
        status: "completed" as const,
        duration: `${8 + idx * 2} min`,
        nummer: tech.nummer,
      })),
    },
    {
      id: 1,
      name: "Ontdekkingsfase",
      color: "#6B7A92",
      themas: ["Bron", "Motivatie", "Ervaring", "Verwachtingen", "Alternatieven", "Budget", "Timing", "Beslissingscriteria"],
      uitleg: "Hier breng je systematisch alle klantnoden in kaart.",
      steps: getTechniquesByPhase("2").map((tech, idx) => ({
        id: tech.detector_id,
        name: tech.naam,
        status: (idx === 0 || idx === 1 ? "completed" : idx === 2 ? "current" : "upcoming") as const,
        duration: `${7 + idx * 2} min`,
        nummer: tech.nummer,
      })),
    },
    {
      id: 2,
      name: "Aanbevelingsfase",
      color: "#6B7A92",
      themas: ["USP's"],
      uitleg: "Nu verbind je wat je geleerd hebt aan jouw oplossing.",
      steps: getTechniquesByPhase("3").map((tech, idx) => ({
        id: tech.detector_id,
        name: tech.naam,
        status: "upcoming" as const,
        duration: `${8 + idx * 2} min`,
        nummer: tech.nummer,
      })),
    },
    {
      id: 3,
      name: "Beslissingsfase",
      color: "#6B7A92",
      themas: ["beslissing"],
      uitleg: "Stuur richting een definitieve beslissing.",
      steps: getTechniquesByPhase("4").map((tech, idx) => ({
        id: tech.detector_id,
        name: tech.naam,
        status: "locked" as const,
        duration: `${9 + idx * 2} min`,
        nummer: tech.nummer,
      })),
    },
  ];

  // Get current technique data
  const currentTechniqueData = scenarioFlowData
    .flatMap(p => p.steps)
    .find(s => s.nummer === currentTechnique);

  const currentPhaseData = scenarioFlowData.find(p =>
    p.steps.some(s => s.nummer === currentTechnique)
  );

  return (
    <AppLayout currentPage="videos" navigate={navigate} isAdmin={isAdmin}>
      <div className="flex h-[calc(100vh-64px)] flex-col">
        {/* Page Header */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-4 border-b border-hh-border bg-hh-bg flex-shrink-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h1 className="text-[32px] leading-[40px] sm:text-[40px] sm:leading-[48px] lg:text-[48px] lg:leading-[56px] mb-2">
                Video Cursus
              </h1>
              <p className="text-[14px] leading-[22px] sm:text-[16px] sm:leading-[24px] text-hh-muted">
                Leer alle 25 technieken van Hugo — van voorbereiding tot afsluiting
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-shrink-0 gap-2"
            >
              <Play className="w-4 h-4" />
              {isPlaying ? "Pauzeer video" : "Start video"}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              {/* Video Player Area */}
              <Card className="rounded-[16px] shadow-hh-md border-hh-ink/20 overflow-hidden bg-hh-ink">
                <div
                  className="w-full relative overflow-hidden"
                  style={{ aspectRatio: "16/9" }}
                >
                  <ImageWithFallback
                    src={hugoVideoPlaceholder}
                    alt="Hugo Herbots Video"
                    className="w-full h-full object-cover"
                  />

                  {/* Play/Pause Overlay */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-gradient-to-t from-hh-ink/60 via-hh-ink/20 to-transparent flex items-center justify-center">
                      <button
                        onClick={() => setIsPlaying(true)}
                        className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white transition-all hover:scale-110 shadow-hh-lg"
                      >
                        <Play className="w-10 h-10 text-hh-ink ml-1" fill="currentColor" />
                      </button>
                    </div>
                  )}

                  {/* Video Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-hh-ink/90 to-transparent">
                    <p className="text-white text-[16px] leading-[24px]">
                      Klik hier om te beginnen
                    </p>
                    <p className="text-white/70 text-[14px] leading-[20px] mt-1">
                      {currentPhaseData?.name} • {currentTechniqueData?.duration}
                    </p>
                  </div>

                  {/* Video Controls (when playing) */}
                  {isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-hh-ink/90 to-transparent">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(false)}
                          className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                        >
                          <Pause className="w-5 h-5 text-white" />
                        </button>
                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full bg-white w-1/3" />
                        </div>
                        <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
                          <Volume2 className="w-4 h-4 text-white" />
                        </button>
                        <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
                          <Maximize className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Key Takeaways */}
              <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
                <h3 className="text-[18px] leading-[26px] text-hh-text mb-4">
                  Key Takeaways
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
                    <span className="text-hh-muted">
                      Begrijp de psychologie achter deze techniek
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
                    <span className="text-hh-muted">
                      Zie concrete voorbeelden uit echte salesgesprekken
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
                    <span className="text-hh-muted">
                      Leer wanneer je deze techniek wel en niet gebruikt
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Desktop Only - E.P.I.C Sales Flow */}
          <div className="hidden lg:block w-80 flex-shrink-0 overflow-hidden">
            <EPICSalesFlow
              phases={scenarioFlowData}
              currentPhaseId={2}
              currentStepId={currentTechnique}
              onStepClick={(stepId) => {
                // Find if step is unlocked
                const step = scenarioFlowData
                  .flatMap(p => p.steps)
                  .find(s => s.nummer === stepId);
                if (step && step.status !== "locked") {
                  setCurrentTechnique(stepId);
                  setIsPlaying(false);
                }
              }}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}