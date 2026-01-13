import {
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Users,
  Eye,
  Clock,
  Award,
  Video,
  PlayCircle,
  Radio,
  FileText,
  DollarSign,
  Play,
} from "lucide-react";
import { AdminLayout } from "./AdminLayout";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { getTechniqueByNumber } from "../../data/epicTechniques";

interface AdminAnalyticsProps {
  navigate?: (page: string) => void;
}

export function AdminAnalytics({ navigate }: AdminAnalyticsProps) {
  const metrics = [
    {
      label: "DAU (Daily Active Users)",
      value: "847",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
    {
      label: "MAU (Monthly Active)",
      value: "2,340",
      change: "+23%",
      trend: "up",
      icon: TrendingUp,
      color: "text-hh-success",
      bgColor: "bg-hh-success/10",
    },
    {
      label: "Retention Rate",
      value: "78%",
      change: "-2%",
      trend: "down",
      icon: Award,
      color: "text-hh-warn",
      bgColor: "bg-hh-warn/10",
    },
    {
      label: "Revenue (MTD)",
      value: "€12,450",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
  ];

  const contentPerformance = [
    {
      id: 1,
      type: "Video",
      title: "SPIN Questioning Technique",
      views: 847,
      completionRate: 92,
      avgDuration: "17:32",
      rating: 4.8,
    },
    {
      id: 2,
      type: "Scenario",
      title: "SaaS Discovery Call",
      views: 423,
      completionRate: 88,
      avgDuration: "24:15",
      rating: 4.6,
    },
    {
      id: 3,
      type: "Video",
      title: "E.P.I.C Framework",
      views: 389,
      completionRate: 85,
      avgDuration: "22:48",
      rating: 4.9,
    },
    {
      id: 4,
      type: "Live",
      title: "Objection Handling Q&A",
      views: 234,
      completionRate: 78,
      avgDuration: "45:20",
      rating: 4.7,
    },
    {
      id: 5,
      type: "Scenario",
      title: "Cold Calling Roleplay",
      views: 198,
      completionRate: 82,
      avgDuration: "18:55",
      rating: 4.5,
    },
  ];

  const userEngagement = [
    { week: "Week 1", sessions: 423, avgScore: 76 },
    { week: "Week 2", sessions: 512, avgScore: 78 },
    { week: "Week 3", sessions: 634, avgScore: 81 },
    { week: "Week 4", sessions: 721, avgScore: 84 },
  ];

  return (
    <AdminLayout currentPage="admin-analytics" navigate={navigate}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
              Platform Analytics
            </h1>
            <p className="text-[16px] leading-[24px] text-hh-muted">
              Gedetailleerde platform statistieken en performance metrics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select defaultValue="30">
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Laatste 7 dagen</SelectItem>
                <SelectItem value="30">Laatste 30 dagen</SelectItem>
                <SelectItem value="90">Laatste 90 dagen</SelectItem>
                <SelectItem value="365">Laatste jaar</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden lg:inline">Export Report</span>
              <span className="lg:hidden">Export</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics - 2x2 grid on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card
                key={metric.label}
                className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${metric.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${metric.color}`} />
                  </div>
                  <Badge
                    className={`${
                      metric.trend === "up"
                        ? "bg-hh-success/10 text-hh-success border-hh-success/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    } text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5`}
                  >
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-[12px] sm:text-[13px] leading-[16px] sm:leading-[18px] text-hh-muted mb-1">
                  {metric.label}
                </p>
                <p className="text-[24px] sm:text-[28px] leading-[32px] sm:leading-[36px] text-hh-text font-semibold">
                  {metric.value}
                </p>
              </Card>
            );
          })}
        </div>

        {/* User Growth Chart Placeholder */}
        <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
          <h3 className="text-[18px] leading-[24px] text-hh-text mb-4">
            User Growth (Laatste 6 maanden)
          </h3>
          <div className="h-64 bg-hh-ui-50 rounded-lg flex items-center justify-center border border-hh-border">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-hh-muted mx-auto mb-3" />
              <p className="text-[14px] leading-[20px] text-hh-muted">
                Line chart met nieuwe users, churn, net growth
              </p>
              <p className="text-[12px] leading-[16px] text-hh-muted mt-1">
                Recharts integratie vereist
              </p>
            </div>
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Performance */}
          <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
            <h3 className="text-[18px] leading-[24px] text-hh-text mb-4">
              Content Performance (Top 5)
            </h3>
            <div className="space-y-4">
              {contentPerformance.map((content) => (
                <div
                  key={content.id}
                  className="flex items-start gap-3 p-3 bg-hh-ui-50 rounded-lg hover:bg-hh-ui-100 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg ${
                    content.type === "Video"
                      ? "bg-purple-600/10"
                      : content.type === "Live"
                      ? "bg-red-600/10"
                      : "bg-blue-600/10"
                  } flex items-center justify-center flex-shrink-0`}>
                    {content.type === "Video" ? (
                      <Video className={`w-5 h-5 ${
                        content.type === "Video"
                          ? "text-purple-600"
                          : content.type === "Live"
                          ? "text-red-600"
                          : "text-blue-600"
                      }`} />
                    ) : content.type === "Live" ? (
                      <Play className="w-5 h-5 text-red-600" />
                    ) : (
                      <Play className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[14px] leading-[20px] text-hh-text font-medium truncate">
                        {content.title}
                      </p>
                      <Badge variant="outline" className="text-[10px] ml-2 flex-shrink-0">
                        {content.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] leading-[16px] text-hh-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {content.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-hh-success" />
                        {content.completionRate}%
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {content.avgDuration}
                      </span>
                      <span>⭐ {content.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* User Engagement */}
          <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
            <h3 className="text-[18px] leading-[24px] text-hh-text mb-4">
              Weekly Activity
            </h3>
            <div className="space-y-4">
              {userEngagement.map((week, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-[13px] leading-[18px]">
                    <span className="text-hh-muted">{week.week}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-hh-text">
                        <span className="font-medium">{week.sessions}</span> sessies
                      </span>
                      <span className="text-hh-text">
                        <span className="font-medium">{week.avgScore}%</span> avg score
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-hh-ui-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-red-600 rounded-full transition-all"
                      style={{ width: `${(week.sessions / 800) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-hh-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[12px] leading-[16px] text-hh-muted mb-1">
                    Total Sessies
                  </p>
                  <p className="text-[20px] leading-[28px] text-hh-text font-semibold">
                    2,290
                  </p>
                </div>
                <div>
                  <p className="text-[12px] leading-[16px] text-hh-muted mb-1">
                    Gem Score Trend
                  </p>
                  <p className="text-[20px] leading-[28px] text-hh-success font-semibold flex items-center gap-1">
                    +8%
                    <TrendingUp className="w-4 h-4" />
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Platform Statistics */}
        <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border">
          <h3 className="text-[18px] leading-[24px] text-hh-text mb-4">
            Platform Statistieken
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
                Total Users
              </p>
              <p className="text-[24px] leading-[32px] text-hh-text font-semibold">
                2,847
              </p>
              <p className="text-[12px] leading-[16px] text-hh-success mt-1">
                +234 deze maand
              </p>
            </div>
            <div>
              <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
                Total Sessies
              </p>
              <p className="text-[24px] leading-[32px] text-hh-text font-semibold">
                12,450
              </p>
              <p className="text-[12px] leading-[16px] text-hh-success mt-1">
                +1,234 deze maand
              </p>
            </div>
            <div>
              <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
                Total Video's
              </p>
              <p className="text-[24px] leading-[32px] text-hh-text font-semibold">
                127
              </p>
              <p className="text-[12px] leading-[16px] text-hh-success mt-1">
                +8 deze maand
              </p>
            </div>
            <div>
              <p className="text-[13px] leading-[18px] text-hh-muted mb-2">
                Live Sessies
              </p>
              <p className="text-[24px] leading-[32px] text-hh-text font-semibold">
                24
              </p>
              <p className="text-[12px] leading-[16px] text-hh-success mt-1">
                +3 deze maand
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}