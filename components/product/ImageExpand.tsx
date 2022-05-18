import { XIcon } from "@heroicons/react/outline";
import React, { useEffect } from "react";

import { ProductMediaFragment } from "@/saleor/api";

interface ImageExpandProps {
  image?: ProductMediaFragment;
  onRemoveExpand: () => void;
}
export function ImageExpand({ image, onRemoveExpand }: ImageExpandProps) {
  const handleEsc = (event: { keyCode: number }) => {
    if (event.keyCode === 27) {
      onRemoveExpand();
    }
  };
  window.addEventListener("keydown", handleEsc);

  useEffect(() => () => {
      window.removeEventListener("keydown", handleEsc);
    }, []);

  if (!image) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col mt-10 px-8 mx-auto h-full w-full bg-backgroundColor">
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
      <div className="w-full flex justify-center items-center mt-8">
        <img src={image.url} alt={image.alt} />
      </div>
    </div>
  );
}

export default ImageExpand;
