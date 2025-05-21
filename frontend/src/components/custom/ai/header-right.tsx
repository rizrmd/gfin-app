import { useAI } from "@/lib/ai/use-ai";
import { NavUser } from "../auth/nav-user";

export const HeaderRight = () => {
  return (
    <>
      <NavUser />
      {/* <Button
        variant={"secondary"}
        onClick={async () => {
          if (
            (await Alert.confirm("Are you sure you want to reset?")).confirm
          ) {
            localStorage.removeItem("gfin-ai-qa-msgs");
            localStorage.removeItem("gfin-ai-qa-user");
            await api.ai_onboard({
              mode: "update",
              id: user.organization.id!,
              onboard: { qa: false, profile: false },
              questions: {},
            });
            location.reload();
          }
        }}
      >
        Reset
      </Button> */}
    </>
  );
};
