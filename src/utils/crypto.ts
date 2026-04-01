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
    true,
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


// export async function saveRMKForSession(rmk: CryptoKey) {
//   const rawRMK = await crypto.subtle.exportKey("raw", rmk);

//   const iv = crypto.getRandomValues(new Uint8Array(12));
//   const key = await crypto.subtle.importKey(
//     "raw",
//     window._sessionKey,
//     "AES-GCM",
//     true,
//     ["encrypt"]
//   );

//   const encrypted = await crypto.subtle.encrypt(
//     { name: "AES-GCM", iv },
//     key,
//     rawRMK
//   );

//   // Save encrypted RMK + IV in IndexedDB
//   await setItem("encryptedRMK", { data: Array.from(new Uint8Array(encrypted)), iv: Array.from(iv) });
// }

// export async function loadRMKFromSession(): Promise<CryptoKey | null> {
//   if (!window._sessionKey) return null; // sessionKey lost → need password

//   const stored = await getItem("encryptedRMK");
//   if (!stored) return null;

//   const encryptedRMK = new Uint8Array(stored.data);
//   const iv = new Uint8Array(stored.iv);

//   const key = await crypto.subtle.importKey(
//     "raw",
//     window._sessionKey,
//     "AES-GCM",
//     true,
//     ["decrypt"]
//   );

//   const decrypted = await crypto.subtle.decrypt(
//     { name: "AES-GCM", iv },
//     key,
//     encryptedRMK
//   );

//   return crypto.subtle.importKey(
//     "raw",
//     decrypted,
//     { name: "AES-GCM" },
//     false,
//     ["encrypt", "decrypt"]
//   );
// }

// ===============================
// SESSION MANAGEMENT
// ===============================

const SESSION_DB = "secure-session-db";
const SESSION_STORE = "session";
const SESSION_KEY_NAME = "sessionKey";
const SESSION_RMK_NAME = "sessionEncryptedRMK";

// -------------------------------
// IndexedDB helpers
// -------------------------------

async function openSessionDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(SESSION_DB, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(key: string, value: any) {
  const db = await openSessionDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readwrite");
    const store = tx.objectStore(SESSION_STORE);

    const req = store.put(value, key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<any> {
  const db = await openSessionDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readonly");
    const store = tx.objectStore(SESSION_STORE);

    const req = store.get(key);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ===============================
// SESSION KEY GENERATION
// ===============================

export function generateSessionKey(): Uint8Array {
  const key = webCrypto.getRandomValues(new Uint8Array(32));

  sessionStorage.setItem(
    SESSION_KEY_NAME,
    btoa(String.fromCharCode(...key))
  );

  return key;
}

export function getSessionKey(): Uint8Array | null {
  const stored = sessionStorage.getItem(SESSION_KEY_NAME);
  if (!stored) return null;

  const bytes = atob(stored)
    .split("")
    .map((c) => c.charCodeAt(0));

  return new Uint8Array(bytes);
}

// ===============================
// SAVE RMK FOR SESSION
// ===============================

export async function cacheRMKForSession(
  rmk: CryptoKey
): Promise<void> {
  const sessionKey = getSessionKey();
  if (!sessionKey) throw new Error("No session key");

  const rawRMK = await webCrypto.subtle.exportKey("raw", rmk);

  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await webCrypto.subtle.importKey(
    "raw",
    sessionKey,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const encrypted = await webCrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    rawRMK
  );

  await idbSet(SESSION_RMK_NAME, {
    encryptedRMK: new Uint8Array(encrypted),
    iv,
  });
}

// ===============================
// RESTORE RMK FROM SESSION
// ===============================

export async function restoreRMKFromSession(): Promise<CryptoKey | null> {
  const sessionKey = getSessionKey();
  if (!sessionKey) return null;

  const stored = await idbGet(SESSION_RMK_NAME);
  if (!stored) return null;

  const key = await webCrypto.subtle.importKey(
    "raw",
    sessionKey,
    "AES-GCM",
    false,
    ["decrypt"]
  );

  const decrypted = await webCrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(stored.iv),
    },
    key,
    new Uint8Array(stored.encryptedRMK)
  );

  return webCrypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}