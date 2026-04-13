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
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
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
  const buffer = (
    encryptedRMK instanceof Uint8Array ? encryptedRMK.buffer : encryptedRMK
  ) as ArrayBuffer;
  const decrypted = await webCrypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
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
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
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
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
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
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
    rmk,
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

export async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function decryptPrivateKey(
  encryptedPrivateKey: Uint8Array,
  iv: Uint8Array,
  kek: CryptoKey,
): Promise<CryptoKey> {
  const decrypted = await webCrypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer, tagLength: 128 } as AesGcmParams,
    kek,
    encryptedPrivateKey,
  );

  return webCrypto.subtle.importKey(
    "pkcs8",
    decrypted,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
}

// Encrypt FK with public key

export async function encryptWithPublicKey(
  data: ArrayBuffer,
  publicKey: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data);
}

// Decrypt with private key

export async function decryptWithPrivateKey(
  encrypted: ArrayBuffer,
  privateKey: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encrypted);
}

export async function protectPrivateKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
  kek: CryptoKey,
): Promise<{
  publicKey: Uint8Array;
  encryptedPrivateKey: Uint8Array;
  privateKey_iv: Uint8Array;
}> {
  // export keys
  const rawPrivateKey = await webCrypto.subtle.exportKey("pkcs8", privateKey);
  const rawPublicKey = await webCrypto.subtle.exportKey("spki", publicKey);

  // IV for encryption
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // encrypt private key using KEK
  const encryptedPrivateKey = await webCrypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
    kek,
    rawPrivateKey,
  );

  return {
    publicKey: new Uint8Array(rawPublicKey),
    encryptedPrivateKey: new Uint8Array(encryptedPrivateKey),
    privateKey_iv: iv,
  };
}

// Sharing
export async function importPublicKey(
  rawPublicKey: Uint8Array,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    rawPublicKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
}

export async function encryptFKForUser(
  fileKey: CryptoKey,
  recipientPublicKey: CryptoKey,
): Promise<Uint8Array> {
  const rawFK = await crypto.subtle.exportKey("raw", fileKey);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    recipientPublicKey,
    rawFK,
  );

  return new Uint8Array(encrypted);
}

export async function decryptSharedFK(
  encryptedFK: Uint8Array,
  privateKey: CryptoKey,
): Promise<CryptoKey> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedFK,
  );

  return crypto.subtle.importKey("raw", decrypted, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

// ===============================
// STORE RSA KEYPAIR IN INDEXEDDB
// ===============================
export async function storeRSAKeys(
  publicKey: CryptoKey | Uint8Array,
  privateKey: CryptoKey,
): Promise<void> {
  // export private key to Uint8Array for storage
  const exportedPrivateKey = await webCrypto.subtle.exportKey(
    "pkcs8",
    privateKey,
  );
  const privateKeyUint8 = new Uint8Array(exportedPrivateKey);

  // store public key
  // if publicKey is CryptoKey, export to Uint8Array first
  let publicKeyUint8: Uint8Array;
  if ((publicKey as CryptoKey).type) {
    const exportedPublicKey = await webCrypto.subtle.exportKey(
      "spki",
      publicKey as CryptoKey,
    );
    publicKeyUint8 = new Uint8Array(exportedPublicKey);
  } else {
    publicKeyUint8 = publicKey as Uint8Array;
  }

  // store both in IndexedDB
  await idbSet("publicKey", publicKeyUint8);
  await idbSet("privateKey", privateKeyUint8);
}

// ===============================
// SESSION MANAGEMENT
// ===============================

const SESSION_DB = "secure-session-db";
const SESSION_STORE = "session";
const SESSION_KEY_NAME = "sessionKey";
const SESSION_RMK_NAME = "sessionEncryptedRMK";
const IDENTITY_CERT_NAME = "identityCertificate";
const IDENTITY_CERT_SIG_NAME = "identityCertificateSignature";
const IDENTITY_SIGN_PRIV_NAME = "identitySigningPrivateKey";
const IDENTITY_SIGN_IV_NAME = "identitySigningPrivateKeyIv";

type MiniCertificate = {
  certId: string;
  serialNumber: string;
  subject: { userId: string; email: string };
  issuer: string;
  signPublicKeySpkiB64: string;
  keyUsage: string[];
  sigAlg: string;
  notBefore: string;
  notAfter: string;
};

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

async function idbDelete(key: string): Promise<void> {
  const db = await openSessionDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SESSION_STORE, "readwrite");
    const store = tx.objectStore(SESSION_STORE);

    const req = store.delete(key);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ===============================
// SESSION KEY GENERATION (Dual storage)
// ===============================

export async function generateSessionKey(): Promise<Uint8Array> {
  const key = webCrypto.getRandomValues(new Uint8Array(32));
  const encoded = btoa(String.fromCharCode(...key));

  // store in sessionStorage
  sessionStorage.setItem(SESSION_KEY_NAME, encoded);

  // store in IndexedDB
  await idbSet(SESSION_KEY_NAME, encoded);

  return key;
}

export async function getSessionKey(): Promise<Uint8Array | null> {
  // try sessionStorage first
  let stored = sessionStorage.getItem(SESSION_KEY_NAME);

  // fallback to IndexedDB
  if (!stored) {
    stored = await idbGet(SESSION_KEY_NAME);
    if (stored) {
      // restore to sessionStorage for faster access next time
      sessionStorage.setItem(SESSION_KEY_NAME, stored);
    }
  }

  if (!stored) return null;

  const bytes = atob(stored)
    .split("")
    .map((c) => c.charCodeAt(0));

  return new Uint8Array(bytes);
}

// ===============================
// SAVE RMK FOR SESSION (Dual storage)
// ===============================

export async function cacheRMKForSession(rmk: CryptoKey): Promise<void> {
  const sessionKey = await getSessionKey();
  if (!sessionKey) throw new Error("No session key");

  const rawRMK = await webCrypto.subtle.exportKey("raw", rmk);

  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const key = await webCrypto.subtle.importKey(
    "raw",
    sessionKey,
    "AES-GCM",
    false,
    ["encrypt"],
  );

  const encrypted = await webCrypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    rawRMK,
  );

  const payload = {
    encryptedRMK: new Uint8Array(encrypted),
    iv,
  };

  // store in IndexedDB
  await idbSet(SESSION_RMK_NAME, payload);

  // also store in sessionStorage as base64 JSON
  const base64Payload = {
    encryptedRMK: btoa(String.fromCharCode(...payload.encryptedRMK)),
    iv: btoa(String.fromCharCode(...payload.iv)),
  };
  sessionStorage.setItem(SESSION_RMK_NAME, JSON.stringify(base64Payload));
}

