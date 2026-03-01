import React, { useState, useEffect } from "react";
import { resolveVideoRef } from "~/lib/firebaseStorage";

function extractYouTubeId(url: string): string | null {
  try {
    // Accept full URL or embed URL or just id
    // Examples:
    // https://www.youtube.com/watch?v=ID
    // https://youtu.be/ID
    // https://www.youtube.com/embed/ID
    const patterns = [
      /youtube\.com\/watch\?v=([\w-]+)/i,
      /youtu\.be\/([\w-]+)/i,
      /youtube\.com\/embed\/([\w-]+)/i,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    // If looks like an id already
    if (/^[\w-]{10,}$/.test(url)) return url;
  } catch (e) {
    // ignore
  }
  return null;
}

type VideoProps = {
  configJson?: string | null;
  videoUrl?: string | null;
  className?: string;
};

const Video: React.FC<VideoProps> = ({ configJson, videoUrl, className }) => {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);

  let url: string | undefined | null = videoUrl || null;
  let isShortRef = false;

  if (!url && configJson) {
    try {
      const cfg = JSON.parse(configJson);
      if (cfg && typeof cfg.videoUrl === "string") {
        url = cfg.videoUrl;
        isShortRef = !!cfg.videoRef;
      }
    } catch (err) {
      // invalid json — ignore and show placeholder
    }
  }

  useEffect(() => {
    if (isShortRef && url && !url.startsWith("http")) {
      setResolving(true);
      resolveVideoRef(url)
        .then((fullUrl) => setResolvedUrl(fullUrl))
        .catch(() => setResolvedUrl(null))
        .finally(() => setResolving(false));
    } else {
      setResolvedUrl(null);
    }
  }, [isShortRef, url]);

  const displayUrl = isShortRef ? resolvedUrl : url;

  const videoId = displayUrl ? extractYouTubeId(displayUrl) : null;
  const isYouTube = !!videoId;

  if (resolving) {
    return (
      <div
        className={`aspect-video bg-gray-200 rounded-lg mb-6 shadow-sm flex items-center justify-center ${className || ""}`}
      >
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!displayUrl) {
    return (
      <div
        className={`aspect-video bg-gray-200 rounded-lg mb-6 shadow-sm ${className || ""}`}
      >
        <div className="flex items-center justify-center h-full text-gray-600">
          <div className="text-center px-4">
            <p className="font-medium">Vídeo indisponível</p>
            <p className="text-xs mt-1">
              Adicione `videoUrl` em `configJson` da atividade.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // YouTube embed
  if (videoId) {
    const embed = `https://www.youtube.com/embed/${videoId}`;
    return (
      <div
        className={`aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-sm ${className || ""}`}
      >
        <iframe
          width="100%"
          height="100%"
          src={embed}
          title="Vídeo do curso"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Direct video URL (Firebase Storage, MP4, WebM, etc.)
  return (
    <div
      className={`aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-sm ${className || ""}`}
    >
      <video
        src={displayUrl}
        controls
        className="w-full h-full object-contain"
        playsInline
      >
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    </div>
  );
};

export default Video;
