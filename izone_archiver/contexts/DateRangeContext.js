import { createContext, useState } from "react";

const DateRangeContext = createContext({
  dateRange: null,
  setDateRange: () => {},
});

export default DateRangeContext;
