import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface FilterActionsProps {
  isFilterActive: boolean;
  onClearFilter: () => void;
  searchLabel?: string;
}

export function FilterActions({
  isFilterActive,
  onClearFilter,
  searchLabel = "Cari",
}: FilterActionsProps) {
  
  return (
    <div className="flex gap-2 pb-[2px] shrink-0 justify-between">
      <Button
        type="button"
        variant="link"
        disabled={isFilterActive}
        onClick={onClearFilter}
        size="default"
        className="w-[40px] flex justify-center items-center disabled:opacity-50"
      >
        Bersihkan
      </Button>

      <Button type="submit" size="sm" className="w-[100px]">
        <Search className="h-4 w-4 mr-2" />
        {searchLabel}
      </Button>
    </div>
  );
}
