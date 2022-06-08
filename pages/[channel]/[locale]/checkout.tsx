import { useRouter } from "next/router";
import React, { ReactElement, useEffect } from "react";

import { CheckoutForm, CheckoutSidebar, Layout, Spinner } from "@/components";
import { BaseSeo } from "@/components/seo/BaseSeo";
import { usePaths } from "@/lib/paths";
import { useCheckout } from "@/lib/providers/CheckoutProvider";

function CheckoutPage() {
  const router = useRouter();
  const paths = usePaths();
  const { checkout, loading } = useCheckout();

  useEffect(() => {
    // Redirect to cart if theres no checkout data
    if (!loading && (!checkout || !checkout.lines?.length)) {
      router.push(paths.cart.$url());
    }
  });

  const isCheckoutLoading = loading || typeof window === "undefined";
  if (isCheckoutLoading) {
    return (
      <>
        <Spinner />
        <BaseSeo title="Checkout" />
      </>
    );
  }

  if (!checkout || checkout.lines?.length === 0) {
    return <BaseSeo title="Checkout" />;
  }

  return (
    <>
      <BaseSeo title="Checkout" />

      <main className=" md:w-full max-w-7xl md:px-8 mx-8 md:mx-auto overflow-hidden flex md:flex-row flex-col justify-between">
        <div className=" w-full sm:w-2/3 md:w-full justify-center mx-auto">
          <CheckoutForm />
        </div>
        <div className=" w-full pb-12 mdMax:flex mdMax:justify-center ">
          <CheckoutSidebar checkout={checkout} />
        </div>
      </main>
    </>
  );
}

export default CheckoutPage;

CheckoutPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
