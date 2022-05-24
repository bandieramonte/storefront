import { ApolloQueryResult } from "@apollo/client";
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

const headLineSectionStyle = {
  width: "100%",
  height: "345px",
  backgroundImage: `url(${"/images/default_headline_image.png"})`,
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
};

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

        <section className="bg-fixed align-middle" style={headLineSectionStyle}>
          <div className="ph_HeadlineSection ml-15 align-middle ">
            <h3 className="max-w-4xl py-4 text-white lg:text-7xl">
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
          <div className="container py-10">
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
