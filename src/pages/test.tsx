import { useState } from "react";
import {
  deriveKEK,
  generateRMK,
  encryptRMK,
  decryptRMK,
  generateFileKey,
  encryptFileWithFK,
  wrapFileKey,
  unwrapFileKey,
  decryptFileWithFK,
} from "../utils/crypto";

export default function TestCryptoPage() {
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [encryptedFileData, setEncryptedFileData] = useState<any>(null);

  // ===============================
  // INIT USER
  // ===============================
  const initUser = async () => {
    console.log("=== INIT USER ===");
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const kek = await deriveKEK(password, salt);
    const rmk = await generateRMK();
    const { encryptedRMK, iv } = await encryptRMK(rmk, kek);
    setUserData({ salt, encryptedRMK, rmk_iv: iv });
    console.log("User initialized:", { salt, encryptedRMK, iv });
    alert("User initialized! 🔐");
  };

  // ===============================
  // HANDLE FILE UPLOAD (ENCRYPT)
  // ===============================
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData) return;

    console.log("=== UPLOAD START ===");
    const { salt, encryptedRMK, rmk_iv } = userData;
    const kek = await deriveKEK(password, salt);
    const rmk = await decryptRMK(encryptedRMK, kek, rmk_iv);
    const fileKey = await generateFileKey();

    const { encryptedData, iv } = await encryptFileWithFK(file, fileKey);
    const { encryptedFK, iv: fkIv } = await wrapFileKey(fileKey, rmk);

    setEncryptedFileData({
      encryptedData,
      file_iv: iv,
      encryptedFK,
      fk_iv: fkIv,
      fileName: file.name,
    });

    console.log("Encrypted file ready:", { encryptedData, file_iv: iv, encryptedFK, fk_iv: fkIv });
    alert("File encrypted successfully! 🔥");
  };

  // ===============================
  // HANDLE DECRYPTION
  // ===============================
  const handleDecrypt = async () => {
    if (!userData || !encryptedFileData) return;
    console.log("=== DECRYPT START ===");

    const { salt, encryptedRMK, rmk_iv } = userData;
    const kek = await deriveKEK(password, salt);
    const rmk = await decryptRMK(encryptedRMK, kek, rmk_iv);

    // unwrap the file key
    const fileKey = await unwrapFileKey(encryptedFileData.encryptedFK, rmk, encryptedFileData.fk_iv);

    // decrypt the file
    const decryptedBlob = await decryptFileWithFK(encryptedFileData.encryptedData, fileKey, encryptedFileData.file_iv);

    // trigger download
    const url = URL.createObjectURL(decryptedBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "decrypted_" + encryptedFileData.fileName;
    a.click();

    console.log("File decrypted successfully!");
    alert("File decrypted and downloaded successfully! 🔓");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>🔐 Crypto Test Page</h2>

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "10px", marginBottom: "10px", width: "300px" }}
      />
      <br />

      <button
        onClick={initUser}
        style={{
          marginBottom: "20px",
          color: "white",
          backgroundColor: "blue",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Init User (Generate RMK)
      </button>
      <br />

      <input type="file" onChange={handleUpload} />
      <br />

      <button
        onClick={handleDecrypt}
        style={{
          marginTop: "20px",
          color: "white",
          backgroundColor: "green",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Decrypt & Download File
      </button>
    </div>
  );
}
