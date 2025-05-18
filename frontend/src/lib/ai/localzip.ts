import { gunzipSync, gzipSync } from "fflate";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const localzip = {
  get: (key: string) => {
    const msgs = localStorage.getItem(key);
    if (msgs !== null) {
      const retrievedCompressedDataU8A = base64ToUint8Array(msgs);
      const retrievedOriginalDataU8A = gunzipSync(retrievedCompressedDataU8A);
      const retrievedJsonString = decoder.decode(retrievedOriginalDataU8A);
      return JSON.parse(retrievedJsonString);
    }
    return null;
  },
  set: (key: string, value: any) => {
    const originalJsonString = JSON.stringify(value);
    const originalDataU8A = encoder.encode(originalJsonString);
    const compressedDataU8A = gzipSync(originalDataU8A);
    const base64StringForStorage = uint8ArrayToBase64(compressedDataU8A);

    localStorage.setItem(key, base64StringForStorage);
  },
};

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.length;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a Base64 string to a Uint8Array.
 * @param base64 The Base64 string to decode.
 * @returns The decoded Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}
