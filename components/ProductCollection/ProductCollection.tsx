import React from "react";
import { useIntl } from "react-intl";

import { ProductFilterInput, ProductOrder,useProductCollectionQuery } from "@/saleor/api";

import { Pagination } from "../Pagination";
import { ProductCard } from "../ProductCard";
import { useRegions } from "../RegionsProvider";
import { Spinner } from "../Spinner";
import { messages } from "../translations";

export interface ProductCollectionProps {
  filter?: ProductFilterInput;
  allowMore?: boolean;
  sortBy?: ProductOrder;
}

export function ProductCollection({ filter, allowMore = true, sortBy }: ProductCollectionProps) {
  const t = useIntl();
  const { query } = useRegions();

  const { loading, error, data, fetchMore } = useProductCollectionQuery({
    fetchPolicy: "no-cache",
    variables: {
      filter,
      sortBy,
      ...query,
    },
  });

  const onLoadMore = () => {
    fetchMore({
      variables: {
        after: data?.products?.pageInfo.endCursor,
      },
    });
  };

  if (loading) return <Spinner />;
  if (filter?.search === null) return <p />; // this assumes there can't be an error if search field is empty
  if (error) return <p>Error</p>;

  const products = data?.products?.edges.map((edge) => edge.node) || [];
  if (products.length === 0) {
    return <p>{t.formatMessage(messages.noProducts)}</p>;
  }
  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
      {allowMore && (
        <Pagination
          onLoadMore={onLoadMore}
          pageInfo={data?.products?.pageInfo}
          itemsCount={data?.products?.edges.length}
          totalCount={data?.products?.totalCount || undefined}
        />
      )}
    </div>
  );
}

export default ProductCollection;
