import {
  Film,
  VideoIcon,
  Play,
  Search,
  Upload,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Download,
  Plus,
  List,
  LayoutGrid,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings,
  Cloud,
  Database,
  HardDrive,
  Headphones,
  FileText,
  Activity,
  Check,
} from "lucide-react";
import { useState } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
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
  DialogFooter,
} from "../ui/dialog";
import { getTechniqueByNumber } from "../../data/epicTechniques";

// Custom Checkbox Component - Subtiel hol vierkantje met paars vinkje
interface CustomCheckboxProps {
  checked: boolean;
  onChange: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

function CustomCheckbox({ checked, onChange, onClick }: CustomCheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick?.(e);
    onChange();
  };

  return (
    <div
      className="relative w-4 h-4 cursor-pointer"
      onClick={handleClick}
    >
      {/* Hidden native checkbox voor accessibility */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        tabIndex={-1}
      />
      
      {/* Custom visual checkbox - Hol vierkantje met subtiele border */}
      <div
        className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
          checked
            ? 'border-purple-600 bg-white'
            : 'border-slate-300 bg-white hover:border-purple-400'
        }`}
      >
        {/* Paars vinkje bij checked state */}
        {checked && (
          <Check className="w-3 h-3 text-purple-600" strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
}

interface AdminVideoManagementProps {
  navigate?: (page: string) => void;
}

export function AdminVideoManagement({ navigate }: AdminVideoManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sortField, setSortField] = useState<"title" | "views" | "date" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  // Upload form state
  const [uploadStep, setUploadStep] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    titel: "",
    beschrijving: "",
    fase: "",
    technieken: [] as string[],
    niveau: "",
    duur: "18:45",
    tags: "",
  });

  interface Video {
    id: number;
    title: string;
    techniqueNumber: string;
    fase: string;
    niveau: string;
    duration: string;
    views: number;
    completion: number;
    status: string;
    thumbnail: string;
    uploadDate: string;
  }

  const videos: Video[] = [
    {
      id: 1,
      title: getTechniqueByNumber("2.1.2")?.naam || "Meningsgerichte vragen",
      techniqueNumber: "2.1.2",
      fase: "Ontdekkingsfase",
      niveau: "Gemiddeld",
      duration: "18:45",
      views: 847,
      completion: 92,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.2",
      uploadDate: "12 jan 2025",
    },
    {
      id: 2,
      title: getTechniqueByNumber("1.1")?.naam || "Koopklimaat creëren",
      techniqueNumber: "1.1",
      fase: "Voorbereiding",
      niveau: "Beginner",
      duration: "24:30",
      views: 389,
      completion: 85,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=1.1",
      uploadDate: "10 jan 2025",
    },
    {
      id: 3,
      title: getTechniqueByNumber("2.1")?.naam || "Explore questioning",
      techniqueNumber: "2.1",
      fase: "Ontdekkingsfase",
      niveau: "Gemiddeld",
      duration: "15:20",
      views: 592,
      completion: 87,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1",
      uploadDate: "9 jan 2025",
    },
    {
      id: 4,
      title: getTechniqueByNumber("4.2.4")?.naam || "Bezwaren",
      techniqueNumber: "4.2.4",
      fase: "Beslissingsfase",
      niveau: "Gevorderd",
      duration: "32:18",
      views: 234,
      completion: 78,
      status: "Concept",
      thumbnail: "https://via.placeholder.com/320x180/B1B2B5/FFFFFF?text=4.2.4",
      uploadDate: "6 jan 2025",
    },
    {
      id: 5,
      title: getTechniqueByNumber("3.2")?.naam || "Oplossing",
      techniqueNumber: "3.2",
      fase: "Aanbevelingsfase",
      niveau: "Gemiddeld",
      duration: "21:50",
      views: 423,
      completion: 81,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=3.2",
      uploadDate: "5 jan 2025",
    },
    {
      id: 6,
      title: getTechniqueByNumber("1.2")?.naam || "Gentleman's agreement",
      techniqueNumber: "1.2",
      fase: "Voorbereiding",
      niveau: "Beginner",
      duration: "08:32",
      views: 512,
      completion: 94,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=1.2",
      uploadDate: "3 jan 2025",
    },
    {
      id: 7,
      title: getTechniqueByNumber("2.1.1")?.naam || "Feitgerichte vragen",
      techniqueNumber: "2.1.1",
      fase: "Ontdekkingsfase",
      niveau: "Beginner",
      duration: "19:42",
      views: 711,
      completion: 91,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.1",
      uploadDate: "2 jan 2025",
    },
    {
      id: 8,
      title: getTechniqueByNumber("2.1.3")?.naam || "Feitgerichte vragen onder alternatieve vorm",
      techniqueNumber: "2.1.3",
      fase: "Ontdekkingsfase",
      niveau: "Gemiddeld",
      duration: "22:15",
      views: 468,
      completion: 82,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.3",
      uploadDate: "1 jan 2025",
    },
    {
      id: 9,
      title: getTechniqueByNumber("2.1.4")?.naam || "Ter zijde schuiven",
      techniqueNumber: "2.1.4",
      fase: "Ontdekkingsfase",
      niveau: "Gevorderd",
      duration: "14:55",
      views: 321,
      completion: 76,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.4",
      uploadDate: "30 dec 2024",
    },
    {
      id: 10,
      title: getTechniqueByNumber("2.1.5")?.naam || "Pingpong techniek",
      techniqueNumber: "2.1.5",
      fase: "Ontdekkingsfase",
      niveau: "Gemiddeld",
      duration: "17:30",
      views: 543,
      completion: 89,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.5",
      uploadDate: "28 dec 2024",
    },
    {
      id: 11,
      title: getTechniqueByNumber("2.1.6")?.naam || "Actief en empathisch luisteren",
      techniqueNumber: "2.1.6",
      fase: "Ontdekkingsfase",
      niveau: "Beginner",
      duration: "20:18",
      views: 678,
      completion: 93,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.6",
      uploadDate: "25 dec 2024",
    },
    {
      id: 12,
      title: getTechniqueByNumber("4.2")?.naam || "Houdingen van de klant",
      techniqueNumber: "4.2",
      fase: "Beslissingsfase",
      niveau: "Gevorderd",
      duration: "28:40",
      views: 412,
      completion: 84,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=4.2",
      uploadDate: "22 dec 2024",
    },
    {
      id: 13,
      title: getTechniqueByNumber("4.2.1")?.naam || "Klant stelt vragen",
      techniqueNumber: "4.2.1",
      fase: "Beslissingsfase",
      niveau: "Gemiddeld",
      duration: "16:25",
      views: 389,
      completion: 80,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=4.2.1",
      uploadDate: "20 dec 2024",
    },
    {
      id: 14,
      title: getTechniqueByNumber("4.2.2")?.naam || "Twijfels",
      techniqueNumber: "4.2.2",
      fase: "Beslissingsfase",
      niveau: "Gemiddeld",
      duration: "18:50",
      views: 456,
      completion: 86,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=4.2.2",
      uploadDate: "18 dec 2024",
    },
    {
      id: 15,
      title: getTechniqueByNumber("4.2.3")?.naam || "Poging tot uitstel",
      techniqueNumber: "4.2.3",
      fase: "Beslissingsfase",
      niveau: "Gevorderd",
      duration: "21:05",
      views: 334,
      completion: 77,
      status: "Concept",
      thumbnail: "https://via.placeholder.com/320x180/B1B2B5/FFFFFF?text=4.2.3",
      uploadDate: "15 dec 2024",
    },
    {
      id: 16,
      title: getTechniqueByNumber("4.2.5")?.naam || "Angst / Bezorgdheden",
      techniqueNumber: "4.2.5",
      fase: "Beslissingsfase",
      niveau: "Gevorderd",
      duration: "25:15",
      views: 298,
      completion: 79,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=4.2.5",
      uploadDate: "12 dec 2024",
    },
    {
      id: 17,
      title: getTechniqueByNumber("A1")?.naam || "Antwoord op de vraag",
      techniqueNumber: "A1",
      fase: "Algemeen",
      niveau: "Beginner",
      duration: "11:30",
      views: 891,
      completion: 95,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=A1",
      uploadDate: "10 dec 2024",
    },
    {
      id: 18,
      title: "Bron",
      techniqueNumber: "2.1.1.1",
      fase: "Ontdekkingsfase",
      niveau: "Beginner",
      duration: "09:15",
      views: 523,
      completion: 88,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.1.1",
      uploadDate: "8 dec 2024",
    },
    {
      id: 19,
      title: "Motivatie",
      techniqueNumber: "2.1.1.2",
      fase: "Ontdekkingsfase",
      niveau: "Beginner",
      duration: "10:45",
      views: 467,
      completion: 86,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.1.2",
      uploadDate: "6 dec 2024",
    },
    {
      id: 20,
      title: "Budget",
      techniqueNumber: "2.1.1.6",
      fase: "Ontdekkingsfase",
      niveau: "Gemiddeld",
      duration: "13:20",
      views: 612,
      completion: 91,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.1.6",
      uploadDate: "4 dec 2024",
    },
    {
      id: 21,
      title: "Timing",
      techniqueNumber: "2.1.1.7",
      fase: "Ontdekkingsfase",
      niveau: "Gemiddeld",
      duration: "11:55",
      views: 389,
      completion: 83,
      status: "Concept",
      thumbnail: "https://via.placeholder.com/320x180/B1B2B5/FFFFFF?text=2.1.1.7",
      uploadDate: "2 dec 2024",
    },
    {
      id: 22,
      title: "Beslissingscriteria",
      techniqueNumber: "2.1.1.8",
      fase: "Ontdekkingsfase",
      niveau: "Gevorderd",
      duration: "16:30",
      views: 278,
      completion: 79,
      status: "Gepubliceerd",
      thumbnail: "https://via.placeholder.com/320x180/6B7A92/FFFFFF?text=2.1.1.8",
      uploadDate: "30 nov 2024",
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setUploadStep(2);
    }
  };

  const handlePublish = () => {
    console.log("Publishing video:", { videoFile, formData });
    setCreateDialogOpen(false);
    setUploadStep(1);
    setVideoFile(null);
    setFormData({
      titel: "",
      beschrijving: "",
      fase: "",
      technieken: [],
      niveau: "",
      duur: "18:45",
      tags: "",
    });
  };

  const handleEdit = (video: Video) => {
    setSelectedVideo(video);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedVideo) {
      const updatedVideo = {
        ...selectedVideo,
        titel: formData.titel,
        beschrijving: formData.beschrijving,
        fase: formData.fase,
        niveau: formData.niveau,
        duur: formData.duur,
        tags: formData.tags,
      };
      const index = videos.findIndex((v) => v.id === selectedVideo.id);
      if (index !== -1) {
        videos[index] = updatedVideo;
      }
      setEditDialogOpen(false);
      setFormData({
        titel: "",
        beschrijving: "",
        fase: "",
        technieken: [],
        niveau: "",
        duur: "18:45",
        tags: "",
      });
    }
  };

  const handleDelete = (video: Video) => {
    const index = videos.findIndex((v) => v.id === video.id);
    if (index !== -1) {
      videos.splice(index, 1);
    }
  };

  const handleSort = (field: "title" | "views" | "date") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedVideos = [...videos].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === "title") {
      return sortDirection === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortField === "views") {
      return sortDirection === "asc" ? a.views - b.views : b.views - a.views;
    }
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
    return 0;
  });

  // Bulk selection helpers
  const toggleSelectAll = () => {
    if (selectedIds.length === sortedVideos.length) {
      setSelectedIds([]);
      setSelectionMode(false); // Exit selection mode when deselecting all
    } else {
      setSelectedIds(sortedVideos.map((v) => v.id));
      setSelectionMode(true);
    }
  };

  const toggleSelectId = (id: number) => {
    if (selectedIds.includes(id)) {
      const newSelection = selectedIds.filter((selectedId) => selectedId !== id);
      setSelectedIds(newSelection);
      // Exit selection mode if no items selected
      if (newSelection.length === 0) {
        setSelectionMode(false);
      }
    } else {
      setSelectedIds([...selectedIds, id]);
      setSelectionMode(true); // Enter selection mode on first select
    }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    if (confirm(`Weet je zeker dat je ${selectedIds.length} video's wilt verwijderen?`)) {
      // Handle bulk delete
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  const handleBulkStatusChange = (status: string) => {
    // Handle bulk status change
    console.log(`Changing ${selectedIds.length} videos to status: ${status}`);
  };

  return (
    <AdminLayout currentPage="admin-videos" navigate={navigate}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Video Management
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              258 video's totaal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Upload className="w-4 h-4" />
              Sync Drive
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Cloud className="w-4 h-4" />
              Deploy
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-red-600 border-red-600/30 hover:bg-red-50 hover:border-red-600"
            >
              <Activity className="w-4 h-4" />
              Stop Worker
            </Button>
          </div>
        </div>

        {/* Bulk Actions Toolbar - Verschijnt bij selectie */}
        {selectionMode && selectedIds.length > 0 && (
          <Card className="p-4 rounded-[16px] shadow-hh-md border-purple-600/30 bg-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-[13px] font-semibold">
                    {selectedIds.length}
                  </div>
                  <span className="text-[14px] text-hh-text font-medium">
                    {selectedIds.length === 1 ? '1 video geselecteerd' : `${selectedIds.length} video's geselecteerd`}
                  </span>
                </div>
                
                <div className="h-6 w-px bg-hh-border" />
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8"
                    onClick={() => handleBulkStatusChange('Gepubliceerd')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Publiceer
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8"
                    onClick={() => handleBulkStatusChange('Concept')}
                  >
                    <Clock className="w-4 h-4" />
                    Concept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-8 text-red-600 hover:text-red-700 hover:border-red-600"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Verwijder
                  </Button>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedIds([]);
                  setSelectionMode(false);
                }}
              >
                Annuleer
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards - 2x3 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Drive */}
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0.5 bg-purple-500/10 text-purple-500 border-purple-500/20"
              >
                1 bezig
              </Badge>
            </div>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
              Drive
            </p>
            <p className="text-[32px] leading-[40px] text-hh-ink font-semibold">
              107
            </p>
          </Card>

          {/* Greenscreen */}
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <VideoIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0.5 bg-purple-500/10 text-purple-500 border-purple-500/20"
              >
                3 bezig
              </Badge>
            </div>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
              Greenscreen
            </p>
            <p className="text-[32px] leading-[40px] text-hh-ink font-semibold">
              104
            </p>
          </Card>

          {/* Audio */}
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-slate-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-500 border-green-500/20"
              >
                40%
              </Badge>
            </div>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
              Audio
            </p>
            <p className="text-[32px] leading-[40px] text-hh-ink font-semibold">
              104
            </p>
          </Card>

          {/* Transcript */}
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-500 border-green-500/20"
              >
                40%
              </Badge>
            </div>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
              Transcript
            </p>
            <p className="text-[32px] leading-[40px] text-hh-ink font-semibold">
              104
            </p>
          </Card>

          {/* RAG */}
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-600/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-slate-600" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-500 border-green-500/20"
              >
                40%
              </Badge>
            </div>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
              RAG
            </p>
            <p className="text-[32px] leading-[40px] text-hh-ink font-semibold">
              104
            </p>
          </Card>

          {/* Mux */}
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-500/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-slate-500" />
              </div>
              <Badge
                variant="outline"
                className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-500 border-green-500/20"
              >
                40%
              </Badge>
            </div>
            <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
              Mux
            </p>
            <p className="text-[32px] leading-[40px] text-hh-ink font-semibold">
              104
            </p>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search - Left Side */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek video's..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filters - Middle */}
            <Select value={filterPhase} onValueChange={setFilterPhase}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Fases" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Fases</SelectItem>
                <SelectItem value="opening">Openingsfase</SelectItem>
                <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                <SelectItem value="beslissing">Beslissingsfase</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="published">Gepubliceerd</SelectItem>
                <SelectItem value="concept">Concept</SelectItem>
                <SelectItem value="archived">Gearchiveerd</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle - Right Side */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  viewMode === "list" 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${
                  viewMode === "grid" 
                    ? "bg-purple-600 text-white hover:bg-purple-700" 
                    : "text-hh-muted hover:text-hh-text hover:bg-hh-ui-50"
                }`}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Video Grid */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((video) => (
              <Card
                key={video.id}
                className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden hover:shadow-hh-md transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-hh-ui-200 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" className="rounded-full w-12 h-12">
                      <Play className="w-6 h-6" />
                    </Button>
                  </div>
                  {/* Duration Badge */}
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white border-0 text-[11px]">
                    {video.duration}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        video.status === "Gepubliceerd"
                          ? "border-hh-success/20 text-hh-success"
                          : "border-hh-warn/20 text-hh-warn"
                      }`}
                    >
                      {video.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEdit(video)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Bewerk
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(video)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Verwijder
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="text-[16px] leading-[24px] text-hh-text font-semibold mb-2">
                    {video.title}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Fase</span>
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-hh-primary/10 text-hh-primary border-hh-primary/20"
                      >
                        {video.fase}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Views</span>
                      <span className="text-hh-text font-medium">{video.views}</span>
                    </div>
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="text-hh-muted">Completion</span>
                      <span className="text-hh-text font-medium">
                        {video.completion}%
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="rounded-[16px] border border-hh-border overflow-hidden bg-white">
            <table className="w-full">
              <thead className="bg-hh-ui-50 border-b border-hh-border">
                <tr>
                  <th className="text-left px-4 py-3 w-12">
                    {selectionMode && (
                      <CustomCheckbox
                        checked={selectedIds.length === sortedVideos.length && sortedVideos.length > 0}
                        onChange={toggleSelectAll}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-muted">
                    #
                  </th>
                  <th
                    className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("title")}
                  >
                    <div className="flex items-center gap-2">
                      Video
                      {sortField === "title" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        ))}
                      {sortField !== "title" && (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Fase
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Duur
                  </th>
                  <th
                    className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text cursor-pointer hover:bg-hh-ui-100 transition-colors"
                    onClick={() => handleSort("views")}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Views
                      {sortField === "views" &&
                        (sortDirection === "asc" ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        ))}
                      {sortField !== "views" && (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Completion
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((video, index) => (
                  <tr
                    key={video.id}
                    onClick={() => handleEdit(video)}
                    onMouseEnter={() => setHoveredRow(video.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    className={`border-b border-hh-border last:border-0 hover:bg-hh-ui-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "bg-white" : "bg-hh-ui-50/30"
                    }`}
                  >
                    {(selectionMode || hoveredRow === video.id) && (
                      <td className="px-4 py-3 w-12">
                        <CustomCheckbox
                          checked={selectedIds.includes(video.id)}
                          onChange={() => toggleSelectId(video.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {!selectionMode && hoveredRow !== video.id && (
                      <td className="px-4 py-3 w-12"></td>
                    )}
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-[13px] font-semibold">
                        {video.techniqueNumber}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[14px] text-hh-text font-medium">
                        {video.title}
                      </div>
                      <div className="text-[12px] text-hh-muted">
                        Upload: {video.uploadDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-[11px] bg-blue-600/10 text-blue-600 border-blue-600/20"
                      >
                        {video.fase}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 text-[13px] text-hh-text">
                        <VideoIcon className="w-3.5 h-3.5 text-purple-600" />
                        <span>{video.duration}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 text-[13px] text-hh-text">
                        <Play className="w-3.5 h-3.5 text-purple-600" />
                        <span>{video.views}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] text-hh-success font-semibold">{video.completion}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${
                          video.status === "Gepubliceerd"
                            ? "bg-hh-success/10 text-hh-success border-hh-success/20"
                            : "bg-hh-warn/10 text-hh-warn border-hh-warn/20"
                        }`}
                      >
                        {video.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectionMode(!selectionMode)}>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {selectionMode ? "Stop selecteren" : "Selecteren"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(video)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Bewerk
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(video)}
                          >
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
        )}
      </div>

      {/* Upload Video Modal */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Nieuwe Video</DialogTitle>
            <DialogDescription>
              Voeg een nieuwe training video toe aan de bibliotheek
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium ${
                      uploadStep >= step
                        ? "bg-purple-600 text-white"
                        : "bg-hh-ui-200 text-hh-muted"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        uploadStep > step ? "bg-purple-600" : "bg-hh-ui-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Upload */}
            {uploadStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[14px] mb-2 block">Video File</Label>
                  <div className="border-2 border-dashed border-hh-border rounded-[16px] p-8 text-center hover:border-purple-600 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Film className="w-12 h-12 text-hh-muted mx-auto mb-3" />
                      <p className="text-[16px] leading-[24px] text-hh-text mb-1">
                        Sleep video hier of klik om te selecteren
                      </p>
                      <p className="text-[13px] leading-[18px] text-hh-muted">
                        Supported: MP4, MOV, WebM (max 2GB)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="text-center text-hh-muted text-[14px]">OF</div>

                <div>
                  <Label htmlFor="video-url" className="text-[14px] mb-2 block">
                    Video URL
                  </Label>
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-[12px] leading-[16px] text-hh-muted mt-1">
                    YouTube, Vimeo, of directe video URL
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Metadata */}
            {uploadStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titel" className="text-[14px] mb-2 block">
                    Titel *
                  </Label>
                  <Input
                    id="titel"
                    placeholder="Bijv: SPIN Questioning Technique"
                    value={formData.titel}
                    onChange={(e) =>
                      setFormData({ ...formData, titel: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="beschrijving" className="text-[14px] mb-2 block">
                    Beschrijving
                  </Label>
                  <Textarea
                    id="beschrijving"
                    placeholder="Korte beschrijving van de video inhoud..."
                    rows={3}
                    value={formData.beschrijving}
                    onChange={(e) =>
                      setFormData({ ...formData, beschrijving: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fase" className="text-[14px] mb-2 block">
                      Fase *
                    </Label>
                    <Select
                      value={formData.fase}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fase: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer fase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opening">Openingsfase</SelectItem>
                        <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                        <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                        <SelectItem value="beslissing">Beslissingsfase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="niveau" className="text-[14px] mb-2 block">
                      Niveau *
                    </Label>
                    <Select
                      value={formData.niveau}
                      onValueChange={(value) =>
                        setFormData({ ...formData, niveau: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
                        <SelectItem value="gevorderd">Gevorderd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-[14px] mb-2 block">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="SPIN, questioning, discovery, sales"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                  <p className="text-[12px] leading-[16px] text-hh-muted mt-1">
                    Gescheiden door komma's
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Publiceren */}
            {uploadStep === 3 && (
              <div className="space-y-4">
                <Card className="p-4 bg-hh-ui-50 border-hh-border rounded-[12px]">
                  <h4 className="text-[15px] leading-[20px] text-hh-text font-medium mb-3">
                    Video Overzicht
                  </h4>
                  <div className="space-y-2 text-[14px] leading-[20px]">
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Titel:</span>
                      <span className="text-hh-text font-medium">
                        {formData.titel || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Fase:</span>
                      <span className="text-hh-text">{formData.fase || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Niveau:</span>
                      <span className="text-hh-text">{formData.niveau || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Duur:</span>
                      <span className="text-hh-text">{formData.duur}</span>
                    </div>
                  </div>
                </Card>

                <div>
                  <Label className="text-[14px] mb-3 block">Status</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-hh-border rounded-lg hover:bg-hh-ui-50 cursor-pointer">
                      <input type="radio" name="status" defaultChecked />
                      <div>
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          Gepubliceerd
                        </p>
                        <p className="text-[12px] leading-[16px] text-hh-muted">
                          Direct zichtbaar voor alle gebruikers
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-hh-border rounded-lg hover:bg-hh-ui-50 cursor-pointer">
                      <input type="radio" name="status" />
                      <div>
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          Concept
                        </p>
                        <p className="text-[12px] leading-[16px] text-hh-muted">
                          Opslaan zonder te publiceren
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {uploadStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setUploadStep(uploadStep - 1)}
              >
                Vorige
              </Button>
            )}
            {uploadStep < 3 ? (
              <Button
                onClick={() => setUploadStep(uploadStep + 1)}
                disabled={uploadStep === 1 && !videoFile}
              >
                Volgende
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handlePublish}>
                  Opslaan als Concept
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handlePublish}
                >
                  Publiceren
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Video Modal - EDIT DIALOG */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bewerk Video</DialogTitle>
            <DialogDescription>
              Pas de video details aan in de bibliotheek
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium ${
                      uploadStep >= step
                        ? "bg-purple-600 text-white"
                        : "bg-hh-ui-200 text-hh-muted"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded ${
                        uploadStep > step ? "bg-purple-600" : "bg-hh-ui-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Upload */}
            {uploadStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[14px] mb-2 block">Video File</Label>
                  <div className="border-2 border-dashed border-hh-border rounded-[16px] p-8 text-center hover:border-purple-600 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Film className="w-12 h-12 text-hh-muted mx-auto mb-3" />
                      <p className="text-[16px] leading-[24px] text-hh-text mb-1">
                        Sleep video hier of klik om te selecteren
                      </p>
                      <p className="text-[13px] leading-[18px] text-hh-muted">
                        Supported: MP4, MOV, WebM (max 2GB)
                      </p>
                    </label>
                  </div>
                </div>

                <div className="text-center text-hh-muted text-[14px]">OF</div>

                <div>
                  <Label htmlFor="video-url" className="text-[14px] mb-2 block">
                    Video URL
                  </Label>
                  <Input
                    id="video-url"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-[12px] leading-[16px] text-hh-muted mt-1">
                    YouTube, Vimeo, of directe video URL
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Metadata */}
            {uploadStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titel" className="text-[14px] mb-2 block">
                    Titel *
                  </Label>
                  <Input
                    id="titel"
                    placeholder="Bijv: SPIN Questioning Technique"
                    value={formData.titel}
                    onChange={(e) =>
                      setFormData({ ...formData, titel: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="beschrijving" className="text-[14px] mb-2 block">
                    Beschrijving
                  </Label>
                  <Textarea
                    id="beschrijving"
                    placeholder="Korte beschrijving van de video inhoud..."
                    rows={3}
                    value={formData.beschrijving}
                    onChange={(e) =>
                      setFormData({ ...formData, beschrijving: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fase" className="text-[14px] mb-2 block">
                      Fase *
                    </Label>
                    <Select
                      value={formData.fase}
                      onValueChange={(value) =>
                        setFormData({ ...formData, fase: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer fase" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opening">Openingsfase</SelectItem>
                        <SelectItem value="ontdekking">Ontdekkingsfase</SelectItem>
                        <SelectItem value="aanbeveling">Aanbevelingsfase</SelectItem>
                        <SelectItem value="beslissing">Beslissingsfase</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="niveau" className="text-[14px] mb-2 block">
                      Niveau *
                    </Label>
                    <Select
                      value={formData.niveau}
                      onValueChange={(value) =>
                        setFormData({ ...formData, niveau: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="gemiddeld">Gemiddeld</SelectItem>
                        <SelectItem value="gevorderd">Gevorderd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags" className="text-[14px] mb-2 block">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="SPIN, questioning, discovery, sales"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                  />
                  <p className="text-[12px] leading-[16px] text-hh-muted mt-1">
                    Gescheiden door komma's
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Publiceren */}
            {uploadStep === 3 && (
              <div className="space-y-4">
                <Card className="p-4 bg-hh-ui-50 border-hh-border rounded-[12px]">
                  <h4 className="text-[15px] leading-[20px] text-hh-text font-medium mb-3">
                    Video Overzicht
                  </h4>
                  <div className="space-y-2 text-[14px] leading-[20px]">
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Titel:</span>
                      <span className="text-hh-text font-medium">
                        {formData.titel || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Fase:</span>
                      <span className="text-hh-text">{formData.fase || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Niveau:</span>
                      <span className="text-hh-text">{formData.niveau || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-hh-muted">Duur:</span>
                      <span className="text-hh-text">{formData.duur}</span>
                    </div>
                  </div>
                </Card>

                <div>
                  <Label className="text-[14px] mb-3 block">Status</Label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-hh-border rounded-lg hover:bg-hh-ui-50 cursor-pointer">
                      <input type="radio" name="status" defaultChecked />
                      <div>
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          Gepubliceerd
                        </p>
                        <p className="text-[12px] leading-[16px] text-hh-muted">
                          Direct zichtbaar voor alle gebruikers
                        </p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-hh-border rounded-lg hover:bg-hh-ui-50 cursor-pointer">
                      <input type="radio" name="status" />
                      <div>
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          Concept
                        </p>
                        <p className="text-[12px] leading-[16px] text-hh-muted">
                          Opslaan zonder te publiceren
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {uploadStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setUploadStep(uploadStep - 1)}
              >
                Vorige
              </Button>
            )}
            {uploadStep < 3 ? (
              <Button
                onClick={() => setUploadStep(uploadStep + 1)}
                disabled={uploadStep === 1 && !videoFile}
              >
                Volgende
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleSaveEdit}>
                  Opslaan als Concept
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleSaveEdit}
                >
                  Publiceren
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}