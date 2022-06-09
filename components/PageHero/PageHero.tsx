import React from "react";

import { translate } from "@/lib/translations";
import { CategoryDetailsFragment, CollectionDetailsFragment } from "@/saleor/api";

import { RichText } from "../RichText";

export interface PageHeroProps {
  entity: CollectionDetailsFragment | CategoryDetailsFragment;
}

export function PageHero({ entity }: PageHeroProps) {
  const style: React.CSSProperties = {};
  if (entity.backgroundImage?.url) {
    style.backgroundImage = `url(${entity.backgroundImage?.url})`;
  }

  const description = translate(entity, "description");
  return (
    <div>
      <div className=" headLineSectionStyle headLineSectionHeight" style={style} />
      <div className="pl-10 md:pl-15 container mx-auto h-96 rounded-md flex items-center headLineSectionHeight">
        <div className=" text-left">
          <h1 className="text-5xl text-white font-bold mb-4">{translate(entity, "name")}</h1>
          {description && (
            <span className=" text-lg inline-block block text-white">
              <RichText jsonStringData={description} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageHero;
