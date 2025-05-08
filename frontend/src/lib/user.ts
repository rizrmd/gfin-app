import { apiClient } from "./api";
import { DeviceStore } from "./device";

class User {
  private static instance: User;
  status: "active" | "loading" | "logged-out" = "loading";
  name: string = "";
  token: string = "";
  id_staff: string = "";
  id_staff_role: string = "";
  role: string = "";
  email: string = "";
  display_name: string = "";
  id: string = "";
  id_client: string = "";
  device_id: string = "";

  constructor() {
    if (User.instance) {
      return User.instance;
    }
    User.instance = this;
  }

  async logout() {
    const api_logout = apiClient({
      url: "api/auth/logout",
      sampleData: async (device_id: string, token: string) => {
        if (!device_id || !token) {
          throw new Error("device_id and token is required");
        }
        return true;
      },
    });

    try {
      await api_logout.call(this.device_id, this.token);
    } catch (e) {
      console.error(e);
    } finally {
      this.status = "logged-out";
      this.name = "";
      this.token = "";
      this.id = "";
      this.id_client = "";
    }
  }

  async reload() {
    this.device_id = await DeviceStore.getOrCreateDeviceId();
    const api_check = apiClient({
      url: "api/auth/reload",
      sampleData: async (device_id: string) => {
        if (!device_id) {
          throw new Error("device_id is required");
        }
        return {
          status: "active" as "active" | "logged-out",
          name: "Sample User",
          email: "sample-email",
          display_name: "Sample User",
          token: "sample-token",
          role: "Admin",
          id: "sample-id",
          id_staff: "sample-id-staff",
          id_staff_role: "sample-id-staff-role",
          id_client: "sample-id-client",
        };
      },
    });

    try {
      const result = await api_check.call(this.device_id);
      this.status = result.status;
      this.name = result.name;
      this.email = result.email;
      this.display_name = result.display_name;
      this.token = result.token;
      this.role = result.role;
      this.id = result.id;
      this.id_staff = result.id_staff;
      this.id_staff_role = result.id_staff_role;
      this.id_client = result.id_client;
    } catch (e) {
      this.status = "logged-out";
      this.name = "";
      this.email = "";
      this.display_name = "";
      this.token = "";
      this.role = "";
      this.id = "";
      this.id_staff = "";
      this.id_staff_role = "";
      this.id_client = "";
    }
  }
}

export const user = new User();
