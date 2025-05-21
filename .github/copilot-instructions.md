All file should be in kebab-case. We use bun latest version. in frontend we use shadcn and tailwind with our own router library. do not use useState, use this instead:

```
import { useLocal } from "@/lib/hooks/use-local";
const local = useLocal({data: []}, async () => {
    // async init function.
    local.data = ['loaded'];
    local.render();
})
```

useLocal can only be used in one component, when you need to share state between component, you should use valtio instead of useLocal. to use valtio, first create a valtio state file like this:

```
import { proxy } from "valtio";
export const state = {
  write: proxy({
    data: "hello"
  }),
  reset() {
    this.write.data = "hello";
  }
}
```

and after that, you can import it to your component:

```
import { state } from './your-state'
import { useSnapshot } from "valtio";

export default () => {
  const read = useSnapshot(state.write);

  return <input type="text" value={read.data} onChange={(e) => {
    write.data = e.currentTarget.value;
  }}>
}
```

always use two word for valtio state e.g bookWrite, bookRead.

In server we already setup prisma client in global db variable, just use it.

To deal with database CRUD operations such as fetching, inserting, updating, and deleting data, we are using API in folder backend/src/api. Under the hood, we are using prisma for this. For example, in backend/src/api/auth.esensi/user.ts, we are fetching a data from table auth_user filtered by his/her username. This is the example:

```
import { defineAPI } from "rlib/server";
export default defineAPI({
  name: "auth_user",
  url: "/api/auth/user",
  async handler(arg: { username: string }) {
    const res = await db.auth_user.findFirst({
      where: {
        OR: [
          {email: arg.username},
          {username: arg.username,}
        ],
      },
    });
    return res;
  },
});

```
Do not use fetch on frontend, use api instead like this instead:

```
import { api } from "@/lib/gen/auth.esensi";
const res = await api.auth_user({ username: username! });
```

If you import a type, not a variable, then it must be imported using a type-only import when 'verbatimModuleSyntax' is enabled. For example:

This is wrong
```
import { User } from "better-auth/types";
```

This is correct
```
import type { User } from "better-auth/types";
```

If you need to create form, use this example:

```
import { EForm } from "@/components/ext/eform/form";
 <EForm
    data={{ username: username || "", password: "", loading: false }}
    onSubmit={async ({ write, read }) => {
    }}
    className="space-y-4"
  >
    {({ Field, read }) => {
      return (
        <>
          <Field
            name="username"
            disabled={read.loading}
            label="Email"
          />
          <Field
            name="password"
            disabled={read.loading}
            label="Password"
            input={{ type: "password" }}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={read.loading}
          >
            {read.loading ? "Loading..." : "Sign In"}
          </Button>
        </>
      );
    }}
  </EForm>