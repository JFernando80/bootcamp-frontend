import React from "react";

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
  let url: string | undefined | null = videoUrl || null;

  if (!url && configJson) {
    try {
      const cfg = JSON.parse(configJson);
      if (cfg && typeof cfg.videoUrl === "string") url = cfg.videoUrl;
    } catch (err) {
      // invalid json — ignore and show placeholder
    }
  }

  const videoId = url ? extractYouTubeId(url) : null;
  const embed = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  if (!embed) {
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
      ></iframe>
    </div>
  );
};

export default Video;
