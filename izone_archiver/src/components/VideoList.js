import React, { useEffect, useState } from "react";
import moment from "moment";
import Moment from "react-moment";
import "../App.css";
import "../index.css";
import { video_meta } from "../all_videos_new";
import { Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
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
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import {
  DownOutlined,
  CaretRightOutlined,
  PlayCircleFilled,
} from "@ant-design/icons";
import logo from "../logo.svg";
import _ from "lodash";
import ReactPlayer from "react-player";

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: "us-east-2",
});
const s3 = new AWS.S3();
const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

//! https://betterprogramming.pub/how-to-hide-your-api-keys-c2b952bc07e6
//! https://stackoverflow.com/questions/57358605/multiple-filters-in-react
//TODO Get load more option working? or not

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

function Duration({ timestamp }) {
  let h = Math.floor(timestamp / 3600);
  let m = Math.floor((timestamp % 3600) / 60);
  let s = Math.floor(timestamp % 60);
  let hDisplay = h > 0 ? "0" + h + ":" : "";
  let mDisplay = m < 10 ? "0" + m + ":" : m + ":";
  let sDisplay = s < 10 ? "0" + s : s;
  return hDisplay + mDisplay + sDisplay;
}

function combineFilters(data, dateRange, sort, setListData) {
  console.log(data, dateRange, sort);
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
  setListData(sortFilteredListData);
}

function onRangeChange(
  value,
  data,
  setListData,
  dateRange,
  setDateRange,
  sort
) {
  setDateRange(value);
}

const VideoList = () => {
  const [listData, setListData] = useState([]);
  const [data, setData] = useState([]);

  const [dateRange, setDateRange] = useState(null);
  const [sort, setSort] = useState("desc");

  useEffect(() => {
    s3.listObjectsV2(
      {
        Bucket: process.env.REACT_APP_BUCKET_NAME,
        // Delimiter: "/",
        MaxKeys: 999999,
      },
      function (err, resp) {
        if (err) {
          console.log(err, err.stack);
        } else {
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
            const vidPath = vidFiles.filter((element) =>
              element.endsWith(".mp4")
            )[0];
            const thumbPath = vidFiles.filter((element) =>
              element.endsWith(".jpg")
            )[0];
            const title = vidPath.split("/")[1].replace(".mp4", "");
            const vidUrl = `https://${process.env.REACT_APP_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${vidPath}`;
            const thumbUrl = `https://${process.env.REACT_APP_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${thumbPath}`;

            let subs = [];
            const subFiles = vidFiles.filter((element) =>
              element.endsWith(".vtt")
            );
            subFiles.forEach((subPath) => {
              const sub = subPath.split("/")[1];
              subs.push({
                kind: "subtitles",
                src: `https://${process.env.REACT_APP_BUCKET_NAME}.s3.us-east-2.amazonaws.com/${subPath}`,
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
          setData(combineMeta(vidArr));
          //   setListData(combineMeta(vidArr));
          combineFilters(combineMeta(vidArr), null, "desc", setListData);
        }
      }
    );
  }, []);

  return (
    <div>
      <div className="filter">
        <RangePicker
          value={dateRange}
          onChange={(value) => {
            setDateRange(value);
            combineFilters(data, value, sort, setListData);
          }}
        />
        <Select
          value={sort}
          defaultValue="desc"
          onChange={(value) => {
            setSort(value);
            combineFilters(data, dateRange, value, setListData);
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
        {listData.map((item) => (
          <div
            key={item.id}
            style={{ paddingTop: "5px", paddingBottom: "5px" }}
          >
            <Link to={{ pathname: `/video/${item.id}`, state: { ...item } }}>
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
                  // backgroundColor: "#F8F8F8",
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
                    onReady={(h) => console.log(h)}
                    config={{
                      file: {
                        attributes: {
                          crossOrigin: "true",
                        },
                      },
                      tracks: item.subs ? item.subs : [],
                    }}
                  />
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;
