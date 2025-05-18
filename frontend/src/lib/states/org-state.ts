import { proxy } from "valtio";

export const orgState = {
  write: proxy({
    id: "",
    id_client: "",
    name: "",
    data: {},
    questions: {},
    onboard: { profile: false, org: false },
    isLoading: false,
    error: null
  }),
  reset() {
    this.write.id = "";
    this.write.id_client = "";
    this.write.name = "";
    this.write.data = {};
    this.write.questions = {};
    this.write.onboard = { profile: false, org: false };
    this.write.isLoading = false;
    this.write.error = null;
  },
  setLoading(loading: boolean) {
    this.write.isLoading = loading;
  },
  setError(error: string | null) {
    this.write.error = error;
  }
};
