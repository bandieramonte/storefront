import { ApolloQueryResult } from "@apollo/client";
import { ProductOrderField } from "@saleor/sdk/dist/apollo/types";
import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import React, { ReactElement, useState } from "react";

import { HomepageBlock, Layout } from "@/components";
import { ProductSort } from "@/components/ProductSort";
import { BaseSeo } from "@/components/seo/BaseSeo";
import { HOMEPAGE_MENU } from "@/lib/const";
import apolloClient from "@/lib/graphql";
import { contextToRegionQuery } from "@/lib/regions";
import {
  HomepageBlocksQuery,
  HomepageBlocksQueryDocument,
  HomepageBlocksQueryVariables,
  OrderDirection,
  ProductOrder,
} from "@/saleor/api";

export const getStaticProps = async (context: GetStaticPropsContext) => {
  const result: ApolloQueryResult<HomepageBlocksQuery> = await apolloClient.query<
    HomepageBlocksQuery,
    HomepageBlocksQueryVariables
  >({
    query: HomepageBlocksQueryDocument,
    variables: { slug: HOMEPAGE_MENU, ...contextToRegionQuery(context) },
  });
  return {
    props: {
      menuData: result?.data,
    },
    revalidate: 60 * 60, // value in seconds, how often ISR will trigger on the server
  };
};

function Home({ menuData }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [chosenSortBy, setSortBy] = useState<ProductOrder>({
    direction: "ASC" as OrderDirection,
    field: "NAME" as ProductOrderField,
  });

  const passData = (data: ProductOrder) => {
    setSortBy(data);
  };

  return (
    <>
      <BaseSeo />
      <div>
        <header>
          <div className="container" />
        </header>

        <div className="headLineSectionStyle headLineSectionHeight" />
        <section className="pl-10 md:pl-15 container bg-fixed align-middle pb-6 md:pb-10 headLineSectionHeight">
          <div className="ph_HeadlineSection sm:mr-8 mr-5  align-middle ">
            <h3 className="max-w-4xl py-4 text-white sm:text-5xl lg:text-7xl">
              Which book should I read first?
            </h3>
            <h1 className="font-normal text-white text-md mt-5">
              People always ask, Which book should I read first?
              <br />
              My advice, start with Mohammed, once you know Mohammed you know Islam.
            </h1>
          </div>
        </section>

        <main>
          <div className="pl-10 md:pl-15 container py-10">
            <ProductSort passData={passData} />
            {menuData?.menu?.items?.map((m) => {
              if (!m) {
                return null;
              }
              return <HomepageBlock key={m.id} menuItem={m} sortBy={chosenSortBy} />;
            })}
          </div>
        </main>
      </div>
    </>
  );
}

export default Home;

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [],
  fallback: "blocking",
});

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
