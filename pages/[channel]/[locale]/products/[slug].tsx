import { ApolloQueryResult } from "@apollo/client";
import clsx from "clsx";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement } from "react";
import { useIntl } from "react-intl";

import { Layout, ProductCollection, RichText } from "@/components";
import { AttributeDetails } from "@/components/product/AttributeDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPageSeo } from "@/components/seo/ProductPageSeo";
import { messages } from "@/components/translations";
import apolloClient from "@/lib/graphql";
import { getSelectedVariantID } from "@/lib/product";
import { contextToRegionQuery } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CollectionBySlugDocument,
  CollectionBySlugQuery,
  CollectionBySlugQueryVariables,
  ProductBySlugDocument,
  ProductBySlugQuery,
  ProductBySlugQueryVariables,
} from "@/saleor/api";

export type OptionalQuery = {
  variant?: string;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: "blocking",
});

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const productSlug = context.params?.slug?.toString()!;
  const response: ApolloQueryResult<ProductBySlugQuery> = await apolloClient.query<
    ProductBySlugQuery,
    ProductBySlugQueryVariables
  >({
    query: ProductBySlugDocument,
    variables: {
      slug: productSlug,
      ...contextToRegionQuery(context),
    },
  });

  const response2: ApolloQueryResult<CollectionBySlugQuery> = await apolloClient.query<
    CollectionBySlugQuery,
    CollectionBySlugQueryVariables
  >({
    query: CollectionBySlugDocument,
    variables: {
      slug: "suggested-products", // TODO: make this dynamic
      ...contextToRegionQuery(context),
    },
  });

  return {
    props: {
      product: response.data.product,
      collection: response2.data.collection,
    },
    revalidate: 60, // value in seconds, how often ISR will trigger on the server
  };
};

function ProductPage({ product, collection }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const t = useIntl();

  if (!product?.id) {
    return <Custom404 />;
  }

  const selectedVariantID = getSelectedVariantID(product, router);
  const selectedVariant = product?.variants?.find((v) => v?.id === selectedVariantID) || undefined;
  const description = translate(product, "description");

  return (
    <>
      <ProductPageSeo product={product} />
      <main
        className={clsx(
          "gap-4 max-h-full overflow-auto md:overflow-hidden container pt-8 px-8 md:grid-cols-3"
        )}
      >
        <div className="pb-5 sm:pb-3">
          <button onClick={router.back} className="text-base cursor-pointer" type="button">
            {t.formatMessage(messages.goBack)}
          </button>
        </div>
        <h1 className="text-6xl font-bold tracking-tight text-center pb-8">
          {translate(product, "name")}
        </h1>
        <div className="col-span-3">
          <ProductGallery product={product} selectedVariant={selectedVariant} />
        </div>
        <div className="xl:w-4/6 m-auto">
          <div>
            <p className="text-lg mt-2 font-medium text-gray-500 underline mb-11 mt-8 text-center w-full">
              {t.formatMessage(messages.description)}
            </p>
            {description && (
              <div className="my-6">
                <RichText jsonStringData={description} />
              </div>
            )}
          </div>

          <div className="flex">
            <AttributeDetails product={product} selectedVariant={selectedVariant} />
          </div>
        </div>
        <div className="m-auto">
          <p className="text-lg pb-5 font-medium text-gray-500 underline mb-11 mt-8 text-center w-full">
            {t.formatMessage(messages.suggestedProducts)}
          </p>
          <div className="w-full">
            <ProductCollection filter={{ collections: [collection?.id || ""] }} />
          </div>
        </div>
        <div className="space-y-8 mt-10 md:mt-0 " />
      </main>
    </>
  );
}

export default ProductPage;

ProductPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
