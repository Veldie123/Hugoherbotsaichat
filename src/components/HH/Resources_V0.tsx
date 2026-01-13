import { AppLayout } from "./AppLayout";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Download, FileText, Video, BookOpen, ExternalLink, Star, Search, List, LayoutGrid } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ResourcesProps {
  navigate?: (page: string) => void;
  isAdmin?: boolean;
}

export function Resources({ navigate, isAdmin }: ResourcesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const resources = [
    {
      type: "PDF",
      title: "EPIC Methodologie - Complete Gids",
      description: "Volledige uitleg van de 4 fasen en 25 technieken van Hugo's EPIC sales methode",
      size: "2.4 MB",
      downloads: 1247,
      featured: true,
      category: "Methodologie",
    },
    {
      type: "PDF",
      title: "Techniek Referentie Kaarten",
      description: "Printbare kaarten met alle 25 technieken — handig tijdens je gesprekken",
      size: "1.8 MB",
      downloads: 892,
      featured: true,
      category: "Technieken",
    },
    {
      type: "Video",
      title: "Hugo's Masterclass - Ontdekkingsfase",
      description: "60 minuten diepgaande training over de kunst van het stellen van de juiste vragen",
      size: "245 MB",
      downloads: 634,
      featured: false,
      category: "Video cursus",
    },
    {
      type: "PDF",
      title: "Bezwaar Behandeling Framework",
      description: "Complete handleiding voor het omgaan met de 5 meest voorkomende bezwaren",
      size: "1.2 MB",
      downloads: 1108,
      featured: false,
      category: "Technieken",
    },
    {
      type: "PDF",
      title: "Sales Gesprek Template",
      description: "Gestructureerde template voor het voorbereiden van je sales gesprekken",
      size: "0.8 MB",
      downloads: 1456,
      featured: false,
      category: "Templates",
    },
    {
      type: "Spreadsheet",
      title: "KPI Tracking Dashboard",
      description: "Excel template om je sales metrics en voortgang bij te houden",
      size: "0.5 MB",
      downloads: 723,
      featured: false,
      category: "Analytics",
    },
    {
      type: "PDF",
      title: "ICP Definitie Workbook",
      description: "Werkboek om je Ideal Customer Profile scherp te krijgen",
      size: "1.1 MB",
      downloads: 589,
      featured: false,
      category: "Strategie",
    },
    {
      type: "Video",
      title: "Role-Play Best Practices",
      description: "15 minuten training over hoe je het meeste uit je oefensessies haalt",
      size: "78 MB",
      downloads: 445,
      featured: false,
      category: "Training",
    },
  ];

  const categories = ["all", "Methodologie", "Technieken", "Templates", "Video cursus", "Analytics", "Strategie", "Training"];

  const getIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="w-5 h-5" />;
      case "Video":
        return <Video className="w-5 h-5" />;
      case "Spreadsheet":
        return <FileText className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-hh-destructive/10 text-hh-destructive";
      case "Video":
        return "bg-hh-primary/10 text-hh-primary";
      case "Spreadsheet":
        return "bg-hh-success/10 text-hh-success";
      default:
        return "bg-hh-muted/10 text-hh-muted";
    }
  };

  const filteredResources = resources.filter((resource) =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterCategory === "all" || resource.category === filterCategory)
  );

  return (
    <AppLayout
      currentPage="resources"
      navigate={navigate}
      isAdmin={isAdmin}
    >
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-[32px] leading-[40px] text-hh-text mb-2">
            Resources & Downloads
          </h1>
          <p className="text-[16px] leading-[24px] text-hh-muted">
            Handige materialen en tools om je sales skills naar een hoger niveau te tillen
          </p>
        </div>

        {/* Filter Card - Uniform Structure */}
        <Card className="p-4 sm:p-5 rounded-[16px] shadow-hh-sm border-hh-border">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search - Left Side */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
              <Input
                placeholder="Zoek resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter - Middle */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full lg:w-[220px]">
                <SelectValue placeholder="Alle Categorieën" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Categorieën</SelectItem>
                <SelectItem value="Methodologie">Methodologie</SelectItem>
                <SelectItem value="Technieken">Technieken</SelectItem>
                <SelectItem value="Templates">Templates</SelectItem>
                <SelectItem value="Video cursus">Video cursus</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Strategie">Strategie</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
              </SelectContent>
            </Select>
            
            {/* View Toggle - Right Side */}
            <div className="flex gap-1 sm:ml-auto shrink-0">
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

        {/* Featured Resources */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-hh-warn fill-hh-warn" />
            <h2 className="text-[24px] leading-[32px] text-hh-text">
              Featured resources
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resources
              .filter((r) => r.featured)
              .map((resource, idx) => (
                <Card
                  key={idx}
                  className="p-6 rounded-[16px] shadow-hh-sm border-hh-primary/20 bg-gradient-to-br from-hh-primary/5 to-transparent hover:shadow-hh-md transition-all"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-lg ${getTypeColor(resource.type)} flex items-center justify-center`}>
                      {getIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-1">
                        <Badge variant="outline" className="text-[12px] bg-white">
                          {resource.category}
                        </Badge>
                        <Star className="w-4 h-4 text-hh-warn fill-hh-warn" />
                      </div>
                      <h3 className="text-[20px] leading-[28px] text-hh-text mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-[14px] leading-[20px] text-hh-muted mb-4">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[14px] leading-[20px] text-hh-muted">
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>{resource.downloads.toLocaleString()} downloads</span>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hh-primary text-white hover:bg-hh-primary/90 transition-colors">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* All Resources */}
        <div>
          <h2 className="text-[24px] leading-[32px] text-hh-text mb-6">
            Alle resources
          </h2>
          <Card className="p-6 rounded-[16px] shadow-hh-sm border-hh-border divide-y divide-hh-border">
            {filteredResources.map((resource, idx) => (
              <div
                key={idx}
                className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 hover:bg-hh-ui-50 -mx-6 px-6 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg ${getTypeColor(resource.type)} flex items-center justify-center flex-shrink-0`}>
                  {getIcon(resource.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[16px] leading-[24px] text-hh-text truncate">
                      {resource.title}
                    </h3>
                    {resource.featured && (
                      <Star className="w-4 h-4 text-hh-warn fill-hh-warn flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-[14px] leading-[20px] text-hh-muted">
                    {resource.category} • {resource.size} • {resource.downloads.toLocaleString()} downloads
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-hh-border hover:bg-hh-ui-50 transition-colors opacity-0 group-hover:opacity-100">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </Card>
        </div>

        {/* Need Custom Resource */}
        <Card className="p-8 rounded-[16px] shadow-hh-sm border-hh-primary/20 bg-hh-primary/5">
          <div className="text-center max-w-xl mx-auto">
            <ExternalLink className="w-12 h-12 text-hh-primary mx-auto mb-4" />
            <h3 className="text-[24px] leading-[32px] text-hh-text mb-2">
              Op zoek naar iets specifieks?
            </h3>
            <p className="text-[16px] leading-[24px] text-hh-muted mb-6">
              Laat ons weten welke resources je graag zou willen zien — we maken ze voor je.
            </p>
            <button className="px-6 py-3 rounded-xl bg-hh-primary text-white hover:bg-hh-primary/90 transition-colors">
              Suggereer een resource
            </button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}