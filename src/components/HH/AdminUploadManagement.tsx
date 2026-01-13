import {
  Search,
  Filter,
  Download,
  Eye,
  Upload as UploadIcon,
  Flag,
  Clock,
  User,
  Calendar,
  Video,
  FileAudio,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  MoreVertical,
  Trash2,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  List,
  LayoutGrid,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

interface AdminUploadManagementProps {
  navigate?: (page: string) => void;
}

export function AdminUploadManagement({ navigate }: AdminUploadManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedUpload, setSelectedUpload] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const selectionMode = selectedIds.length > 0;

  const toggleSelectId = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUploads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUploads.map(item => item.id));
    }
  };

  const uploads = [
    {
      id: 1,
      user: "Jan de Vries",
      userInitials: "JdV",
      workspace: "TechCorp BV",
      title: "Discovery call - Acme Inc",
      type: "Audio",
      duration: "32:15",
      uploadDate: "2025-01-15 14:23",
      status: "Voltooid",
      fileSize: "45,2 MB",
      overallScore: 82,
      scoreDelta: "up",
      phase: "Ontdekkingsfase",
      techniqueScores: [
        { technique: "2.1.1", name: "Feitgerichte vragen", score: 85, count: 12 },
        { technique: "2.1.2", name: "Meningsgerichte vragen", score: 88, count: 8 },
        { technique: "2.1.6", name: "Actief luisteren", score: 79, count: 15 },
      ],
      flagged: false,
    },
    {
      id: 2,
      user: "Sarah van Dijk",
      userInitials: "SvD",
      workspace: "GrowCo",
      title: "Closing call - Beta Corp",
      type: "Video",
      duration: "48:30",
      uploadDate: "2025-01-15 10:12",
      status: "Voltooid",
      fileSize: "234,8 MB",
      overallScore: 76,
      scoreDelta: "neutral",
      phase: "Beslissingsfase",
      techniqueScores: [
        { technique: "4.1", name: "Proefafsluiting", score: 82, count: 6 },
        { technique: "4.2.4", name: "Bezwaren", score: 74, count: 8 },
        { technique: "3.3", name: "Voordeel", score: 71, count: 10 },
      ],
      flagged: false,
    },
    {
      id: 3,
      user: "Mark Peters",
      userInitials: "MP",
      workspace: "ScaleUp BV",
      title: "Follow-up call - Gamma Ltd",
      type: "Audio",
      duration: "18:45",
      uploadDate: "2025-01-14 16:45",
      status: "Verwerken...",
      fileSize: "28,3 MB",
      flagged: false,
    },
    {
      id: 4,
      user: "Lisa de Jong",
      userInitials: "LdJ",
      workspace: "SalesForce NL",
      title: "Cold call - Delta Industries",
      type: "Audio",
      duration: "12:30",
      uploadDate: "2025-01-14 11:20",
      status: "Mislukt",
      fileSize: "18,7 MB",
      flagged: true,
    },
    {
      id: 5,
      user: "Jan de Vries",
      userInitials: "JdV",
      workspace: "TechCorp BV",
      title: "Demo call - Epsilon Corp",
      type: "Video",
      duration: "56:12",
      uploadDate: "2025-01-13 09:30",
      status: "Voltooid",
      fileSize: "312,5 MB",
      overallScore: 91,
      scoreDelta: "up",
      phase: "Aanbevelingsfase",
      flagged: false,
    },
  ];

  // Statistics
  const stats = {
    totalUploads: 156,
    avgScore: 79,
    processingNow: 8,
    failedToday: 2,
  };

  const filteredUploads = uploads.filter((upload) => {
    if (searchQuery && !upload.title.toLowerCase().includes(searchQuery.toLowerCase()) && !upload.user.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus !== "all" && upload.status !== filterStatus) {
      return false;
    }
    if (filterType !== "all" && upload.type !== filterType) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Voltooid":
        return (
          <Badge className="bg-hh-success/10 text-hh-success border-0 text-[13px]">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Voltooid
          </Badge>
        );
      case "Verwerken...":
        return (
          <Badge className="bg-hh-ocean-blue/10 text-hh-ocean-blue border-0 text-[13px]">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            Verwerken...
          </Badge>
        );
      case "Mislukt":
        return (
          <Badge className="bg-hh-error/10 text-hh-error border-0 text-[13px]">
            <XCircle className="w-3 h-3 mr-1" />
            Mislukt
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout currentPage="admin-uploads" navigate={navigate}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Upload Management
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Beheer en analyseer alle geüploade sales gesprekken van users
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
              Totaal Uploads
            </p>
            <p className="text-[28px] leading-[36px] text-hh-ink font-semibold">
              {stats.totalUploads}
            </p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-hh-success" />
              </div>
              <Badge className="bg-hh-success/10 text-hh-success border-hh-success/20 text-[11px] px-2">
                +5%
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              Gem. Score
            </p>
            <p className="text-[28px] leading-[36px] text-hh-ink font-semibold">
              {stats.avgScore}%
            </p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-hh-ocean-blue/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-hh-ocean-blue" />
              </div>
              <Badge className="bg-hh-ocean-blue/10 text-hh-ocean-blue border-hh-ocean-blue/20 text-[11px] px-2">
                Live
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              In Verwerking
            </p>
            <p className="text-[28px] leading-[36px] text-hh-ink font-semibold">
              {stats.processingNow}
            </p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-hh-error/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-hh-error" />
              </div>
              <Badge className="bg-hh-error/10 text-hh-error border-hh-error/20 text-[11px] px-2">
                -8
              </Badge>
            </div>
            <p className="text-[13px] text-hh-muted mb-2">
              Mislukt Vandaag
            </p>
            <p className="text-[28px] leading-[36px] text-hh-ink font-semibold">
              {stats.failedToday}
            </p>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek op titel, user, workspace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Statussen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Statussen</SelectItem>
                <SelectItem value="Voltooid">Voltooid</SelectItem>
                <SelectItem value="Verwerken...">Verwerken...</SelectItem>
                <SelectItem value="Mislukt">Mislukt</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Types</SelectItem>
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
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

        {/* Uploads Table/Grid */}
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
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    User & Titel
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Type & Duur
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Upload Datum
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Grootte
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
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/10 text-purple-600 flex items-center justify-center text-[12px] font-semibold">
                          {upload.userInitials}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-hh-text mb-0.5">
                            {upload.title}
                          </p>
                          <p className="text-[12px] text-hh-muted">
                            {upload.user} • {upload.workspace}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {upload.type === "Audio" ? (
                          <FileAudio className="w-4 h-4 text-hh-muted" />
                        ) : (
                          <Video className="w-4 h-4 text-hh-muted" />
                        )}
                        <div>
                          <p className="text-[13px] text-hh-text">{upload.type}</p>
                          <p className="text-[12px] text-hh-muted">{upload.duration} • {upload.fileSize}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(upload.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-hh-muted">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[12px]">
                          {upload.uploadDate}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] text-hh-text">
                        {upload.fileSize}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedUpload(upload);
                            setShowDetails(true);
                          }}
                          disabled={upload.status !== "Voltooid"}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Transcript
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Flag className="w-4 h-4 mr-2" />
                              {upload.flagged ? "Unflag" : "Flag"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-hh-error">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Verwijder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                Geen uploads gevonden met deze filters
              </p>
            </div>
          )}
        </Card>

        {/* Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Details</DialogTitle>
              <DialogDescription>
                Volledige analyse van {selectedUpload?.title}
              </DialogDescription>
            </DialogHeader>

            {selectedUpload && selectedUpload.overallScore && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[18px] text-hh-text mb-1">
                      {selectedUpload.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[14px] text-hh-muted">
                      <span>{selectedUpload.user}</span>
                      <span>•</span>
                      <span>{selectedUpload.workspace}</span>
                      <span>•</span>
                      <span>{selectedUpload.uploadDate}</span>
                    </div>
                  </div>
                  {getStatusBadge(selectedUpload.status)}
                </div>

                {/* Overall Score */}
                <Card className="p-6 border-hh-success/20 bg-hh-success/5">
                  <h4 className="text-[16px] text-hh-text mb-4">
                    Overall Score
                  </h4>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[48px] leading-[56px] text-hh-success font-semibold">
                      {selectedUpload.overallScore}
                    </span>
                    <span className="text-[24px] text-hh-muted">
                      /100
                    </span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[11px]">
                    {selectedUpload.phase}
                  </Badge>
                </Card>

                {/* Technique Scores */}
                {selectedUpload.techniqueScores && (
                  <div>
                    <h4 className="text-[16px] text-hh-text mb-3">
                      Techniek Scores
                    </h4>
                    <div className="space-y-3">
                      {selectedUpload.techniqueScores.map((tech: any, idx: number) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-600/10 text-purple-600 border-purple-600/20 text-[11px] font-mono">
                                {tech.technique}
                              </Badge>
                              <div>
                                <p className="text-[14px] text-hh-text font-medium">
                                  {tech.name}
                                </p>
                                <p className="text-[12px] text-hh-muted">
                                  {tech.count}x gebruikt
                                </p>
                              </div>
                            </div>
                            <div className="text-[18px] text-hh-success font-semibold">
                              {tech.score}%
                            </div>
                          </div>
                          <div className="w-full bg-hh-ui-100 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${tech.score}%` }}
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}