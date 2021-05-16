import React, { useEffect, useContext } from "react";
import Link from "next/link";
import Head from "next/head";
import ParseKeys from "../components/ParseKeys";
import FilterData from "../components/FilterData";
import * as dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import InfiniteScroll from "react-infinite-scroll-component";
import { video_meta } from "../src/all_videos_new";
import { Typography } from "antd";
import { PlayCircleFilled } from "@ant-design/icons";
import ReactPlayer from "react-player";
import ListDataContext from "../contexts/ListDataContext";
import DateRangeContext from "../contexts/DateRangeContext";
import SortContext from "../contexts/SortContext";
import SearchContext from "../contexts/SearchContext";

const S3 = require("aws-sdk/clients/s3");
const s3 = new S3({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

const { Title } = Typography;

dayjs.extend(isBetween);
dayjs.extend(utc);

export default function VideoList({ data, initListData }) {
  const { listData, setListData } = useContext(ListDataContext);
  const { dateRange, setDateRange } = useContext(DateRangeContext);
  const { sort, setSort } = useContext(SortContext);
  const { search, setSearch } = useContext(SearchContext);

  function fetchNextData() {
    //compare listData to data and get n more results
    let sortedData = combineFilters(data, dateRange, sort, search);

    if (sortedData.length !== listData.length) {
      const lastIndex = listData.length - 1;
      const index = sortedData.findIndex(
        (element) =>
          JSON.stringify(element) === JSON.stringify(listData[lastIndex])
      );
      const remainingArr = sortedData.slice(index + 1, listData.length + 20); //next n elements
      const combinedArr = listData.concat(remainingArr);
      setListData(combinedArr);
    }
  }

  useEffect(() => {
    if (listData.length !== 0) {
      setListData(listData);
    } else {
      setListData(initListData);
    }
  }, []);

  return (
    <div className="app">
      <Head>
        <title>IZ*ONE VLIVE Archive</title>
        <meta property="og:site_name" content="IZ*ONE VLIVE Archive" />
        <meta property="og:title" content="IZ*ONE VLIVE Archive" />
        <meta
          property="og:description"
          content={`View all ${data.length} archived videos of IZ*ONE's VLIVE channel.`}
        />
      </Head>

      <FilterData
        combineFilters={combineFilters}
        setDateRange={setDateRange}
        setSort={setSort}
        setSearch={setSearch}
        setListData={setListData}
        data={data}
        dateRange={dateRange}
        sort={sort}
        search={search}
      />

      <InfiniteScroll
        dataLength={listData ? listData.length : 0}
        hasMore={true}
        scrollThreshold={1}
        next={() => fetchNextData()}
        scrollableTarget="app"
        // height={100}
      >
        <div
          className="list"
          style={{
            maxWidth: "1000px",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {listData
            ? listData.map((item) => (
                <div
                  key={item.id}
                  style={{ paddingTop: "5px", paddingBottom: "5px" }}
                >
                  <div
                    className="card"
                    style={{
                      paddingLeft: "10px",
                      paddingRight: "10px",
                      padding: "20px",
                      borderRadius: "6px",
                      justifyContent: "space-between",
                      display: "flex",
                      flexDirection: "row",
                      border: "0px",
                      boxShadow:
                        "0 5px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <div className="cardMeta" style={{ width: "75%" }}>
                      <Title level={4}>{item.title}</Title>
                      <p>
                        {dayjs
                          .utc(item.date)
                          .local()
                          .format("MMMM D YYYY, h:mm:ss A")}
                      </p>
                      <p style={{ color: "black" }}>
                        <Duration timestamp={item.duration} />
                      </p>
                    </div>
                    <div className="video" style={{ width: "25%" }}>
                      <Link href={`/video/${item.id}`}>
                        <ReactPlayer
                          url={item.vidUrl}
                          width="100%"
                          height="100%"
                          light={item.thumbUrl}
                          controls
                          playIcon={
                            <PlayCircleFilled
                              style={{ fontSize: "26px", color: "white" }}
                            />
                          }
                          config={{
                            file: {
                              attributes: {
                                crossOrigin: "true",
                                controlsList: "nodownload",
                              },
                            },
                            tracks: item.subs ? item.subs : [],
                          }}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            : []}
        </div>
      </InfiniteScroll>
    </div>
  );
}

function Duration({ timestamp }) {
  let h = Math.floor(timestamp / 3600);
  let m = Math.floor((timestamp % 3600) / 60);
  let s = Math.floor(timestamp % 60);
  let hDisplay = h > 0 ? "0" + h + ":" : "";
  let mDisplay = m < 10 ? "0" + m + ":" : m + ":";
  let sDisplay = s < 10 ? "0" + s : s;
  return hDisplay + mDisplay + sDisplay;
}

function combineFilters(data, dateRange, sort, search) {
  let dateFilteredListData;
  let searchFilteredListData;
  let sortFilteredListData;

  //date first
  if (dateRange != null) {
    dateFilteredListData = data.filter(function (item) {
      if (
        dayjs
          .utc(item.date)
          .local()
          .isBetween(dateRange[0], dateRange[1], "day", "[]")
      ) {
        return true;
      }
    });
  } else {
    dateFilteredListData = data;
  }

  //search next
  if (search != "") {
    searchFilteredListData = dateFilteredListData.filter((item) =>
      item.title.toLowerCase().includes(search)
    );
  } else {
    searchFilteredListData = dateFilteredListData;
  }

  //sort last
  if (sort === "asc") {
    sortFilteredListData = searchFilteredListData.sort(
      (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
    );
  } else {
    sortFilteredListData = searchFilteredListData.sort(
      (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix()
    );
  }

  return sortFilteredListData;
}

function combineMeta(data) {
  //from aws
  let filteredData = data.map(({ title, vidUrl, subs, thumbUrl }) => {
    return {
      id: parseInt(title),
      vidUrl: vidUrl,
      subs: subs,
      thumbUrl: thumbUrl,
    };
  });
  const mergedArr = filteredData.map((item, index) =>
    Object.assign({}, item, video_meta[553 - index])
  );
  return mergedArr;
}

async function listAllKeys(params, allKeys = []) {
  const resp = await s3.listObjectsV2(params).promise();

  resp.Contents.forEach((o) => allKeys.push(o.Key));

  if (resp.NextContinuationToken) {
    params.ContinuationToken = resp.NextContinuationToken;
    await listAllKeys(params, allKeys);
  }
  return allKeys;
}
// export async function getServerSideProps() {
export async function getStaticProps() {
  const allKeys = await listAllKeys({
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
  });

  const allVidArr = ParseKeys(allKeys);

  const data = combineMeta(allVidArr);
  let initListData = combineFilters(combineMeta(allVidArr), null, "desc", "");
  initListData = initListData.slice(0, 20);
  return {
    props: {
      data,
      initListData,
    },
  };
}
