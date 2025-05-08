type ApiStatus = "init" | "loading" | "done" | "error";

export const apiClient = <R extends any, T extends any[] = []>(bind: {
  url: string;
  sampleData: (...args: T) => R;
}) => {
  const { url, sampleData } = bind;
  let current_controller: AbortController | null = null;

  return {
    call: async (...args: T) => {
      // Abort previous request if exists
      if (current_controller) {
        current_controller.abort();
      }

      // Create new controller for this request
      current_controller = new AbortController();

      let final_url = url;
      if (url.startsWith("api/")) {
        final_url = `/${url}`;
      }

      try {
        const res = await fetch(final_url, {
          body: JSON.stringify(args),
          method: "POST",
          signal: current_controller.signal,
        });

        if (res.headers.get("content-type") === "application/json") {
          const result = await res.json();
          if (result.__error) {
            throw new Error(result.__error);
          }
          return result;
        }
        return sampleData(...args);
      } finally {
        current_controller = null;
      }
    },
  };
};

export const apiResult = <R extends any, T extends any[] = []>(
  api: {
    call: (...args: T) => Promise<R>;
  },
  opt?: {
    onResult?: (result: {
      status: "error" | "done";
      error: string;
      value?: R;
    }) => void;
  },
) => {
  const result = {
    _bind: null,
    status: "init",
    error: "",
    result: null as R,
    data: null as R,
    async call(...args: T) {
      const [key, local] = (this as any)._bind as [
        string,
        { set: (fn: (data: any) => void) => void },
      ];

      local.set((data) => {
        data[key].error = "";
        data[key].status = "loading";
      });

      try {
        const result = await api.call(...args);

        local.set((data) => {
          data[key].status = "done";
          data[key].result = result;
          data[key].data = result;
        });

        if (opt?.onResult) {
          opt.onResult({ value: result, status: "done", error: "" });
        }

        return result;
      } catch (err: any) {
        console.error(err)
        local.set((data) => {
          data[key].status = "error";
          data[key].error = err?.message || "Error";
        });

        if (opt?.onResult) {
          opt.onResult({ error: err?.message || "Error", status: "error" });
        }
      }
    },
  } as {
    error: string;
    status: ApiStatus;
    result: Awaited<R>;
    data: Awaited<R>;
    call: (typeof api)["call"];
  };

  return result;
};
