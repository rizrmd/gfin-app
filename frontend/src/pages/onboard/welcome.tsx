import { Button } from "@/components/ui/button";
import { api } from "@/lib/gen/api";
import { Protected } from "@/lib/user";
import { useSnapshot } from "valtio";

export default () => {
  return (
    <Protected>
      Hello welcome.tsx
      <Button
        onClick={async () => {
          const client_id = localStorage.getItem("client_id");
          if (client_id) {
            // const res = await api.session({ client_id });

            // if (res) {
            //   await agent.sync.init({
            //     client_id,
            //     entry: {
            //       name: res.profile.orgName as string,
            //       state: res.profile.state as string,
            //     },
            //     final: {},
            //   });

            //   await agent.do_task("search_by_name_state");
            // }
          }
        }}
      >
        Trigger search organization profile
      </Button>
    </Protected>
  );
};
