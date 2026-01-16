import { useState, useMemo } from "react";
import { Card } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Search, List, LayoutGrid, MoreVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  actions?: Action<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  showViewToggle?: boolean;
  renderGridCard?: (item: T) => React.ReactNode;
  getRowKey: (item: T) => string;
  emptyMessage?: string;
  colorScheme?: "admin" | "user";
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  actions = [],
  searchPlaceholder = "Zoeken...",
  searchKeys = [],
  showViewToggle = true,
  renderGridCard,
  getRowKey,
  emptyMessage = "Geen items gevonden",
  colorScheme = "user",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    filters.reduce((acc, f) => ({ ...acc, [f.key]: "all" }), {})
  );
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const activeColor = colorScheme === "admin" ? "bg-purple-600 hover:bg-purple-700" : "bg-hh-ink hover:bg-hh-ink/90";

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-hh-muted" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-hh-ink" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-hh-ink" />
    );
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchQuery && searchKeys.length > 0) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    filters.forEach((filter) => {
      const value = filterValues[filter.key];
      if (value && value !== "all") {
        result = result.filter((item) => item[filter.key] === value);
      }
    });

    if (sortField) {
      result.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal || "").toLowerCase();
        const bStr = String(bVal || "").toLowerCase();
        const comparison = aStr.localeCompare(bStr);
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchQuery, searchKeys, filterValues, filters, sortField, sortDirection]);

  return (
    <div className="space-y-4">
      <Card className="p-4 rounded-[16px] shadow-hh-sm border-hh-border">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hh-muted" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={filterValues[filter.key]}
              onValueChange={(value: string) =>
                setFilterValues((prev) => ({ ...prev, [filter.key]: value }))
              }
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          {showViewToggle && renderGridCard && (
            <div className="flex gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? activeColor : ""}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? activeColor : ""}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      {viewMode === "list" ? (
        <Card className="rounded-[16px] shadow-hh-sm border-hh-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-hh-border bg-hh-ui-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`text-left py-3 px-4 text-[13px] font-semibold text-hh-text ${
                        col.sortable ? "cursor-pointer hover:bg-hh-ui-100 transition-colors" : ""
                      }`}
                      style={{ width: col.width }}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    >
                      <div className="flex items-center">
                        {col.header}
                        {col.sortable && <SortIcon field={col.key} />}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="text-left py-3 px-4 text-[13px] font-semibold text-hh-text w-[70px]">
                      Acties
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                      className="py-8 text-center text-hh-muted"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedData.map((item) => (
                    <tr
                      key={getRowKey(item)}
                      className="border-b border-hh-border last:border-0 hover:bg-hh-ui-50/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="py-3 px-4">
                          {col.render ? col.render(item) : item[col.key]}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action, idx) => (
                                <DropdownMenuItem
                                  key={idx}
                                  onClick={() => action.onClick(item)}
                                >
                                  {action.icon}
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        renderGridCard && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAndSortedData.map((item) => (
              <div key={getRowKey(item)}>{renderGridCard(item)}</div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
