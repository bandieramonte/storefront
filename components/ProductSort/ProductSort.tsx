import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import { OrderDirection,ProductOrderField } from "@/saleor/api";

import { messages } from "../translations";

export interface ProductSortProps {
  passData: any;
}

export function ProductSort({ passData }: ProductSortProps) {
  const t = useIntl();

  const sorterFields = {
    NAME: messages.sortName,
    PRICE: messages.sortPrice,
  };

  const sorterDirections = {
    ASC: messages.asc,
    DESC: messages.desc,
  };

  const [sortBy, setSorterFields] = React.useState({
    field: Object.keys(sorterFields).at(0)?.toString() as ProductOrderField,
    direction: Object.keys(sorterDirections).at(0)?.toString() as OrderDirection,
  });

  useEffect(() => {
    passData(sortBy);
  });

  const onFieldChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { target } = event;
    setSorterFields({
      ...sortBy,
      field: target.value as ProductOrderField,
    });
  };

  const onOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { target } = event;
    setSorterFields({
      ...sortBy,
      direction: target.value as OrderDirection,
    });
  };

  return (
    <div id="Sorter" className="mb-10 font-semibold flex items-center gap-1">
      <p>{t.formatMessage(messages.sortBy)}</p>
      <select
        name="sorterFields"
        onChange={onFieldChange}
        className="border-none bg-backgroundColor"
      >
        {Object.entries(sorterFields).map(([k, v]) => (
          <option key={k} value={k}>
            {t.formatMessage(v)}
          </option>
        ))}
      </select>
      <select
        name="sorterDirections"
        onChange={onOrderChange}
        className="border-none bg-backgroundColor"
      >
        {Object.entries(sorterDirections).map(([k, v]) => (
          <option key={k} value={k}>
            {t.formatMessage(v)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProductSort;
