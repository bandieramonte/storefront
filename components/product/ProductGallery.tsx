import { PlayIcon } from "@heroicons/react/outline";
import { useCallback, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";

import { ImageExpand } from "@/components/product/ImageExpand";
import { VideoExpand } from "@/components/product/VideoExpand";
import { getGalleryMedia, getVideoThumbnail } from "@/lib/media";
import {
  ProductDetailsFragment,
  ProductMediaFragment,
  ProductVariantDetailsFragment,
} from "@/saleor/api";

export interface ProductGalleryProps {
  product: ProductDetailsFragment;
  selectedVariant?: ProductVariantDetailsFragment;
}

export function ProductGallery({ product, selectedVariant }: ProductGalleryProps) {
  const [expandedImage, setExpandedImage] = useState<ProductMediaFragment | undefined>(undefined);
  const [videoToPlay, setVideoToPlay] = useState<ProductMediaFragment | undefined>(undefined);

  const galleryMediaImages = getGalleryMedia({ product, selectedVariant }).filter(
    (media) => media.type === "IMAGE"
  );
  const galleryMediaVideos = getGalleryMedia({ product, selectedVariant }).filter(
    (media) => media.type === "VIDEO"
  );
  // TODO: optimize visuals for more than a video at a time
  const onClick = useCallback((idx: number) => {
    setExpandedImage(galleryMediaImages[idx]);
  }, []);

  return (
    <>
      <div
        className="flex flex-row flex-wrap lg:flex-nowrap gap-1 overflow-scroll scrollbar-hide justify-center items-center"
        style={{ scrollSnapType: "both mandatory" }}
      >
        {galleryMediaImages.length > 0 && (
          <div
            role="button"
            key={galleryMediaImages.reduce((mediaUrls, media) => `${mediaUrls  }, ${  media.url}`, "")}
            style={{ scrollSnapAlign: "start" }}
          >
            <SimpleImageSlider
              width={370}
              height={513}
              images={galleryMediaImages}
              showBullets={galleryMediaImages.length > 1}
              showNavs={galleryMediaImages.length > 1}
              navStyle={2}
              onClick={onClick}
            />
          </div>
        )}
        {galleryMediaVideos?.map(
          (media: ProductMediaFragment) =>
            media.type === "VIDEO" && (
              <div
                key={media.url}
                role="button"
                tabIndex={-2}
                onClick={() => {
                  setVideoToPlay(media);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setVideoToPlay(media);
                  }
                }}
                className="flex justify-center items-center bg-pitchBlack"
              >
                <img src={getVideoThumbnail(media.url)} alt={media.alt} className="z-10" />
                <div className="absolute z-20 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 bg-transparent">
                  <PlayIcon className="h-12 w-12 text-white" />
                </div>
              </div>
            )
        )}
      </div>
      {expandedImage && (
        <div className="absolute min-h-screen min-w-screen h-full w-full top-0 bottom-0 left-0 right-0 z-40">
          <ImageExpand image={expandedImage} onRemoveExpand={() => setExpandedImage(undefined)} />
        </div>
      )}

      {videoToPlay && (
        <div className="absolute min-h-screen min-w-screen top-0 bottom-0 left-0 right-0 z-40">
          <VideoExpand video={videoToPlay} onRemoveExpand={() => setVideoToPlay(undefined)} />
        </div>
      )}
    </>
  );
}
