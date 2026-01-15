import { useState, useMemo } from "react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
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
  Search,
  Bell,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  MoreVertical,
  Check,
} from "lucide-react";

interface AdminNotificationsProps {
  navigate?: (page: string) => void;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  category: "Users" | "Sessions" | "System" | "Config";
  isNew: boolean;
  isRead: boolean;
  time: string;
}

export function AdminNotifications({ navigate }: AdminNotificationsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const notifications: Notification[] = useMemo(() => [
    {
      id: "1",
      title: "Nieuwe gebruiker geregistreerd",
      description: "Jan de Vries heeft zich aangemeld voor het Pro abonnement",
      category: "Users",
      isNew: true,
      isRead: false,
      time: "2 min geleden",
    },
    {
      id: "2",
      title: "Live sessie start binnenkort",
      description: "Discovery Technieken Q&A begint over 15 minuten",
      category: "Sessions",
      isNew: true,
      isRead: false,
      time: "15 min geleden",
    },
    {
      id: "3",
      title: "Nieuwe feedback ontvangen",
      description: "5 nieuwe reviews voor SPIN Questioning Workshop",
      category: "Sessions",
      isNew: false,
      isRead: false,
      time: "1 uur geleden",
    },
    {
      id: "4",
      title: "Systeem update voltooid",
      description: "AI model v2.3 is succesvol gedeployed",
      category: "System",
      isNew: false,
      isRead: true,
      time: "3 uur geleden",
    },
    {
      id: "5",
      title: "Configuratie conflict gedetecteerd",
      description: "Technique 2.1 heeft geen detector configuratie",
      category: "Config",
      isNew: false,
      isRead: true,
      time: "5 uur geleden",
    },
    {
      id: "6",
      title: "Nieuwe gebruiker geregistreerd",
      description: "Sarah van Dijk heeft zich aangemeld voor het Basic abonnement",
      category: "Users",
      isNew: false,
      isRead: true,
      time: "1 dag geleden",
    },
    {
      id: "7",
      title: "Webinar voltooid",
      description: "Advanced Closing Techniques webinar is afgelopen",
      category: "Sessions",
      isNew: false,
      isRead: true,
      time: "2 dagen geleden",
    },
    {
      id: "8",
      title: "Weekly rapport beschikbaar",
      description: "Platform analytics rapport voor week 2 is klaar",
      category: "System",
      isNew: false,
      isRead: true,
      time: "3 dagen geleden",
    },
  ], []);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "unread" && !notif.isRead) ||
      (typeFilter === "read" && notif.isRead);
    const matchesCategory = categoryFilter === "all" || notif.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;
  const thisWeekCount = 24;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map((n) => n.id));
    }
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Users":
        return {
          bgColor: "bg-purple-100",
          icon: <Users className="w-5 h-5 text-purple-600" />,
        };
      case "Sessions":
        return {
          bgColor: "bg-green-100",
          icon: <Calendar className="w-5 h-5 text-green-600" />,
        };
      case "Content":
        return {
          bgColor: "bg-blue-100",
          icon: <Bell className="w-5 h-5 text-blue-600" />,
        };
      case "System":
        return {
          bgColor: "bg-green-100",
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
        };
      case "Config":
        return {
          bgColor: "bg-red-100",
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
        };
      default:
        return {
          bgColor: "bg-slate-100",
          icon: <Bell className="w-5 h-5 text-slate-600" />,
        };
    }
  };

  return (
    <AdminLayout currentPage="admin-notifications" navigate={navigate}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-[32px] leading-[40px] font-bold text-hh-ink mb-2">
            Notificaties
          </h1>
          <p className="text-[16px] leading-[24px] text-hh-muted">
            Beheer systeem notificaties en meldingen
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Bell className="w-5 h-5 text-slate-600" />
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Totaal Notificaties</p>
            <p className="text-[28px] font-semibold text-hh-ink">{totalCount}</p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border relative">
            <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 text-[10px] px-2">
              Nieuw
            </Badge>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Ongelezen</p>
            <p className="text-[28px] font-semibold text-hh-ink">{unreadCount}</p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Gelezen</p>
            <p className="text-[28px] font-semibold text-hh-ink">{readCount}</p>
          </Card>

          <Card className="p-5 rounded-[16px] shadow-hh-sm border-hh-border relative">
            <Badge className="absolute top-4 right-4 bg-green-500 text-white border-0 text-[10px] px-2">
              +12%
            </Badge>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-[13px] text-hh-muted mb-1">Deze week</p>
            <p className="text-[28px] font-semibold text-hh-ink">{thisWeekCount}</p>
          </Card>
        </div>

        <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex-1 relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek notificaties..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-[13px]"
                onClick={selectAll}
              >
                <Check className="w-4 h-4" />
                Alles
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Alle notificaties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle notificaties</SelectItem>
                <SelectItem value="unread">Ongelezen</SelectItem>
                <SelectItem value="read">Gelezen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Alle categorieën" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                <SelectItem value="Users">Users</SelectItem>
                <SelectItem value="Sessions">Sessions</SelectItem>
                <SelectItem value="System">System</SelectItem>
                <SelectItem value="Config">Config</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 rounded-[16px] shadow-hh-sm border-hh-border hover:shadow-md transition-shadow ${
                !notif.isRead ? "bg-white" : "bg-slate-50/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={selectedIds.includes(notif.id)}
                  onCheckedChange={() => toggleSelect(notif.id)}
                  className="mt-1"
                />

                <div className={`w-10 h-10 rounded-full ${getCategoryStyles(notif.category).bgColor} flex items-center justify-center shrink-0`}>
                  {getCategoryStyles(notif.category).icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-[15px] font-semibold text-hh-ink">
                        {notif.title}
                      </h3>
                      <p className="text-[13px] text-hh-muted mt-0.5">
                        {notif.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className="text-[11px] bg-slate-50 text-slate-600 border-slate-200"
                        >
                          {notif.category}
                        </Badge>
                        {notif.isNew && (
                          <Badge className="bg-blue-500 text-white border-0 text-[10px] px-2">
                            Nieuw
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[12px] text-hh-muted whitespace-nowrap">
                        {notif.time}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Markeer als gelezen</DropdownMenuItem>
                          <DropdownMenuItem>Bekijk details</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
