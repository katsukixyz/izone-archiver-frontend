import { createContext, useState } from "react";

const SortContext = createContext({
  sort: "desc",
  setSort: () => {},
});

export default SortContext;
