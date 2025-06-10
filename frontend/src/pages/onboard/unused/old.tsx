import { ConversationQA } from "@/components/custom/ai/onboard/conversation-qa";
import { PickMode } from "@/components/custom/ai/onboard/pick-mode";
import SummaryProfile from "@/components/custom/ai/onboard/summary-profile";
import { SummaryQA } from "@/components/custom/ai/onboard/summary-qa";
import { BodyFrame } from "@/components/custom/frame/body-frame";
import { useAiOnboard } from "@/lib/ai/onboard";
import { useAI } from "@/lib/ai/use-ai";
import { useLocal } from "@/lib/hooks/use-local";
import { Protected } from "@/lib/user";
import { user } from "@/lib/user";

export default () => {
  const ai = useAiOnboard();
  const aio = useAI();
  
  const local = useLocal({
    orgId: "",
    loading: false,
    error: null as string | null
  }, async () => {
    try {
      await user.init();
      // if (user.organization?.id) {
      //   local.orgId = user.organization.id;
      //   // Once we have the org ID, we can update the profile
      //   const res = await aio.task.do("update_org_profile", {
      //     id_org: local.orgId,
      //     prompt: "Find the latest information about this organization.",
      //     system: "You are an expert in gathering verified information about organizations."
      //   });
      //   if (!res) {
      //     local.error = "Failed to update organization profile";
      //   }
      // } else {
      //   local.error = "Organization ID not found";
      // }
    } catch (e) {
      local.error = e.message;
    } finally {
      local.loading = false;
      local.render();
    }
  });

  return (
    <Protected>
      <BodyFrame className="flex flex-col items-center justify-center gap-4">
        {local.error ? (
          <div className="text-red-500">{local.error}</div>
        ) : local.loading ? (
          <div>Loading...</div>
        ) : ai.local.mode === "" ? (
          <PickMode ai={ai} len={ai.local.messages.length} />
        ) : (
          <>
            {ai.local.mode === "auto" && (
              <>
                {ai.local.summary ? (
                  <SummaryQA ai={ai} len={ai.local.messages.length} />
                ) : (
                  <ConversationQA ai={ai} />
                )}
              </>
            )}

            {ai.local.mode === "manual" && (
              <>
                {!ai.local.phase.qa ? (
                  <SummaryQA ai={ai} len={ai.local.messages.length} />
                ) : (
                  <SummaryProfile />
                )}
              </>
            )}
          </>
        )}
      </BodyFrame>
    </Protected>
  );
};
