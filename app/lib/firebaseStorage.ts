import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseStorage, getFirebaseFirestore } from "./firebase";

const VIDEO_REFS_COLLECTION = "videoRefs";
const CONFIG_JSON_MAX_CHARS = 149;

function generateShortId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

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

/**
 * Armazena uma URL longa no Firestore e retorna um ID curto.
 * Usado quando a URL do Firebase Storage excede o limite de 150 chars do backend.
 */
export async function storeVideoRef(fullUrl: string): Promise<string> {
  const db = getFirebaseFirestore();
  let shortId = generateShortId();
  // Garantir unicidade
  for (let i = 0; i < 5; i++) {
    const existing = await getDoc(doc(db, VIDEO_REFS_COLLECTION, shortId));
    if (!existing.exists()) break;
    shortId = generateShortId();
  }
  await setDoc(doc(db, VIDEO_REFS_COLLECTION, shortId), { url: fullUrl });
  return shortId;
}

/**
 * Resolve um ID curto para a URL completa do vídeo.
 */
export async function resolveVideoRef(shortId: string): Promise<string | null> {
  const db = getFirebaseFirestore();
  const snap = await getDoc(doc(db, VIDEO_REFS_COLLECTION, shortId));
  return snap.exists() ? (snap.data()?.url as string) ?? null : null;
}

/**
 * Verifica se a URL precisa ser armazenada como ref (excede limite do backend).
 */
export function isVideoUrlTooLong(videoUrl: string): boolean {
  const sampleConfig = JSON.stringify({
    videoUrl,
    videoRef: true,
    duration: 600,
  });
  return sampleConfig.length > CONFIG_JSON_MAX_CHARS;
}