// ===============================
// RESTORE RMK FROM SESSION (Dual storage)
// ===============================

export async function restoreRMKFromSession(): Promise<CryptoKey | null> {
  const sessionKey = await getSessionKey();
  if (!sessionKey) return null;

  let stored = null;

  // first try sessionStorage
  const sessionData = sessionStorage.getItem(SESSION_RMK_NAME);
  if (sessionData) {
    const parsed = JSON.parse(sessionData);
    stored = {
      encryptedRMK: Uint8Array.from(atob(parsed.encryptedRMK), (c) =>
        c.charCodeAt(0),
      ),
      iv: Uint8Array.from(atob(parsed.iv), (c) => c.charCodeAt(0)),
    };
  } else {
    // fallback to IndexedDB
    const idbData = await idbGet(SESSION_RMK_NAME);
    if (!idbData) return null;
    stored = idbData;

    // restore to sessionStorage for faster future access
    const base64Payload = {
      encryptedRMK: btoa(String.fromCharCode(...stored.encryptedRMK)),
      iv: btoa(String.fromCharCode(...stored.iv)),
    };
    sessionStorage.setItem(SESSION_RMK_NAME, JSON.stringify(base64Payload));
  }

  const key = await webCrypto.subtle.importKey(
    "raw",
    sessionKey,
    "AES-GCM",
    false,
    ["decrypt"],
  );

  const decrypted = await webCrypto.subtle.decrypt(
    { name: "AES-GCM", iv: stored.iv },
    key,
    stored.encryptedRMK,
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
// CLEAR SESSION (Optional logout helper)
// ===============================

export async function clearSession(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY_NAME);
  sessionStorage.removeItem(SESSION_RMK_NAME);
  const db = await openSessionDB();
  const tx = db.transaction(SESSION_STORE, "readwrite");
  const store = tx.objectStore(SESSION_STORE);
  store.clear();
}

export async function clearSessionTotaly(): Promise<void> {
  // clear sessionStorage
  sessionStorage.removeItem(SESSION_KEY_NAME);
  sessionStorage.removeItem(SESSION_RMK_NAME);

  // Keep identity auth material so certificate-based login can continue working
  // across signed-out sessions. Remove only ephemeral/session secrets.
  await Promise.all([
    idbDelete(SESSION_KEY_NAME),
    idbDelete(SESSION_RMK_NAME),
    idbDelete("publicKey"),
    idbDelete("privateKey"),
  ]);
}

export async function generateIdentitySigningKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"],
  );
}

