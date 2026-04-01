export default function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

export function base64ToUint8Array(input: unknown): Uint8Array {
  if (!input) {
    throw new Error("Base64 string is empty or undefined");
  }

  // Handle Buffer-like object from Mongoose: { type: 'Buffer', data: [...] }
  if (typeof input === 'object' && 'data' in input && Array.isArray((input).data)) {
    return new Uint8Array((input).data);
  }

  // Handle Uint8Array passed directly
  if (input instanceof Uint8Array) return input;

  // Ensure it's a string at this point
  if (typeof input !== 'string') {
    throw new Error(`Expected base64 string, got: ${typeof input}`);
  }

  let base64 = input.replace(/\s/g, '');
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Convert base64 to Uint8Array with standard ArrayBuffer
export function base64ToUint8ArrayForBlob(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/\s/g, '')); // remove spaces/newlines
  const len = binaryString.length;
  const bytes = new Uint8Array(len); // standard Uint8Array backed by ArrayBuffer
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
