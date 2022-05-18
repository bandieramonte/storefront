import { ApolloQueryResult } from "@apollo/client";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { useRouter } from "next/router";
import Custom404 from "pages/404";
import React, { ReactElement } from "react";
import { useIntl } from "react-intl";

import { Layout, PageHero, ProductCollection } from "@/components";
import { CategoryPageSeo } from "@/components/seo/CategoryPageSeo";
import { messages } from "@/components/translations";
import apolloClient from "@/lib/graphql";
import { contextToRegionQuery } from "@/lib/regions";
import {
  CategoryBySlugDocument,
  CategoryBySlugQuery,
  CategoryBySlugQueryVariables,
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
  if (!category) {
    return <Custom404 />;
  }
  return (
    <>
      <CategoryPageSeo category={category} />
      <header className="mb-10 pt-4">
        <div className="container px-8">
          <PageHero entity={category} />
        </div>
      </header>
      <main>
        <div className="container px-8 pb-12">
          <div className="pb-3">
            <button onClick={router.back} className="text-base cursor-pointer" type="button">
              {t.formatMessage(messages.goBack)}
            </button>
          </div>
          <ProductCollection filter={{ categories: [category?.id] }} />
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