export async function exportPublicKeySpki(
  publicKey: CryptoKey,
): Promise<Uint8Array> {
  const raw = await webCrypto.subtle.exportKey("spki", publicKey);
  return new Uint8Array(raw);
}

export async function protectSigningPrivateKey(
  privateKey: CryptoKey,
  kek: CryptoKey,
): Promise<{ encryptedPrivateKey: Uint8Array; iv: Uint8Array }> {
  const rawPrivateKey = await webCrypto.subtle.exportKey("pkcs8", privateKey);
  const iv = webCrypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedPrivateKey = await webCrypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv.buffer,
      tagLength: 128,
    } as AesGcmParams,
    kek,
    rawPrivateKey,
  );

  return {
    encryptedPrivateKey: new Uint8Array(encryptedPrivateKey),
    iv,
  };
}

export async function decryptSigningPrivateKey(
  encryptedPrivateKey: Uint8Array,
  iv: Uint8Array,
  kek: CryptoKey,
): Promise<CryptoKey> {
  const decrypted = await webCrypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer, tagLength: 128 } as AesGcmParams,
    kek,
    encryptedPrivateKey,
  );

  return webCrypto.subtle.importKey(
    "pkcs8",
    decrypted,
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign"],
  );
}

export function buildAuthChallengePayload(input: {
  challengeId: string;
  nonceB64: string;
  userId: string;
  email: string;
  clientTimestamp: string;
  aud?: string;
  purpose?: string;
}): string {
  const payload = {
    challengeId: input.challengeId,
    nonceB64: input.nonceB64,
    userId: input.userId,
    email: input.email,
    clientTimestamp: input.clientTimestamp,
    aud: input.aud || "stockage-api",
    purpose: input.purpose || "auth-login-proof",
  };

  return JSON.stringify(payload);
}

export async function signAuthChallengePayload(
  payload: string,
  signingPrivateKey: CryptoKey,
): Promise<Uint8Array> {
  const signature = await webCrypto.subtle.sign(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    signingPrivateKey,
    enc.encode(payload),
  );

  return new Uint8Array(signature);
}

export async function importIdentityPublicKey(
  rawPublicKey: Uint8Array,
): Promise<CryptoKey> {
  return webCrypto.subtle.importKey(
    "spki",
    rawPublicKey,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["verify"],
  );
}

export function isMiniCertificateCurrentlyValid(
  certificate?: MiniCertificate | null,
): boolean {
  if (!certificate) return false;
  const now = Date.now();
  const notBefore = new Date(certificate.notBefore).getTime();
  const notAfter = new Date(certificate.notAfter).getTime();
  return (
    Number.isFinite(notBefore) &&
    Number.isFinite(notAfter) &&
    now >= notBefore &&
    now <= notAfter
  );
}

export async function storeIdentityAuthMaterial(input: {
  certificate: MiniCertificate;
  caSignatureB64: string;
  encryptedSigningPrivateKey: Uint8Array;
  signingPrivateKeyIv: Uint8Array;
}): Promise<void> {
  await idbSet(IDENTITY_CERT_NAME, input.certificate);
  await idbSet(IDENTITY_CERT_SIG_NAME, input.caSignatureB64);
  await idbSet(IDENTITY_SIGN_PRIV_NAME, input.encryptedSigningPrivateKey);
  await idbSet(IDENTITY_SIGN_IV_NAME, input.signingPrivateKeyIv);
}

export async function getIdentityAuthMaterial(): Promise<{
  certificate: MiniCertificate;
  caSignatureB64: string;
  encryptedSigningPrivateKey: Uint8Array;
  signingPrivateKeyIv: Uint8Array;
} | null> {
  const certificate = await idbGet(IDENTITY_CERT_NAME);
  const caSignatureB64 = await idbGet(IDENTITY_CERT_SIG_NAME);
  const encryptedSigningPrivateKey = await idbGet(IDENTITY_SIGN_PRIV_NAME);
  const signingPrivateKeyIv = await idbGet(IDENTITY_SIGN_IV_NAME);

  if (
    !certificate ||
    !caSignatureB64 ||
    !encryptedSigningPrivateKey ||
    !signingPrivateKeyIv
  ) {
    return null;
  }

  return {
    certificate,
    caSignatureB64,
    encryptedSigningPrivateKey,
    signingPrivateKeyIv,
  };
}
