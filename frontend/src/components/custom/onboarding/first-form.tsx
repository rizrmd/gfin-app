import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSnapshot } from "valtio";
import { onboard } from "../../../lib/ai-onboard";
import { usStates } from "shared/lib/us_states";

export const OnboardFirstForm = () => {
  const read = useSnapshot(onboard);

  const handleSubmit = async () => {
    onboard.step = "search_by_name_state";
    onboard.sync.send({
      task: "search_by_name_state",
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-4 flex flex-col items-stretch"
    >
      <div>
        <Label htmlFor="orgName">Organization Name</Label>
        <Input
          id="orgName"
          value={read.org.entry.name}
          onInput={(e) => {
            onboard.org.entry.name = e.currentTarget.value;
          }}
          placeholder="Enter organization name"
        />
      </div>
      <div>
        <Label htmlFor="state">State</Label>
        <Select
          value={read.org.entry.state}
          onValueChange={(value) => {
            onboard.org.entry.state = value;
          }}
        >
          <SelectTrigger id="state">
            <SelectValue placeholder="Select a state" />
          </SelectTrigger>
          <SelectContent>
            {usStates.map((stateName) => (
              <SelectItem key={stateName} value={stateName.split(" - ")[1]}>
                {stateName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSubmit} className="">
        Next
      </Button>
    </form>
  );
};
