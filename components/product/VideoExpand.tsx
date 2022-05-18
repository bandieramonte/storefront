import { XIcon } from "@heroicons/react/outline";
import React, { useEffect } from "react";

import { getYouTubeIDFromURL } from "@/lib/media";
import { ProductMediaFragment } from "@/saleor/api";

interface VideoExpandProps {
  video?: ProductMediaFragment;
  onRemoveExpand: () => void;
}

export function VideoExpand({ video, onRemoveExpand }: VideoExpandProps) {
  useEffect(() => {
    const handleEsc = (event: { keyCode: number }) => {
      if (event.keyCode === 27) {
        onRemoveExpand();
      }
    };
    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);

  if (!video) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col mt-10 mx-auto px-8 h-full w-full bg-backgroundColor">
      <div
        role="button"
        tabIndex={0}
        className="z-40 pt-8 lg:px-8 mx-auto mt-36"
        onClick={() => onRemoveExpand()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onRemoveExpand();
          }
        }}
      >
        <XIcon className="w-6 h-6" />
      </div>
      <div
        className="w-full h-full flex justify-center items-center"
        onBlur={() => onRemoveExpand()}
      >
        <iframe
          title={video.alt || "Video"}
          src={`https://www.youtube.com/embed/${getYouTubeIDFromURL(video.url)}?autoplay=1`}
          className="w-full h-full p-8 "
          allow="autoplay"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export default VideoExpand;
