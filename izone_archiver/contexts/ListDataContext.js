import { createContext, useState } from "react";

const ListDataContext = createContext({
  listData: [],
  setListData: () => {},
});

export default ListDataContext;
