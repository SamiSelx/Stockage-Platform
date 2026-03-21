const algorithms: Algorithm[] = [
  {
    name: "AES-256-GCM",
    subtitle: "Symmetric encryption",
    description:
      "Authenticated encryption for file contents. GCM mode appends an authentication tag — tampered ciphertext is detected and rejected before decryption.",
    strength: 5,
    detail: "256-bit key · 96-bit IV · 128-bit auth tag",
  },
  {
    name: "PBKDF2",
    subtitle: "Key derivation",
    description:
      "Derives your AES key from your password using 100,000 iterations with SHA-256. Makes brute-forcing computationally infeasible even with modern hardware.",
    strength: 4,
    detail: "100k iterations · SHA-256 · unique salt",
  },
  {
    name: "Random IV",
    subtitle: "Initialization vector",
    description:
      "A fresh cryptographically random 96-bit IV is generated for every file encryption. Encrypting the same file twice always produces different ciphertext.",
    strength: 4,
    detail: "96-bit · per-file · crypto.getRandomValues()",
  },
  {
    name: "Random Salt",
    subtitle: "PBKDF2 salt",
    description:
      "Key derivation uses a unique cryptographic salt per user, preventing precomputed rainbow table attacks from working across multiple accounts.",
    strength: 3,
    detail: "128-bit · per-user · stored separately",
  },
];

export default algorithms;