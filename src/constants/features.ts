import {
  Lock,
  ShieldCheck,
  Cpu,
  KeyRound,
  FolderLock,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Lock,
    title: "End-to-end encryption",
    description:
      "Files are encrypted in your browser with AES-256-GCM before upload. The server only receives and stores opaque ciphertext it can't read.",
    tag: "AES-256-GCM",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    tagBg: "bg-blue-50 text-blue-800",
  },
  {
    icon: ShieldCheck,
    title: "Zero-knowledge architecture",
    description:
      "We have zero ability to decrypt your files. Your encryption key is derived from your password client-side and never transmitted or stored.",
    tag: "Zero-knowledge",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    tagBg: "bg-emerald-50 text-emerald-800",
  },
  {
    icon: Cpu,
    title: "Web Crypto API powered",
    description:
      "Uses the browser's native cryptographic engine — hardware-accelerated, audited, and built right into modern browsers. No third-party libs.",
    tag: "Web Crypto API",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    tagBg: "bg-amber-50 text-amber-800",
  },
  {
    icon: KeyRound,
    title: "JWT-secured sessions",
    description:
      "Every API request is authenticated with signed JWT tokens. Account isolation ensures one user can never access another's encrypted blobs.",
    tag: "JWT auth",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
    tagBg: "bg-violet-50 text-violet-800",
  },
  {
    icon: FolderLock,
    title: "Folder organization",
    description:
      "Organize files into logical folders. Encrypted filenames mean even folder structure metadata stays private. Quota tracked per account.",
    tag: "Quota + folders",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-700",
    tagBg: "bg-rose-50 text-rose-800",
  },
  {
    icon: Globe,
    title: "Secure HTTPS transit",
    description:
      "Encrypted ciphertext travels over TLS-secured connections. Even intercepted traffic is double-protected — first by TLS, then by your key.",
    tag: "TLS in transit",
    iconBg: "bg-green-50",
    iconColor: "text-green-700",
    tagBg: "bg-green-50 text-green-800",
  },
];
export default features;
