import { AdminLayout } from "./AdminLayout";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
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
import {
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from "lucide-react";

interface AdminConfigReviewProps {
  navigate?: (page: string) => void;
}

type ConflictType = "Missing Detector" | "Pattern Mismatch" | "Phase Error" | "Scoring Error" | "Timeout Issue";
type Severity = "HIGH" | "MEDIUM" | "LOW";
type Status = "pending" | "approved" | "rejected";

interface ConfigConflict {
  id: number;
  techniek: string;
  techniqueLabel: string;
  type: ConflictType;
  severity: Severity;
  description: string;
  status: Status;
  detectedAgo: string;
  detectedDate: string;
  suggestedFix?: string;
}

export function AdminConfigReview({ navigate }: AdminConfigReviewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedConflict, setSelectedConflict] = useState<ConfigConflict | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const conflicts: ConfigConflict[] = [
    {
      id: 1,
      techniek: "2.1",
      techniqueLabel: "Feitgerichte vragen",
      type: "Missing Detector",
      severity: "HIGH",
      description: "No detector configuration found for techniek 2.1",
      status: "pending",
      detectedAgo: "2u geleden",
      detectedDate: "13 jan 2026, 12:23",
      suggestedFix: "Add detector configuration with minimum 3 keywords: 'wat', 'welke', 'hoeveel'",
    },
    {
      id: 2,
      techniek: "3.2",
      techniqueLabel: "Oplossing",
      type: "Pattern Mismatch",
      severity: "MEDIUM",
      description: "Current patterns are too broad and trigger false positives",
      status: "pending",
      detectedAgo: "5u geleden",
      detectedDate: "13 jan 2026, 09:15",
      suggestedFix: "Narrow pattern matching to include context: solution keywords must follow problem identification",
    },
    {
      id: 3,
      techniek: "4.1",
      techniqueLabel: "Proefafsluiting",
      type: "Phase Error",
      severity: "HIGH",
      description: "AI attempted to transition to phase 5 which doesn't exist",
      status: "pending",
      detectedAgo: "1d geleden",
      detectedDate: "12 jan 2026, 14:45",
      suggestedFix: "Update phase transition logic to cap at phase 4 (Afsluiting)",
    },
    {
      id: 4,
      techniek: "A1",
      techniqueLabel: "Antwoord op de vraag",
      type: "Scoring Error",
      severity: "MEDIUM",
      description: "Scoring weights don't sum to 100%",
      status: "approved",
      detectedAgo: "2d geleden",
      detectedDate: "11 jan 2026, 16:30",
      suggestedFix: "Adjust weights: technique accuracy (40%), flow (30%), empathy (20%), timing (10%)",
    },
    {
      id: 5,
      techniek: "2.1.6",
      techniqueLabel: "Actief luisteren",
      type: "Timeout Issue",
      severity: "LOW",
      description: "Detector times out on transcripts longer than 45 minutes",
      status: "rejected",
      detectedAgo: "3d geleden",
      detectedDate: "10 jan 2026, 11:20",
      suggestedFix: "Optimize regex patterns to reduce processing time by 40%",
    },
  ];

  const stats = {
    pending: conflicts.filter((c) => c.status === "pending").length,
    approved: conflicts.filter((c) => c.status === "approved").length,
    rejected: conflicts.filter((c) => c.status === "rejected").length,
    total: conflicts.length,
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case "HIGH":
        return (
          <Badge className="bg-red-600 text-white border-red-600 text-[11px] uppercase font-semibold">
            HIGH
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-orange-500 text-white border-orange-500 text-[11px] uppercase font-semibold">
            MEDIUM
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-slate-400 text-white border-slate-400 text-[11px] uppercase font-semibold">
            LOW
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[11px]">
            pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-300 text-[11px]">
            approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 text-[11px]">
            rejected
          </Badge>
        );
    }
  };

  const handleViewDetails = (conflict: ConfigConflict) => {
    setSelectedConflict(conflict);
    setDetailsDialogOpen(true);
  };

  const handleApprove = (conflictId: number) => {
    console.log("Approve conflict:", conflictId);
  };

  const handleReject = (conflictId: number) => {
    console.log("Reject conflict:", conflictId);
  };

  const filteredConflicts = conflicts.filter((conflict) => {
    const matchesSearch =
      conflict.techniek.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.techniqueLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conflict.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || conflict.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || conflict.status === filterStatus;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <AdminLayout currentPage="admin-config-review" navigate={navigate}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Config Review
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Review en goedkeur AI configuratie conflicten
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600/10 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Pending
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.pending}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-hh-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-hh-success" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Approved
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.approved}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Rejected
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.rejected}
            </p>
          </Card>

          <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-600/10 flex items-center justify-center">
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1 sm:mb-2">
              Totaal
            </p>
            <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-ink">
              {stats.total}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek technieken, types, beschrijving..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Severity</SelectItem>
                <SelectItem value="HIGH">HIGH</SelectItem>
                <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                <SelectItem value="LOW">LOW</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder="Alle Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Conflicts Table */}
        <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-hh-ui-50 border-b border-hh-border">
                <tr>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Techniek
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Beschrijving
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Gedetecteerd
                  </th>
                  <th className="text-left px-4 py-3 text-[13px] font-semibold text-hh-text">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredConflicts.map((conflict) => (
                  <tr
                    key={conflict.id}
                    className="border-b border-hh-border hover:bg-hh-ui-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[11px] font-mono bg-purple-600/10 text-purple-600 border-purple-600/20"
                        >
                          {conflict.techniek}
                        </Badge>
                        <p className="text-[14px] leading-[20px] text-hh-text font-medium">
                          {conflict.techniqueLabel}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-[11px]">
                        {conflict.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">{getSeverityBadge(conflict.severity)}</td>
                    <td className="px-4 py-4">
                      <p className="text-[14px] leading-[20px] text-hh-text max-w-md">
                        {conflict.description}
                      </p>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(conflict.status)}</td>
                    <td className="px-4 py-4">
                      <p className="text-[13px] leading-[18px] text-hh-muted">
                        {conflict.detectedAgo}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(conflict)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {conflict.status === "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(conflict.id)}>
                                <ThumbsUp className="w-4 h-4 mr-2 text-hh-success" />
                                Approve Fix
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(conflict.id)}>
                                <ThumbsDown className="w-4 h-4 mr-2 text-red-600" />
                                Reject Fix
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[24px] leading-[32px] text-hh-text">
              Config Conflict Details
            </DialogTitle>
            <DialogDescription className="text-[14px] leading-[20px] text-hh-muted">
              {selectedConflict?.techniek} - {selectedConflict?.techniqueLabel}
            </DialogDescription>
          </DialogHeader>

          {selectedConflict && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] text-hh-muted mb-1">Type</p>
                  <Badge className="bg-hh-ui-100 text-hh-text border-hh-border">
                    {selectedConflict.type}
                  </Badge>
                </div>
                <div>
                  <p className="text-[12px] text-hh-muted mb-1">Severity</p>
                  {getSeverityBadge(selectedConflict.severity)}
                </div>
                <div>
                  <p className="text-[12px] text-hh-muted mb-1">Status</p>
                  {getStatusBadge(selectedConflict.status)}
                </div>
                <div>
                  <p className="text-[12px] text-hh-muted mb-1">Gedetecteerd</p>
                  <p className="text-[14px] text-hh-text">{selectedConflict.detectedDate}</p>
                </div>
              </div>

              <Card className="p-4 bg-hh-ui-50 border-hh-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-hh-error flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-medium text-hh-text mb-1">Probleem</p>
                    <p className="text-[14px] text-hh-muted">{selectedConflict.description}</p>
                  </div>
                </div>
              </Card>

              {selectedConflict.suggestedFix && (
                <Card className="p-4 bg-hh-ui-50 border-hh-border">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-hh-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-medium text-hh-text mb-1">
                        Voorgestelde Fix
                      </p>
                      <p className="text-[14px] text-hh-muted">{selectedConflict.suggestedFix}</p>
                    </div>
                  </div>
                </Card>
              )}

              {selectedConflict.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-hh-border">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => {
                      handleReject(selectedConflict.id);
                      setDetailsDialogOpen(false);
                    }}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Reject Fix
                  </Button>
                  <Button
                    className="flex-1 gap-2 bg-hh-success hover:bg-hh-success/90 text-white"
                    onClick={() => {
                      handleApprove(selectedConflict.id);
                      setDetailsDialogOpen(false);
                    }}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Approve Fix
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}