const steps = [
  {
    number: "01",
    label: "You pick a file",
    description: "File stays in your browser's memory. Nothing is sent yet.",
  },
  {
    number: "02",
    label: "Key derived",
    description:
      "PBKDF2 derives your AES key from your password locally — never leaves your device.",
  },
  {
    number: "03",
    label: "Browser encrypts",
    description:
      "The Web Crypto API encrypts the file with AES-256-GCM using a random IV.",
  },
  {
    number: "04",
    label: "Ciphertext uploaded",
    description:
      "Only opaque encrypted bytes leave your device, transmitted over HTTPS.",
  },
  {
    number: "05",
    label: "Server stores blindly",
    description:
      "We write bytes to disk. We cannot read, decrypt, or access your content.",
  },
];

export default steps;