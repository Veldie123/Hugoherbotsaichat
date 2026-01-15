import { useState } from "react";
import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Upload, Sparkles, Info, Mic } from "lucide-react";

interface UploadAnalysisProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function UploadAnalysis({ navigate, isAdmin }: UploadAnalysisProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [liveStatus, setLiveStatus] = useState<"ready" | "active" | "processing">("ready");

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

  const handleStartLiveCoaching = () => {
    setLiveStatus("active");
    console.log("Starting live coaching session...");
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
                {liveStatus === "active" && "Live sessie actief"}
                {liveStatus === "processing" && "Verwerken..."}
              </p>
              <p className="text-[13px] text-hh-muted mt-1">
                Hugo luistert mee en geeft real-time tips
              </p>
            </div>

            <Button
              className="w-full gap-2 bg-hh-ink hover:bg-hh-ink/90 text-white h-12 text-[15px]"
              onClick={handleStartLiveCoaching}
            >
              <Mic className="w-4 h-4" />
              Start live coaching
            </Button>
          </Card>
        </div>

        <Card className="p-4 rounded-[16px] bg-amber-50/50 border-amber-200/50 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[14px] font-medium text-amber-900 mb-1">
              Privacy & toestemming
            </p>
            <p className="text-[13px] text-amber-800">
              Upload alleen gesprekken waarvoor je toestemming hebt van alle betrokkenen. Bij echte
              klantgesprekken: vraag expliciet toestemming voor opname en verwerking. Zie ons{" "}
              <button className="text-amber-900 underline hover:no-underline">
                privacy beleid
              </button>
              .
            </p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
