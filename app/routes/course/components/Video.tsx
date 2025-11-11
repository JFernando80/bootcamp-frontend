import React from "react";

const Video = () => {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6 shadow-sm">
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Gestão de ONGs"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default Video;
