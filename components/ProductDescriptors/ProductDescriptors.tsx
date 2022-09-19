import { useAuthState } from "@saleor/sdk";
import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { usePaths } from "@/lib/paths";
import { getSelectedVariantID } from "@/lib/product";
import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { DEFAULT_LOCALE, localeToEnum } from "@/lib/regions";
import { translate } from "@/lib/translations";
import {
  CheckoutError,
  ProductDetailsFragment,
  useCheckoutAddProductLineMutation,
  useCreateCheckoutMutation,
} from "@/saleor/api";

import { VariantSelector } from "../product/VariantSelector";
import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";

export interface ProductDescriptorsProps {
  product: ProductDetailsFragment;
}

export function ProductDescriptors({ product }: ProductDescriptorsProps) {
  const router = useRouter();
  const paths = usePaths();
  const t = useIntl();
  const { currentChannel, formatPrice } = useRegions();
  const selectedVariantID = getSelectedVariantID(product, router);
  const selectedVariant = product?.variants?.find((v) => v?.id === selectedVariantID) || undefined;
  const price = selectedVariant?.pricing?.price?.gross || product.pricing?.priceRange?.start?.gross;
  const { checkoutToken, setCheckoutToken, checkout } = useCheckout();
  const [createCheckout] = useCreateCheckoutMutation();
  const { user } = useAuthState();
  const locale = router.query.locale?.toString() || DEFAULT_LOCALE;
  const [addProductToCheckout] = useCheckoutAddProductLineMutation();
  const [loadingAddToCheckout, setLoadingAddToCheckout] = useState(false);
  const [addToCartError, setAddToCartError] = useState("");
  const [quantity, setQuantity] = React.useState<number>();

  const updateQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(event.target.value));
  };

  const onAddToCart = async () => {
    // Clear previous error messages
    setAddToCartError("");

    // Block add to checkout button
    setLoadingAddToCheckout(true);
    const errors: CheckoutError[] = [];

    if (!selectedVariantID) {
      return;
    }

    if (checkout) {
      // If checkout is already existing, add products
      const { data: addToCartData } = await addProductToCheckout({
        variables: {
          checkoutToken,
          variantId: selectedVariantID,
          locale: localeToEnum(locale),
          quantity: quantity || 1,
        },
      });
      addToCartData?.checkoutLinesAdd?.errors.forEach((e) => {
        if (e) {
          errors.push(e);
        }
      });
    } else {
      // Theres no checkout, we have to create one
      const { data: createCheckoutData } = await createCheckout({
        variables: {
          email: user?.email,
          channel: currentChannel.slug,
          lines: [
            {
              quantity: quantity || 1,
              variantId: selectedVariantID,
            },
          ],
        },
      });
      createCheckoutData?.checkoutCreate?.errors.forEach((e) => {
        if (e) {
          errors.push(e);
        }
      });
      if (createCheckoutData?.checkoutCreate?.checkout?.token) {
        setCheckoutToken(createCheckoutData?.checkoutCreate?.checkout?.token);
      }
    }
    // Enable button
    setLoadingAddToCheckout(false);

    if (errors.length === 0) {
      // Product successfully added, redirect to cart page
      router.push(paths.cart.$url());
      return;
    }

    // Display error message
    const errorMessages = errors.map((e) => e.message || "") || [];
    setAddToCartError(errorMessages.join("\n"));
  };

  const isAddToCartButtonDisabled =
    !selectedVariant || selectedVariant?.quantityAvailable === 0 || loadingAddToCheckout;
  const shortDescription = translate(product, "shortDescription");

  return (
    <div>
      {shortDescription && <p className="my-6">{shortDescription}</p>}

      <p className="font-semibold">{t.formatMessage(messages.freeShipping)}</p>

      <div>
        {price && (
          <h2 className="text-lg font-bold tracking-tight text-gray-800 mt-6 mb-5">
            {formatPrice(price)}
          </h2>
        )}
        {/* Category link hidden for now */}
        {!!product.category?.slug && (
          <Link href={paths.category._slug(product?.category?.slug).$url()} passHref>
            <button type="button" className="text-lg font-medium hidden">
              {translate(product.category, "name")}
            </button>
          </Link>
        )}
      </div>

      <VariantSelector product={product} selectedVariantID={selectedVariantID} />

      {!selectedVariant && (
        <p className="text-base text-yellow-600 mt-5">
          {t.formatMessage(messages.variantNotChosen)}
        </p>
      )}

      {selectedVariant?.quantityAvailable === 0 && (
        <p className="text-base text-yellow-600 mt-5">{t.formatMessage(messages.soldOut)}</p>
      )}

      <div className="flex flex-row items-center gap-5 mt-2">
        <input
          type="number"
          className="h-8 md:mt-2 w-10 md:w-16 block  bg-transparent border-x-0 border-t-0 rounded-md text-base text-center"
          defaultValue={1}
          onChange={(ev) => updateQuantity(ev)}
          min={1}
          required
          pattern="[0-9]*"
        />

        <button
          onClick={onAddToCart}
          type="submit"
          disabled={isAddToCartButtonDisabled}
          className={clsx("btn-main my-5  ", isAddToCartButtonDisabled && "btn-main-disabled")}
        >
          {loadingAddToCheckout
            ? t.formatMessage(messages.adding)
            : t.formatMessage(messages.addToCart)}
        </button>
      </div>

      {!!addToCartError && <p className="text-red-500 text-sm font-medium">{addToCartError}</p>}
    </div>
  );
}

export default ProductDescriptors;
