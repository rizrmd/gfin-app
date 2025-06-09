import { useLocal } from "@/lib/hooks/use-local";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAI } from "@/lib/ai/use-ai";
import { Textarea } from "@/components/ui/textarea";
import { user } from "@/lib/user";

export default () => {
  user.init();
  const organizationId = user.organization?.id;
  const ai = useAI();
  const local = useLocal({
    prompt: "",
    response: "",
    loading: false,
    error: ""
  }, async () => {
    // Initial load if needed
  });

  const handleSubmit = async () => {
    if (!local.prompt) return;
    // if (!organizationId) {
    //   local.error = "Please select an organization first";
    //   local.render();
    //   return;
    // }
    
    try {
      local.loading = true;
      local.error = "";
      local.render();

      const response = await ai.task.do("opportunity_list", {
        // id_org: organizationId,
        prompt: local.prompt
      });

      local.response = JSON.stringify(response, null, 2);
    } catch (error) {
      local.error = "Failed to search. Please try again.";
      console.error("❌ Error:", error);
    } finally {
      local.loading = false;
      local.render();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="space-y-4">
          <Textarea
            placeholder="Type your prompt here..."
            value={local.prompt}
            disabled={local.loading}
            onChange={(e) => {
              local.prompt = e.target.value;
              local.render();
            }}
            className="min-h-[100px]"
          />

          <Button
            type="button"
            className="w-full"
            disabled={local.loading}
            onClick={handleSubmit}
          >
            {local.loading ? "Processing..." : "Submit"}
          </Button>
        </div>

        {local.error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {local.error}
          </div>
        )}

        {local.response && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Response:</h2>
            <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
              {local.response}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
