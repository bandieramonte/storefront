import { useCallback, useState } from "react";
import SimpleImageSlider from "react-simple-image-slider";

import { ImageExpand } from "@/components/product/ImageExpand";
import { ProductDescriptors } from "@/components/ProductDescriptors";
import { getGalleryMedia, getYouTubeIDFromURL } from "@/lib/media";
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

  const galleryMediaImages = getGalleryMedia({ product, selectedVariant }).filter(
    (media) => media.type === "IMAGE"
  );
  const galleryMediaVideos = getGalleryMedia({ product, selectedVariant }).filter(
    (media) => media.type === "VIDEO"
  );
  // TODO: optimize visuals for more than a video at a time
  const onClick = useCallback((idx: number) => {
    if ((window.innerWidth || 1000) > 500) {
      setExpandedImage(galleryMediaImages[idx]);
    }
  }, []);

  return (
    <>
      <div
        className="flex flex-row flex-wrap lg:flex-nowrap gap-20 overflow-scroll scrollbar-hide justify-center"
        style={{ scrollSnapType: "both mandatory" }}
      >
        {galleryMediaImages.length > 0 && (
          <div
            role="button"
            key={galleryMediaImages.reduce((mediaUrls, media) => `${mediaUrls}, ${media.url}`, "")}
            style={{ scrollSnapAlign: "start" }}
            className="flex shrink-0"
          >
            <SimpleImageSlider
              width={373}
              height={513}
              images={galleryMediaImages}
              showBullets={galleryMediaImages.length > 1}
              showNavs={galleryMediaImages.length > 1}
              navStyle={2}
              onClick={onClick}
            />
          </div>
        )}
        <div className="flex flex-col md:w-1/3">
          {galleryMediaVideos?.map(
            (media: ProductMediaFragment) =>
              media.type === "VIDEO" && (
                <div key={media.url} className="mb-10">
                  <iframe
                    title={media.alt || "Video"}
                    src={`https://www.youtube.com/embed/${getYouTubeIDFromURL(
                      media.url
                    )}?autoplay=0`}
                    className="w-full h-96"
                    allowFullScreen
                  />
                </div>
              )
          )}
          <ProductDescriptors product={product} />
        </div>
      </div>
      {expandedImage && (
        <div className="absolute min-h-screen min-w-screen h-full w-full top-0 bottom-0 left-0 right-0 z-40">
          <ImageExpand image={expandedImage} onRemoveExpand={() => setExpandedImage(undefined)} />
        </div>
      )}
    </>
  );
}

export default ProductGallery;
