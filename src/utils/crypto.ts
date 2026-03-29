// ===============================
// CONFIG
// ===============================
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

const enc = new TextEncoder();
const webCrypto: Crypto = globalThis.crypto;

// ===============================
// STEP 1: DERIVE KEK
// ===============================
export async function deriveKEK(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const baseKey = await webCrypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  return webCrypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
}

// ===============================
// STEP 2: GENERATE RMK
// ===============================
export async function generateRMK(): Promise<CryptoKey> {
  return webCrypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"],
  );
}

// ===============================
// STEP 3: ENCRYPT RMK
// ===============================
export async function encryptRMK(
  rmk: CryptoKey,
  kek: CryptoKey,
): Promise<{ encryptedRMK: Uint8Array; iv: Uint8Array }> {
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const rawRMK = await webCrypto.subtle.exportKey("raw", rmk);

  const encrypted = await webCrypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    kek,
    rawRMK,
  );

  return {
    encryptedRMK: new Uint8Array(encrypted),
    iv,
  };
}

// ===============================
// STEP 4: DECRYPT RMK
// ===============================
export async function decryptRMK(
  encryptedRMK: ArrayBuffer | Uint8Array,
  kek: CryptoKey,
  iv: Uint8Array,
): Promise<CryptoKey> {
  const buffer =
    encryptedRMK instanceof Uint8Array ? encryptedRMK.buffer : encryptedRMK;

  const decrypted = await webCrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    kek,
    buffer,
  );

  return webCrypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

// ===============================
// STEP 5: GENERATE FILE KEY
// ===============================
export async function generateFileKey(): Promise<CryptoKey> {
  return webCrypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
}

// ===============================
// STEP 6: ENCRYPT FILE
// ===============================
export async function encryptFileWithFK(
  file: File,
  fileKey: CryptoKey,
): Promise<{ encryptedData: Uint8Array; iv: Uint8Array }> {
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const buffer = await file.arrayBuffer();

  const encrypted = await webCrypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    fileKey,
    buffer,
  );

  return {
    encryptedData: new Uint8Array(encrypted),
    iv,
  };
}

// ===============================
// STEP 7: WRAP FILE KEY
// ===============================
export async function wrapFileKey(
  fileKey: CryptoKey,
  rmk: CryptoKey,
): Promise<{ encryptedFK: Uint8Array; iv: Uint8Array }> {
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const rawFK = await webCrypto.subtle.exportKey("raw", fileKey);

  const encrypted = await webCrypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    rmk,
    rawFK,
  );

  return {
    encryptedFK: new Uint8Array(encrypted),
    iv,
  };
}

// ===============================
// STEP 8: UNWRAP FILE KEY
// ===============================
export async function unwrapFileKey(
  encryptedFK: ArrayBuffer | Uint8Array,
  rmk: CryptoKey,
  iv: Uint8Array,
): Promise<CryptoKey> {
  const buffer =
    encryptedFK instanceof Uint8Array ? encryptedFK.buffer : encryptedFK;

  const decrypted = await webCrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    rmk,
    buffer,
  );

  return webCrypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

// ===============================
// STEP 9: DECRYPT FILE
// ===============================
export async function decryptFileWithFK(
  encryptedData: ArrayBuffer | Uint8Array,
  fileKey: CryptoKey,
  iv: Uint8Array,
): Promise<Blob> {
  const buffer =
    encryptedData instanceof Uint8Array ? encryptedData.buffer : encryptedData;

  const decrypted = await webCrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    fileKey,
    buffer,
  );

  return new Blob([decrypted]);
}

// ===============================
// STEP 10: CHANGE PASSWORD
// ===============================
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  userSalt: Uint8Array,
  encryptedRMK: ArrayBuffer | Uint8Array,
  rmk_iv: Uint8Array,
): Promise<{ encryptedRMK: Uint8Array; rmk_iv: Uint8Array }> {
  const oldKEK = await deriveKEK(oldPassword, userSalt);
  const rmk = await decryptRMK(encryptedRMK, oldKEK, rmk_iv);
  const newKEK = await deriveKEK(newPassword, userSalt);

  const { encryptedRMK: newEncryptedRMK, iv } = await encryptRMK(rmk, newKEK);

  return {
    encryptedRMK: newEncryptedRMK,
    rmk_iv: iv,
  };
}
