import { v7 } from "uuid";

export const DeviceStore = {
  async getOrCreateDeviceId() {
    return new Promise<string>((resolve) => {
      try {
        const request = indexedDB.open("device", 1);

        request.onerror = () => {
          // Fallback to localStorage if indexedDB fails
          let deviceId = localStorage.getItem("deviceId");
          if (!deviceId) {
            deviceId = v7();
            localStorage.setItem("deviceId", deviceId);
          }
          resolve(deviceId);
        };

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          db.createObjectStore("settings");
        };

        request.onsuccess = async (event: Event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const tx = db.transaction("settings", "readwrite");
          const store = tx.objectStore("settings");

          try {
            // Try to get existing deviceId
            const getRequest = store.get("deviceId");

            getRequest.onsuccess = () => {
              let deviceId = getRequest.result;

              if (!deviceId) {
                deviceId = v7();
                store.put(deviceId, "deviceId");
              }

              resolve(deviceId);
            };

            getRequest.onerror = () => {
              // Fallback to localStorage if getting/setting fails
              let deviceId = localStorage.getItem("deviceId");
              if (!deviceId) {
                deviceId = v7();
                localStorage.setItem("deviceId", deviceId);
              }
              resolve(deviceId);
            };
          } catch (error) {
            // Fallback to localStorage if transaction fails
            let deviceId = localStorage.getItem("deviceId");
            if (!deviceId) {
              deviceId = v7();
              localStorage.setItem("deviceId", deviceId);
            }
            resolve(deviceId);
          }
        };
      } catch (error) {
        // Fallback to localStorage if opening IndexedDB fails
        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
          deviceId = v7();
          localStorage.setItem("deviceId", deviceId);
        }
        resolve(deviceId);
      }
    });
  },
};
