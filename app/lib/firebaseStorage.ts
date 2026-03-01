import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirebaseStorage } from "./firebase";

const VIDEO_ACCEPT = "video/mp4,video/webm,video/ogg";
const MAX_VIDEO_SIZE_MB = 500;

export async function uploadVideo(
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!file.type.startsWith("video/")) {
    throw new Error("O arquivo deve ser um vídeo (mp4, webm ou ogg).");
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_VIDEO_SIZE_MB) {
    throw new Error(
      `O vídeo deve ter no máximo ${MAX_VIDEO_SIZE_MB}MB. Tamanho atual: ${sizeMB.toFixed(1)}MB.`
    );
  }

  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    task.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(percent);
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export function getVideoAccept(): string {
  return VIDEO_ACCEPT;
}

export function getMaxVideoSizeMB(): number {
  return MAX_VIDEO_SIZE_MB;
}
