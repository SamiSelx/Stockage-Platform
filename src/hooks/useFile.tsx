import { useUploadFileMutation } from "@/app/backend/endpoints/file";
import uint8ToBase64, { base64ToUint8Array } from "@/utils/convertBase64";
import {
  decryptFileWithFK,
  encryptFileWithFK,
  generateFileKey,
  restoreRMKFromSession,
  unwrapFileKey,
  wrapFileKey,
} from "@/utils/crypto";
import { toast } from "sonner";
import useUser from "./useUser";
import { apiUrl } from "@/app/backend";
import { useLocation, useParams } from "react-router";
import { useEffect, useState } from "react";

export default function useFile() {
  const [uploadFile] = useUploadFileMutation();
  const { user } = useUser();
  const params = useParams();
  const location = useLocation();
  const [folderId, setFolderId] = useState<string | undefined>(params.folderId);

  useEffect(()=>{
    setFolderId(params.folderId)
  },[folderId, location.pathname])

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    // folderId?: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const rmk = await restoreRMKFromSession();
    if (rmk) {
      const fileKey = await generateFileKey();

      const { encryptedData, iv } = await encryptFileWithFK(file, fileKey);
      const { encryptedFK, iv: fkIv } = await wrapFileKey(fileKey, rmk);
      const uploadData: UploadFileI = {
        encryptedData: uint8ToBase64(encryptedData),
        file_iv: uint8ToBase64(iv),
        encryptedFK: uint8ToBase64(encryptedFK),
        fk_iv: uint8ToBase64(fkIv),
        originalName: file.name,
        mimetype: file.type,
        size: file.size,
      };

      //for now
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([encryptedData as unknown as Uint8Array<ArrayBuffer>]),
        uploadData.originalName,
      );
      formData.append("encryptedFK", uploadData.encryptedFK);
      formData.append("file_iv", uploadData.file_iv);
      formData.append("fk_iv", uploadData.fk_iv);
      formData.append("mimetype", uploadData.mimetype);
      formData.append("size", uploadData.size.toString());
      formData.append("originalName", uploadData.originalName);
      formData.append("folderId", folderId || "");

      uploadFile(formData)
        .unwrap()
        .then((res) => {
          console.log("=== UPLOAD SUCCESS ===", res);
          toast.success("Fichier uploadé avec succès");
        })
        .catch((err) => {
          console.error("=== UPLOAD ERROR ===", err);
          toast.error(err.data.message || "Impossible d'uploader le fichier");
        });
    } else {
      toast.error("Clé de chiffrement introuvable. Veuillez vous reconnecter.");
    }
    return null;
  };

  async function handleDownload(file?: FileI) {
    if (!file) return;
    fetch(apiUrl + "/file/download/" + file.id, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(async (res) => {
        const fileData = await res.arrayBuffer();

        const rmk = await restoreRMKFromSession();
        if (!rmk)
          throw new Error("Please log in again.");

        // unwrap the file key
        const fileKey = await unwrapFileKey(
          base64ToUint8Array(file.encryptedFK),
          rmk,
          base64ToUint8Array(file.fk_iv),
        );

        // decrypt the file
        const decryptedBlob = await decryptFileWithFK(
          new Uint8Array(fileData),
          fileKey,
          base64ToUint8Array(file.file_iv),
        );

        // trigger download
        const url = URL.createObjectURL(decryptedBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          "decrypted_" + file.filename + "." + file.mimetype.split("/")[1];
        a.click();

        toast.success("Fichier téléchargé avec succès");
      })
      .catch((err) => {
        toast.error(err.data.message || "Impossible de télécharger le fichier");
      });
  }

  return {
    handleUpload,
    handleDownload,
  };
}
