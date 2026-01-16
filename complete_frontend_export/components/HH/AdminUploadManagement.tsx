import {
  Search,
  Download,
  Flag,
  Clock,
  Calendar,
  Video,
  FileAudio,
  MessageSquare,
  Mic,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  Lightbulb,
  List,
  LayoutGrid,
  MoreVertical,
  Trash2,
  FileText,
  BarChart3,
  Sparkles,
  Eye,
  Upload as UploadIcon,
  XCircle,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { CustomCheckbox } from "../ui/custom-checkbox";
import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { TranscriptDialog, TranscriptSession } from "./TranscriptDialog";

interface AdminUploadManagementProps {
  navigate?: (page: string) => void;
}

interface ConversationMessage {
  timestamp: string;
  speaker: "ai" | "user";
  speakerName: string;
  message: string;
}

interface UploadItem {
  id: number;
  user: string;
  userEmail: string;
  userInitials: string;
  workspace: string;
  techniqueNumber: string;
  techniqueName: string;
  fase: string;
  type: "Audio" | "Video" | "Chat";
  duration: string;
  score: number;
  quality: "Excellent" | "Good" | "Needs Work";
  date: string;
  time: string;
  flagged: boolean;
  transcript?: ConversationMessage[];
  strengths?: string[];
  improvements?: string[];
}

export function AdminUploadManagement({ navigate }: AdminUploadManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuality, setFilterQuality] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [transcriptSession, setTranscriptSession] = useState<TranscriptSession | null>(null);
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const selectionMode = selectedIds.length > 0;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortField !== column) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  const openTranscript = (upload: UploadItem) => {
    const transcriptData: TranscriptSession = {
      id: upload.id,
      userName: upload.user,
      userWorkspace: upload.workspace,
      techniqueNumber: upload.techniqueNumber,
      techniqueName: upload.techniqueName,
      type: upload.type,
      date: upload.date,
      time: upload.time,
      duration: upload.duration,
      score: upload.score,
      quality: upload.quality,
      transcript: upload.transcript?.map(msg => ({
        speaker: msg.speakerName,
        time: msg.timestamp,
        text: msg.message,
      })) || [],
      strengths: upload.strengths,
      improvements: upload.improvements,
    };
    setTranscriptSession(transcriptData);
    setTranscriptDialogOpen(true);
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const uploads: UploadItem[] = [
    {
      id: 1,
      user: "Jan de Vries",
      userEmail: "jan@techcorp.nl",
      userInitials: "JdV",
      workspace: "TechCorp BV",
      techniqueNumber: "2.1",
      techniqueName: "SPIN Questioning",
      fase: "Ontdekkingsfase",
      type: "Audio",
      duration: "18:45",
      score: 88,
      quality: "Excellent",
      date: "2025-01-15",
      time: "14:23",
      flagged: false,
      transcript: [
        { timestamp: "00:00", speaker: "ai", speakerName: "AI Coach", message: "Goedemiddag! Vandaag gaan we oefenen met SPIN vragen. Ben je er klaar voor?" },
        { timestamp: "00:05", speaker: "user", speakerName: "Jan", message: "Ja, ik ben er klaar voor. Ik wil graag beter worden in het stellen van de juiste vragen." },
        { timestamp: "00:12", speaker: "ai", speakerName: "AI Coach", message: "Perfect! Stel je voor: je belt een prospect die interesse heeft getoond in jullie software. Begin maar met je opening." },
        { timestamp: "00:20", speaker: "user", speakerName: "Jan", message: "Goedemiddag, met Jan van TechCorp. Ik bel naar aanleiding van uw interesse in onze CRM oplossing. Klopt het dat jullie momenteel uitdagingen ervaren met het centraliseren van klantinformatie?" },
        { timestamp: "00:35", speaker: "ai", speakerName: "AI Coach", message: "Goede opening! Je gaat direct in op hun situatie. Ja, dat klopt. We hebben inderdaad moeite met het centraliseren van klantinformatie." },
        { timestamp: "00:45", speaker: "user", speakerName: "Jan", message: "Wat zijn de gevolgen hiervan voor jullie team? Merken jullie dat bepaalde processen hierdoor trager verlopen?" },
        { timestamp: "00:55", speaker: "ai", speakerName: "AI Coach", message: "Uitstekende Problem vraag! Ja, onze salesmedewerkers verliezen veel tijd met zoeken naar klantgeschiedenis. Soms bellen we zelfs dezelfde klant twee keer." },
      ],
      strengths: ["Goede opening", "Sterke SPIN vragen", "Actief luisteren"],
      improvements: ["Meer doorvragen na antwoord", "Pauzes inbouwen"],
    },
    {
      id: 2,
      user: "Sarah van Dijk",
      userEmail: "sarah@growco.nl",
      userInitials: "SvD",
      workspace: "GrowCo",
      techniqueNumber: "4.1",
      techniqueName: "Objection Handling",
      fase: "Beslissingsfase",
      type: "Video",
      duration: "24:12",
      score: 76,
      quality: "Good",
      date: "2025-01-15",
      time: "10:45",
      flagged: false,
      transcript: [
        { timestamp: "00:00", speaker: "ai", speakerName: "AI Coach", message: "Vandaag gaan we bezwaren oefenen. Ik zal een prospect spelen die twijfelt over de prijs." },
        { timestamp: "00:08", speaker: "user", speakerName: "Sarah", message: "Prima, ik ben benieuwd naar de scenario's." },
        { timestamp: "00:15", speaker: "ai", speakerName: "AI Coach", message: "Het klinkt goed, maar jullie oplossing is toch wel erg duur vergeleken met de concurrentie..." },
        { timestamp: "00:25", speaker: "user", speakerName: "Sarah", message: "Ik begrijp dat prijs belangrijk is. Mag ik vragen welke specifieke oplossing u vergelijkt?" },
      ],
      strengths: ["Goede vraag bij bezwaar", "Rustige benadering"],
      improvements: ["Sneller waarde benoemen", "Meer empathie tonen"],
    },
    {
      id: 3,
      user: "Mark Peters",
      userEmail: "mark@startup.io",
      userInitials: "MP",
      workspace: "ScaleUp BV",
      techniqueNumber: "1.2",
      techniqueName: "Gentleman's Agreement",
      fase: "Openingsfase",
      type: "Chat",
      duration: "12:30",
      score: 68,
      quality: "Needs Work",
      date: "2025-01-14",
      time: "16:20",
      flagged: true,
      transcript: [
        { timestamp: "00:00", speaker: "ai", speakerName: "AI Coach", message: "Laten we de Gentleman's Agreement oefenen voor het begin van een gesprek." },
        { timestamp: "00:10", speaker: "user", speakerName: "Mark", message: "Oké, waar moet ik op letten?" },
        { timestamp: "00:18", speaker: "ai", speakerName: "AI Coach", message: "Begin met een duidelijke agenda en vraag commitment van de klant." },
      ],
      strengths: ["Bereid om te leren"],
      improvements: ["Meer structuur in opening", "Agenda duidelijker maken", "Commitment vragen"],
    },
    {
      id: 4,
      user: "Lisa de Jong",
      userEmail: "lisa@salesforce.com",
      userInitials: "LdJ",
      workspace: "SalesForce NL",
      techniqueNumber: "2.2",
      techniqueName: "E.P.I.C Framework",
      fase: "Ontdekkingsfase",
      type: "Audio",
      duration: "21:18",
      score: 91,
      quality: "Excellent",
      date: "2025-01-14",
      time: "11:30",
      flagged: false,
      transcript: [
        { timestamp: "00:00", speaker: "ai", speakerName: "AI Coach", message: "Vandaag focussen we op het E.P.I.C framework. Klaar om te oefenen?" },
        { timestamp: "00:05", speaker: "user", speakerName: "Lisa", message: "Absoluut! Ik heb de theorie bestudeerd en wil het nu in praktijk brengen." },
        { timestamp: "00:12", speaker: "ai", speakerName: "AI Coach", message: "Perfect. Begin maar met de Explore fase." },
      ],
      strengths: ["Uitstekende voorbereiding", "Goede structuur", "Duidelijke communicatie"],
      improvements: ["Iets meer doorvragen"],
    },
    {
      id: 5,
      user: "Tom Bakker",
      userEmail: "tom@example.com",
      userInitials: "TB",
      workspace: "TechStart",
      techniqueNumber: "3.1",
      techniqueName: "Value Proposition",
      fase: "Aanbevelingsfase",
      type: "Video",
      duration: "15:42",
      score: 72,
      quality: "Good",
      date: "2025-01-13",
      time: "14:10",
      flagged: true,
      transcript: [
        { timestamp: "00:00", speaker: "ai", speakerName: "AI Coach", message: "We gaan werken aan je value proposition. Hoe presenteer je normaal de waarde van je product?" },
        { timestamp: "00:08", speaker: "user", speakerName: "Tom", message: "Ik begin meestal met de features en dan de voordelen." },
        { timestamp: "00:15", speaker: "ai", speakerName: "AI Coach", message: "Interessant. Laten we het eens omdraaien: begin met het probleem dat je oplost." },
      ],
      strengths: ["Open voor feedback", "Goede basis aanwezig"],
      improvements: ["Start met probleem, niet features", "Koppel waarde aan klantbehoefte"],
    },
  ];

  const stats = {
    totalAnalyses: 156,
    excellentQuality: 67,
    avgScore: 79,
    needsWork: 23,
  };

  const filteredUploads = uploads.filter((upload) => {
    if (searchQuery && 
        !upload.user.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !upload.techniqueName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !upload.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterQuality !== "all" && upload.quality !== filterQuality) {
      return false;
    }
    if (filterType !== "all" && upload.type !== filterType) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (!sortField) return 0;
    let comparison = 0;
    switch (sortField) {
      case "techniqueNumber":
        comparison = a.techniqueNumber.localeCompare(b.techniqueNumber);
        break;
      case "techniqueName":
        comparison = a.techniqueName.localeCompare(b.techniqueName);
        break;
      case "user":
        comparison = a.user.localeCompare(b.user);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "score":
        comparison = a.score - b.score;
        break;
      case "duration":
        const durationA = parseInt(a.duration.split(':')[0]) * 60 + parseInt(a.duration.split(':')[1]);
        const durationB = parseInt(b.duration.split(':')[0]) * 60 + parseInt(b.duration.split(':')[1]);
        comparison = durationA - durationB;
        break;
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUploads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUploads.map(item => item.id));
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case "Excellent":
        return (
          <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Excellent
          </Badge>
        );
      case "Good":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <ThumbsUp className="w-3 h-3 mr-1" />
            Good
          </Badge>
        );
      case "Needs Work":
        return (
          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Needs Work
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Audio":
        return <Mic className="w-4 h-4 text-purple-600" />;
      case "Video":
        return <Video className="w-4 h-4 text-purple-600" />;
      case "Chat":
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "Audio":
        return "AI Audio";
      case "Video":
        return "AI Video";
      case "Chat":
        return "AI Chat";
      default:
        return type;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-hh-success";
    if (score >= 70) return "text-blue-600";
    return "text-hh-warn";
  };

  return (
    <AdminLayout currentPage="admin-uploads" navigate={navigate}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Gespreksanalyse
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Beheer en analyseer alle geüploade sales gesprekken
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/10 flex items-center justify-center">
                <UploadIcon className="w-5 h-5 text-purple-600" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px] px-2">
                +24%
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              Totaal Analyses
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.totalAnalyses}
            </p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-hh-success" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px] px-2">
                43%
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              Excellent Quality
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.excellentQuality}
            </p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px] px-2">
                +5%
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              Gem. Score
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.avgScore}%
            </p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[11px] px-2">
                15%
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              Needs Improvement
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.needsWork}
            </p>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek op gebruiker, techniek, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Chat">Chat</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterQuality} onValueChange={setFilterQuality}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Kwaliteit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kwaliteit</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Needs Work">Needs Work</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hh-ui-50 border-b border-hh-border">
                <tr>
                  <th className="text-left py-3 px-4 w-12">
                    {selectionMode && (
                      <CustomCheckbox
                        checked={selectedIds.length === filteredUploads.length && filteredUploads.length > 0}
                        onChange={toggleSelectAll}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("techniqueNumber")}
                  >
                    <div className="flex items-center gap-2">
                      #
                      <SortIcon column="techniqueNumber" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("techniqueName")}
                  >
                    <div className="flex items-center gap-2">
                      Techniek
                      <SortIcon column="techniqueName" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("user")}
                  >
                    <div className="flex items-center gap-2">
                      Gebruiker
                      <SortIcon column="user" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      <SortIcon column="type" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("duration")}
                  >
                    <div className="flex items-center gap-2">
                      Duur
                      <SortIcon column="duration" />
                    </div>
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("score")}
                  >
                    <div className="flex items-center gap-2">
                      Score
                      <SortIcon column="score" />
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Kwaliteit
                  </th>
                  <th 
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Datum
                      <SortIcon column="date" />
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUploads.map((upload, index) => (
                  <tr
                    key={upload.id}
                    onMouseEnter={() => setHoveredRow(upload.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onClick={() => openTranscript(upload)}
                    className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50/50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                    }`}
                  >
                    <td className="px-4 py-3 w-12" onClick={(e) => e.stopPropagation()}>
                      {(selectionMode || hoveredRow === upload.id) ? (
                        <CustomCheckbox
                          checked={selectedIds.includes(upload.id)}
                          onChange={() => toggleSelectId(upload.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : <div className="w-4 h-4" />}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-purple-600/10 text-purple-600 border-purple-600/20 text-[11px] font-mono">
                        {upload.techniqueNumber}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-[14px] font-medium text-hh-text">
                          {upload.techniqueName}
                        </p>
                        <p className="text-[12px] text-hh-muted">
                          {upload.fase}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-purple-600/10 text-purple-600 text-[11px] font-semibold">
                            {upload.userInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-medium text-hh-text">
                              {upload.user}
                            </p>
                            {upload.flagged && (
                              <Flag className="w-3.5 h-3.5 text-red-600" />
                            )}
                          </div>
                          <p className="text-[12px] text-hh-muted">
                            {upload.user} • {upload.workspace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(upload.type)}
                        <span className="text-[13px] text-hh-text">{getTypeLabel(upload.type)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-hh-text">{upload.duration}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[14px] font-semibold ${getScoreColor(upload.score)}`}>
                        {upload.score}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getQualityBadge(upload.quality)}
                    </td>
                    <td className="px-4 py-3 text-[13px] leading-[18px] text-hh-muted">
                      {upload.date}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openTranscript(upload)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Bekijk Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={upload.flagged ? "text-hh-success" : "text-red-600"}
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            {upload.flagged ? "Unflag" : "Flag for Review"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-hh-error">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Verwijder
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUploads.length === 0 && (
            <div className="p-12 text-center">
              <UploadIcon className="w-12 h-12 text-hh-muted mx-auto mb-4" />
              <p className="text-[16px] text-hh-muted">
                Geen analyses gevonden met deze filters
              </p>
            </div>
          )}
        </Card>

        {/* Shared Transcript Dialog */}
        <TranscriptDialog
          open={transcriptDialogOpen}
          onOpenChange={setTranscriptDialogOpen}
          session={transcriptSession}
          isAdmin={true}
        />
      </div>
    </AdminLayout>
  );
}
