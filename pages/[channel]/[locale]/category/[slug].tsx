import { ApolloQueryResult } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement, useState } from "react";
import { useIntl } from "react-intl";

import { Layout, PageHero, ProductCollection } from "@/components";
import { ProductSort } from "@/components/ProductSort";
import { CategoryPageSeo } from "@/components/seo/CategoryPageSeo";
import { messages } from "@/components/translations";
import apolloClient from "@/lib/graphql";
import { contextToRegionQuery } from "@/lib/regions";
import {
  CategoryBySlugDocument,
  CategoryBySlugQuery,
  CategoryBySlugQueryVariables,
  OrderDirection,
  ProductOrder,
  ProductOrderField,
} from "@/saleor/api";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const categorySlug = context.params?.slug?.toString()!;
  const response: ApolloQueryResult<CategoryBySlugQuery> = await apolloClient.query<
    CategoryBySlugQuery,
    CategoryBySlugQueryVariables
  >({
    query: CategoryBySlugDocument,
    variables: {
      slug: categorySlug,
      locale: contextToRegionQuery(context).locale,
    },
  });
  return {
    props: {
      category: response.data.category,
    },
  };
};

function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const t = useIntl();

  const [chosenSortBy, setSortBy] = useState<ProductOrder>({
    direction: "ASC" as OrderDirection,
    field: "NAME" as ProductOrderField,
  });

  const passData = (data: ProductOrder) => {
    setSortBy(data);
  };

  if (!category) {
    return <Custom404 />;
  }

  return (
    <>
      <CategoryPageSeo category={category} />
      <header className="mb-7 pt-4">
        <div className="">
          <PageHero entity={category} />
        </div>
      </header>
      <main>
        <div className="pl-10 md:pl-15 container pb-12">
          <ProductSort passData={passData} />
          <div className="pb-5">
            <button onClick={router.back} className="text-base cursor-pointer" type="button">
              {t.formatMessage(messages.goBack)}
            </button>
          </div>
          <ProductCollection filter={{ categories: [category?.id] }} sortBy={chosenSortBy} />
        </div>
      </main>
    </>
  );
}

export default CategoryPage;

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

CategoryPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
