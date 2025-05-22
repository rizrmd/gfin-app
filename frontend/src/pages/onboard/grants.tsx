"use client";

import { BodyFrame } from "@/components/custom/frame/body-frame";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Filter,
  Search, 
  Sparkles, 
  X 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { css } from "@emotion/css";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { grantState } from "@/lib/states/grant-state";

const FilterSection = () => {
  const grantRead = useSnapshot(grantState.write);
  
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Filters</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full px-2">
            {Object.values(grantRead.filters).filter(Boolean).length}
          </Badge>
          {grantRead.showMobileFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => grantState.write.showMobileFilters = false}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Solicitation</label>
          <Select
            value={grantRead.filters.solicitation}
            onValueChange={(val) => {
              grantState.write.filters.solicitation = val;
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select solicitation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="construction">Construction Security</SelectItem>
              <SelectItem value="usaid">USAID Democratic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select
            value={grantRead.filters.location}
            onValueChange={(val) => {
              grantState.write.filters.location = val;
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={grantRead.filters.title}
            onChange={(e) => {
              grantState.write.filters.title = e.target.value;
            }}
            placeholder="Enter title"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !grantRead.filters.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {grantRead.filters.date ? format(new Date(grantRead.filters.date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={grantRead.filters.date ? new Date(grantRead.filters.date) : undefined}
                onSelect={(date) => {
                  grantState.write.filters.date = date ? date.toISOString() : "";
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
};

export default () => {
  const grantRead = useSnapshot(grantState.write);
  const filteredGrants = grantState.getFilteredGrants();

  useEffect(() => {
    grantState.fetch();
  }, []);

  return (
    <BodyFrame
      className="min-h-screen bg-gray-50"
      header={
        <div className="w-full">
          <div className="md:absolute pointer-events-none inset-0 flex items-center justify-center">
            <h1 className="text-2xl font-bold">Onboarding Results</h1>
          </div>
        </div>
      }>
      {/* Page Title Section */}
      <section className={cn(
        "w-full pb-5",
        css`
          background: linear-gradient(180deg, #f0f4ff 0%,#f4f4f4 100%);
          border-bottom: 1px solid rgba(2, 2, 2, 0.06);
        `
      )}>
        <div className="max-w-[1127px] mx-auto px-4">
          <div className="flex items-center justify-between pt-5">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Grant Management</h1>
                <p className="text-sm text-muted-foreground">Browse and filter available grants</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1127px] mx-auto px-4">
        <div className="py-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSection />
            </div>

            {/* Mobile Filter Overlay */}
            {grantRead.showMobileFilters && (
              <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
                <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white shadow-xl">
                  <div className="p-4 h-full overflow-y-auto">
                    <FilterSection />
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0 lg:min-w-[800px]">
              {/* Search Bar & Mobile Filter Button */}
              <div className="flex items-center gap-2 sm:gap-4 mb-6">
                <button 
                  onClick={() => grantState.write.showMobileFilters = true}
                  className="lg:hidden p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filters</span>
                </button>
                
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for contracts or grants"
                    className="w-full rounded-full max-w-[400px]  pl-10"
                    value={grantRead.filters.search}
                    onChange={(e) => grantState.write.filters.search = e.target.value}
                  />
                </div>
                
                <Button className="gap-2 bg-transparent shadow-none">
                  <Sparkles className={cn(
                    "text-blue-900 shadow-none",
                    css`
                      box-shadow: none !important;
                    `
                    )} />
                  <span className="hidden sm:inline"></span>
                </Button>
              </div>

              {/* Grants List */}
              <div className="space-y-6">
                {/* Grants List */}
                <div className="shadow-md rounded-lg bg-white overflow-hidden border-2 border-gray-200">
                  <div className="px-6 py-2 border-b border-gray-100">
                    <div className="font-medium text-xs text-gray-900">
                      All Grants ({grantRead.pagination.totalItems})
                    </div>
                  </div>
                  
                  {grantRead.loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : filteredGrants.length > 0 ? (
                    <div>
                      {filteredGrants.map((grant, index) => (
                        <div key={grant.id} className={cn(
                          "flex flex-col sm:flex-row items-start justify-between px-6 py-4",
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        )}>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium hover:underline cursor-pointer">
                              {grant.title}
                            </h3>
                            <div className="mt-1 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Posted Date:</span>
                                <span>{format(new Date(grant.postedDate), "yyyy-MM-dd")}</span>
                                <span className="text-gray-400">20:00:00+09:00</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Close Date:</span>
                                <span>{format(new Date(grant.closeDate), "yyyy-MM-dd")}</span>
                                <span className="text-gray-400">20:00:00+09:00</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-3 sm:mt-0">
                            <Button 
                              variant="ghost" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 h-8 text-sm"
                            >
                              view details
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                            <Button
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 h-8 text-sm rounded-full"
                            >
                              Summarise
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <div className="text-gray-500 mb-2">No grants found</div>
                      <div className="text-sm text-gray-400">
                        Try adjusting your search terms or filters
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredGrants.length > 0 && (
                  <div className="flex justify-end">
                    <div className="bg-white shadow-md rounded-lg py-2 px-4 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => grantState.setPage(grantRead.pagination.currentPage - 1)}
                            disabled={grantRead.pagination.currentPage === 1}
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </Button>
                          {Array.from({ length: grantState.getTotalPages() }, (_, i) => i + 1).map((page) => (
                            <Button 
                              key={page}
                              variant="ghost"
                              className={cn(
                                "h-6 min-w-[1.5rem] px-1",
                                page === grantRead.pagination.currentPage && "bg-gray-100 text-gray-900"
                              )}
                              onClick={() => grantState.setPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                          <Button 
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => grantState.setPage(grantRead.pagination.currentPage + 1)}
                            disabled={grantRead.pagination.currentPage === grantState.getTotalPages()}
                          >
                            <ChevronRight className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BodyFrame>
  );
};
