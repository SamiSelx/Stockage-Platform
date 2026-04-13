import {
  useUploadFileMutation,
  useUploadMultipleFilesMutation,
} from "@/app/backend/endpoints/file";
import uint8ToBase64, { base64ToUint8Array } from "@/utils/convertBase64";
import {
  decryptFileWithFK,
  decryptFKWithPrivateKey,
  encryptFileWithFK,
  generateFileKey,
  getPrivateKeyFromDB,
  restoreRMKFromSession,
  unwrapFileKey,
  wrapFileKey,
} from "@/utils/crypto";
import { toast } from "sonner";
import useUser from "./useUser";
import { apiUrl } from "@/app/backend";
import { useLocation, useParams } from "react-router";
import { useEffect, useState } from "react";
import type { FolderNode } from "@/utils/builderFolderTree";
import { useCreateFolderMutation } from "@/app/backend/endpoints/folder";

export default function useFile() {
  const [createFolder] = useCreateFolderMutation();
  const [uploadFile] = useUploadFileMutation();
  const [uploadMultipleFiles] = useUploadMultipleFilesMutation();
  const { user } = useUser();
  const params = useParams();
  const location = useLocation();
  const [folderId, setFolderId] = useState<string | undefined>(params.folderId);

  useEffect(() => {
    setFolderId(params.folderId);
  }, [folderId, location.pathname]);

  const handleUpload = async (
    files?: File | FileList | File[],
    folderIdOverride?: string,
    // e: React.ChangeEvent<HTMLInputElement>,
    // folderId?: string,
  ) => {
    const filesToUpload = !files
      ? []
      : files instanceof File
        ? [files]
        : Array.from(files);

    if (!filesToUpload.length || !user) return;
    const rmk = await restoreRMKFromSession();
    if (rmk) {
      const formData = new FormData();
      for (const file of filesToUpload) {
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

        formData.append(
          "file",
          new Blob([encryptedData as unknown as Uint8Array<ArrayBuffer>], {
            type: file.type || "application/octet-stream",
          }),
          uploadData.originalName,
        );
        formData.append("encryptedFK", uploadData.encryptedFK);
        formData.append("file_iv", uploadData.file_iv);
        formData.append("fk_iv", uploadData.fk_iv);
        formData.append("mimetype", uploadData.mimetype);
        formData.append("size", uploadData.size.toString());
        formData.append("originalName", uploadData.originalName);
      }
      // formData.append("folderId", folderId || "");
      formData.append("folderId", folderIdOverride ?? folderId ?? "");

      const uploadMutation =
        filesToUpload.length > 1 ? uploadMultipleFiles : uploadFile;

      uploadMutation(formData)
        .unwrap()
        .then((res) => {
          console.log("=== UPLOAD SUCCESS ===", res);
          toast.success(
            filesToUpload.length > 1
              ? `${filesToUpload.length} fichiers uploadés avec succès`
              : "Fichier uploadé avec succès",
          );
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

  const handleFolderUpload = async (
    node: FolderNode,
    parentFolderId?: string,
  ) => {
    try {
      const rmk = await restoreRMKFromSession();
      if (!rmk || !user) return;

      // 1. Create this folder in the backend
      const { data: folder } = await createFolder({
        name: node.name,
        parentFolder: parentFolderId ?? folderId ?? undefined,
      }).unwrap();

      // 2. Upload all files directly inside this folder
      if (node.files.length > 0) {
        await handleUpload(node.files, folder?.id); // pass folderId override
      }

      // 3. Recurse into subfolders
      for (const child of node.children) {
        await handleFolderUpload(child, folder?.id);
      }
    } catch (err: unknown) {
      toast.error(
        (err as { data?: { message?: string } }).data?.message ||
          "Impossible d'uploader le dossier",
      );
    }
  };

  async function handleDownload(file?: FileI, shared = false) {
    if (!file) return;

    try {
      const res = await fetch(apiUrl + "/file/download/" + file.id, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const fileData = await res.arrayBuffer();

      let fileKey: CryptoKey;

      if (shared) {
        const privateKey = await getPrivateKeyFromDB();
        if (!privateKey) throw new Error("Private key not found");

        fileKey = await decryptFKWithPrivateKey(
          base64ToUint8Array(file.encryptedFK),
          privateKey,
        );
      } else {
        const rmk = await restoreRMKFromSession();
        if (!rmk) throw new Error("Please log in again.");

        fileKey = await unwrapFileKey(
          base64ToUint8Array(file.encryptedFK),
          rmk,
          base64ToUint8Array(file.fk_iv),
        );
      }

      const decryptedBlob = await decryptFileWithFK(
        new Uint8Array(fileData),
        fileKey,
        base64ToUint8Array(file.file_iv),
      );

      const url = URL.createObjectURL(decryptedBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download =
        "decrypted_" + file.filename + "." + file.mimetype.split("/")[1];

      a.click();

      toast.success("Fichier téléchargé avec succès");
    } catch (err) {
      toast.error(
        (err as { data?: { message?: string } }).data?.message ||
          "Impossible de télécharger le fichier",
      );
    }
  }

  return {
    handleUpload,
    handleDownload,
    handleFolderUpload,
  };
}
