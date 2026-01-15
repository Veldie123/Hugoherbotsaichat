import { useState, useEffect } from "react";
import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Sparkles, Info, Mic, MicOff, Clock, Lightbulb } from "lucide-react";

interface UploadAnalysisProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

interface LiveTip {
  id: number;
  text: string;
  technique: string;
  time: string;
}

interface TranscriptLine {
  speaker: string;
  text: string;
  time: string;
}

export function UploadAnalysis({ navigate, isAdmin }: UploadAnalysisProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"ready" | "active" | "processing">("ready");
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tips, setTips] = useState<LiveTip[]>([]);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    console.log("Uploading file:", file.name);
    navigate?.("analysis");
  };

  const handleBrowseClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mp3,.wav,.m4a,.mp4,.mov";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (liveStatus === "active") {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [liveStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartLiveCoaching = () => {
    setLiveStatus("active");
    setElapsedTime(0);
    setTips([
      {
        id: 1,
        text: "Probeer nu een open vraag te stellen om het probleem te verkennen",
        technique: "Techniek 2.1.2",
        time: "14:23",
      },
    ]);
    setTranscript([
      {
        speaker: "Jij",
        text: "Hoi, bedankt voor je tijd. Ik wilde even sparren over jullie CRM uitdagingen.",
        time: "14:23",
      },
    ]);
  };

  const handleStopCoaching = () => {
    setLiveStatus("processing");
    setTimeout(() => {
      setLiveStatus("ready");
      setElapsedTime(0);
      setTips([]);
      setTranscript([]);
    }, 1500);
  };

  return (
    <AppLayout currentPage="analysis" navigate={navigate} isAdmin={isAdmin}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold text-hh-ink mb-2">
            Gesprek Analyse
          </h1>
          <p className="text-[16px] leading-[24px] text-hh-muted">
            Upload een rollenspel of echt klantgesprek en krijg gedetailleerde EPIC analyse van Hugo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 rounded-[20px] shadow-hh-sm border-hh-border">
            <h2 className="text-[22px] font-bold text-hh-ink mb-1">Upload Rollenspel</h2>
            <p className="text-[14px] text-hh-muted mb-6">Audio/video • EPIC analyse</p>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                isDragging
                  ? "border-hh-primary bg-hh-primary/5"
                  : "border-hh-border hover:border-hh-muted"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-5 h-5 text-hh-muted" />
              </div>
              <p className="text-[14px] text-hh-text mb-1">
                Sleep een bestand hier of{" "}
                <button
                  onClick={handleBrowseClick}
                  className="text-hh-primary hover:underline font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-[12px] text-hh-muted">
                Audio: MP3, WAV, M4A • Video: MP4, MOV • Max 50MB
              </p>
            </div>
          </Card>

          <Card className="p-6 rounded-[20px] shadow-hh-sm border-hh-border">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-hh-primary" />
              <h2 className="text-[22px] font-bold text-hh-ink">Live Analyse</h2>
            </div>
            <p className="text-[14px] text-hh-muted mb-6">Real-time coaching tijdens gesprekken</p>

            <div className="mb-6">
              <p className="text-[13px] text-hh-muted mb-1">Status</p>
              <p className="text-[16px] font-semibold text-hh-ink">
                {liveStatus === "ready" && "Klaar om te starten"}
                {liveStatus === "active" && "Live aan het luisteren"}
                {liveStatus === "processing" && "Verwerken..."}
              </p>
              <p className="text-[13px] text-hh-muted mt-1">
                Hugo luistert mee en geeft real-time tips
              </p>
            </div>

            {liveStatus === "ready" && (
              <Button
                className="w-full gap-2 bg-[#5B7B9A] hover:bg-[#4A6A89] text-white h-12 text-[15px]"
                onClick={handleStartLiveCoaching}
              >
                <Mic className="w-4 h-4" />
                Start live coaching
              </Button>
            )}

            {liveStatus === "active" && (
              <div className="space-y-4">
                <Button
                  className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white h-12 text-[15px]"
                  onClick={handleStopCoaching}
                >
                  <MicOff className="w-4 h-4" />
                  Stop coaching
                </Button>

                <div className="flex items-center justify-center gap-4 text-[13px] text-hh-muted">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Listening...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(elapsedTime)}</span>
                  </div>
                </div>

                {tips.length > 0 && (
                  <div>
                    <h3 className="text-[15px] font-semibold text-hh-ink mb-2">Hugo's Tips</h3>
                    <div className="space-y-2">
                      {tips.map((tip) => (
                        <Card
                          key={tip.id}
                          className="p-3 rounded-xl border-l-4 border-l-amber-400 bg-amber-50/50"
                        >
                          <div className="flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-[13px] text-hh-text">
                                <span className="font-medium text-amber-700">Verdiep:</span>{" "}
                                {tip.text} ({tip.technique})
                              </p>
                              <p className="text-[11px] text-hh-muted mt-1">{tip.time}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {transcript.length > 0 && (
                  <div>
                    <h3 className="text-[15px] font-semibold text-hh-ink mb-2">Live Transcript</h3>
                    <div className="space-y-2 max-h-[150px] overflow-y-auto">
                      {transcript.map((line, index) => (
                        <div key={index} className="flex items-start gap-2 text-[13px]">
                          <span className="text-hh-muted shrink-0">{line.time}</span>
                          <span className="text-hh-primary font-medium">{line.speaker}:</span>
                          <span className="text-hh-text">{line.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {liveStatus === "processing" && (
              <div className="flex items-center justify-center gap-2 py-4">
                <div className="w-5 h-5 border-2 border-hh-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[14px] text-hh-muted">Sessie wordt verwerkt...</span>
              </div>
            )}
          </Card>
        </div>

        <Card className="p-4 rounded-[16px] bg-white border-hh-border shadow-hh-sm">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-[14px] font-medium text-hh-ink">
              Privacy & toestemming
            </p>
          </div>
          <p className="text-[13px] text-hh-muted leading-relaxed">
            Upload alleen gesprekken waarvoor je toestemming hebt van alle betrokkenen. Bij echte
            klantgesprekken: vraag expliciet toestemming voor opname en verwerking. Zie ons{" "}
            <button className="text-hh-ink font-semibold hover:underline">
              privacy beleid
            </button>
            .
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
