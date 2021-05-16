import React from "react";
import { Select, DatePicker, Input } from "antd";
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function FilterData({
  combineFilters,
  setDateRange,
  setSort,
  setSearch,
  setListData,
  data,
  dateRange,
  sort,
  search,
}) {
  return (
    <div
      className="filter"
      style={{
        position: "-webkit-sticky",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <RangePicker
        value={dateRange}
        onChange={(value) => {
          setDateRange(value);
          const sorted = combineFilters(data, value, sort, search).slice(0, 20);
          setListData(sorted);
        }}
      />
      <Select
        value={sort}
        defaultValue="desc"
        onChange={(value) => {
          setSort(value);
          const sorted = combineFilters(data, dateRange, value, search).slice(
            0,
            20
          );
          setListData(sorted);
        }}
      >
        <Option value="desc">Most to least recent</Option>
        <Option value="asc">Least to most recent</Option>
      </Select>
      <Input
        allowClear
        value={search}
        placeholder="Search titles"
        style={{ width: 200 }}
        onChange={({ target }) => {
          const { value } = target;
          setSearch(value);
          const sorted = combineFilters(
            data,
            dateRange,
            sort,
            value.toLowerCase()
          ).slice(0, 20);
          setListData(sorted);
        }}
      />
    </div>
  );
}
