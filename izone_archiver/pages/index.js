import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
// import VideoPage from "./components/VideoPage";
// import VideoList from "./components/VideoList";
import { Nav, Navbar } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
import moment from "moment";
import Moment from "react-moment";
import { video_meta } from "../src/all_videos_new";
import {
  Layout,
  Button,
  Modal,
  Tabs,
  Row,
  List,
  Select,
  Typography,
  DatePicker,
  Dropdown,
} from "antd";
import {
  DownOutlined,
  CaretRightOutlined,
  PlayCircleFilled,
} from "@ant-design/icons";
import _ from "lodash";
import ReactPlayer from "react-player";
import ListDataContext from "../contexts/ListDataContext";
import DateRangeContext from "../contexts/DateRangeContext";
import SortContext from "../contexts/SortContext";

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: "us-east-2",
});
const s3 = new AWS.S3();

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

//! https://betterprogramming.pub/how-to-hide-your-api-keys-c2b952bc07e6
//! https://stackoverflow.com/questions/57358605/multiple-filters-in-react
//TODO Get load more option working? or not

export default function VideoList({ data, initListData }) {
  const { listData, setListData } = useContext(ListDataContext);
  const { dateRange, setDateRange } = useContext(DateRangeContext);
  const { sort, setSort } = useContext(SortContext);

  useEffect(() => {
    if (listData.length !== 0) {
      setListData(listData);
    } else {
      setListData(initListData);
    }
  }, []);

  return (
    <div className="app">
      <div className="filter">
        <RangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value);
            const sorted = combineFilters(data, value, sort);
            setListData(sorted);
          }}
        />
        <Select
          value={sort}
          defaultValue="desc"
          onChange={(value) => {
            setSort(value);
            const sorted = combineFilters(data, dateRange, value);
            setListData(sorted);
          }}
        >
          <Option value="desc">Most to least recent</Option>
          <Option value="asc">Least to most recent</Option>
        </Select>
      </div>
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
                      <Moment local utc format="MMMM Do YYYY, h:mm:ss A">
                        {item.date}
                      </Moment>
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
                        //   onReady={() => {
                        //     router.push({
                        //       pathname: `/video/${item.id}`,
                        //       query: {},
                        //     });
                        //   }}
                        config={{
                          file: {
                            attributes: {
                              crossOrigin: "true",
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
    </div>
  );
}

function combineFilters(data, dateRange, sort) {
  let dateFilteredListData;
  let sortFilteredListData;
  //date comes first
  if (dateRange != null) {
    dateFilteredListData = data.filter(function (item) {
      if (
        moment(item.date).isBetween(dateRange[0], dateRange[1], "day", "[]")
      ) {
        return true;
      }
    });
    //sorting comes last
    if (sort === "asc") {
      //destructive, changes dateFilteredListData
      sortFilteredListData = dateFilteredListData.sort(
        (a, b) => moment(a.date).unix() - moment(b.date).unix()
      );
    } else {
      sortFilteredListData = dateFilteredListData.sort(
        (a, b) => moment(b.date).unix() - moment(a.date).unix()
      );
    }
  } else {
    if (sort === "asc") {
      //destructive, changes dateFilteredListData
      sortFilteredListData = data.sort(
        (a, b) => moment(a.date).unix() - moment(b.date).unix()
      );
    } else {
      sortFilteredListData = data.sort(
        (a, b) => moment(b.date).unix() - moment(a.date).unix()
      );
    }
  }
  return sortFilteredListData;
  //   setListData(sortFilteredListData);
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

function combineMeta(data) {
  let filteredData = data.map(({ title, vidUrl, subs, thumbUrl }) => {
    return {
      id: parseInt(title),
      vidUrl: vidUrl,
      subs: subs,
      thumbUrl: thumbUrl,
    };
  });
  const mergedList = _.map(filteredData, function (item) {
    return _.extend(item, _.find(video_meta, { id: item.id }));
  });
  return mergedList;
}

function pullData(resp) {
  const keys = resp.Contents.map((o) => o.Key);
  let uniqueDirs = [];
  keys.forEach((key) => {
    if (!uniqueDirs.includes(key.split("/")[0])) {
      uniqueDirs.push(key.split("/")[0]);
    }
  });

  let vidArr = [];
  uniqueDirs.forEach((dir) => {
    const vidFiles = keys.filter((element) => element.startsWith(dir));
    //duration requires a getObject call, perhaps try to generate using python?
    const vidPath = vidFiles.filter((element) => element.endsWith(".mp4"))[0];
    const thumbPath = vidFiles.filter((element) => element.endsWith(".jpg"))[0];
    const title = vidPath.split("/")[1].replace(".mp4", "");
    const vidUrl = `https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${vidPath}`;
    const thumbUrl = `https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${thumbPath}`;

    let subs = [];
    const subFiles = vidFiles.filter((element) => element.endsWith(".vtt"));
    subFiles.forEach((subPath) => {
      const sub = subPath.split("/")[1];
      subs.push({
        kind: "subtitles",
        src: `https://${process.env.NEXT_PUBLIC_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${subPath}`,
        srcLang: sub,
      });
    });

    vidArr.push({
      title: title,
      vidUrl: vidUrl,
      subs: subs,
      thumbUrl: thumbUrl,
    });
  });
  return vidArr;
}

const params = {
  Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
  MaxKeys: 999999,
};

export async function getStaticProps() {
  const resp = await s3.listObjectsV2(params).promise();
  const vidArr = pullData(resp);
  const data = combineMeta(vidArr);
  const initListData = combineFilters(combineMeta(vidArr), null, "desc");
  return {
    props: {
      data,
      initListData,
    },
  };
}

// https://www.npmjs.com/package/react-player
//https://qiita.com/mehdi/items/95a250cd36fa11fd6856
// https://www.channelape.com/uncategorized/host-images-amazon-s3-cheap-5-minutes/
// https://www.youtube.com/watch?v=Wn0TtkoRx58
