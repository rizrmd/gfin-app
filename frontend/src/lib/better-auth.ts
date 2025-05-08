import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

type FetchOptions = {
  onRequest?: (ctx: any) => void;
  onSuccess?: (ctx: any) => void;
  onError?: (ctx: any) => void;
  onRetry?: (ctx: any) => void;
};

export type Session = typeof authClient.$Infer.Session;
export type User = Omit<
  (typeof authClient.$Infer.Session)["user"],
  "twoFactorEnabled"
>;

const authClient = createAuthClient({
  baseURL: `${location.protocol}//${location.host}`,
  plugins: [twoFactorClient()],
});

export const betterAuth = {
  homeUrl: (user: User) => {
    return "/dashboard";
  },
  signUp: async ({
    username,
    password,
    name,
    callbackURL = "/dashboard",
    image,
    fetchOptions,
  }: {
    username: string;
    password: string;
    name: string;
    callbackURL?: string;
    image?: string;
    fetchOptions?: FetchOptions;
  }) => {
    const { data, error } = await authClient.signUp.email({
      email: username,
      password,
      name,
      callbackURL,
      image,
      fetchOptions,
    });
    return { data, error };
  },
  signIn: async ({
    username,
    password,
    callbackURL = "/dashboard",
    rememberMe,
    fetchOptions,
  }: {
    username: string;
    password: string;
    callbackURL?: string;
    rememberMe?: boolean;
    fetchOptions?: FetchOptions;
  }) => {
    const { data, error } = await authClient.signIn.email(
      {
        email: username,
        password,
        callbackURL,
        rememberMe,
      },
      fetchOptions
    );
    return { data, error };
  },
  social: async ({
    provider,
    callbackURL = "/dashboard",
    errorCallbackURL = "/error",
    newUserCallbackURL = "/welcome",
    disableRedirect = false,
    idToken,
    loginHint,
    requestSignUp,
    scopes,
    fetchOptions,
  }: {
    provider:
      | "github"
      | "apple"
      | "discord"
      | "facebook"
      | "google"
      | "microsoft"
      | "spotify"
      | "twitch"
      | "twitter"
      | "dropbox"
      | "linkedin"
      | "gitlab"
      | "tiktok"
      | "reddit"
      | "roblox"
      | "vk"
      | "kick"
      | "zoom";
    callbackURL?: string;
    errorCallbackURL?: string;
    newUserCallbackURL?: string;
    disableRedirect?: boolean;
    idToken?: {
      token: string;
      refreshToken?: string | undefined;
      accessToken?: string | undefined;
      expiresAt?: number | undefined;
      nonce?: string | undefined;
    };
    loginHint?: string;
    requestSignUp?: boolean;
    scopes?: string[];
    fetchOptions?: FetchOptions;
  }) => {
    const { data, error } = await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL,
      newUserCallbackURL,
      disableRedirect,
      idToken,
      loginHint,
      requestSignUp,
      scopes,
      fetchOptions,
    });
    return { data, error };
  },
  signOut: async ({ fetchOptions }: { fetchOptions: FetchOptions }) => {
    const { data, error } = await authClient.signOut({
      fetchOptions,
    });
    return { data, error };
  },
  useSession: () => {
    return authClient.useSession;
  },
  getSession: async () => {
    const { data: session, error } = await authClient.getSession();
    return { session, error };
  },
  twoFactor: {
    enable: async ({
      password,
      issuer,
      fetchOptions,
    }: {
      password: string;
      issuer?: string;
      fetchOptions?: FetchOptions;
    }) => {
      const { data, error } = await authClient.twoFactor.enable({
        password,
        issuer,
        fetchOptions,
      });
      return { data, error };
    },
    disable: async ({
      password,
      fetchOptions,
    }: {
      password: string;
      fetchOptions?: FetchOptions;
    }) => {
      const { data, error } = await authClient.twoFactor.disable({
        password,
        fetchOptions,
      });
      return { data, error };
    },
    getTotpUri: async ({
      password,
      fetchOptions,
    }: {
      password: string;
      fetchOptions: FetchOptions;
    }) => {
      const { data, error } = await authClient.twoFactor.getTotpUri({
        password,
        fetchOptions,
      });
      return { data, error };
    },
    verifyTotp: async ({
      code,
      trustDevice = false,
      fetchOptions,
    }: {
      code: string;
      trustDevice?: boolean;
      fetchOptions?: FetchOptions;
    }) => {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code,
        trustDevice,
        fetchOptions,
      });
      return { data, error };
    },
    sendOtp: async ({
      trustDevice,
      fetchOptions,
    }: {
      trustDevice?: boolean;
      fetchOptions?: FetchOptions;
    }) => {
      const { data, error } = await authClient.twoFactor.sendOtp({
        //@ts-ignore
        trustDevice,
        fetchOptions,
      });
      return { data, error };
    },
    verifyOtp: async ({
      code,
      trustDevice,
      fetchOptions,
    }: {
      code: string;
      trustDevice?: boolean;
      fetchOptions?: FetchOptions;
    }) => {
      const { data, error } = await authClient.twoFactor.verifyOtp({
        code,
        trustDevice,
        fetchOptions,
      });
      return { data, error };
    },
  },
};
