import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Moment from "react-moment";
import "./App.css";
import { video_meta } from "./all_videos";
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
  DatePicker,
  Dropdown,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import logo from "./logo.svg";
import _ from "lodash";
import ReactPlayer from "react-player";
const { Header, Content } = Layout;
const { RangePicker } = DatePicker;
const { Option } = Select;

//! https://betterprogramming.pub/how-to-hide-your-api-keys-c2b952bc07e6
//! https://stackoverflow.com/questions/57358605/multiple-filters-in-react
//TODO Get load more option working? or not

const apiKey = "imgH1bubQ0uXiD8lJAHERB4O6073d513";

function combineMeta(data) {
  let filteredData = data.map(({ svid, title, duration }) => {
    return {
      id: parseInt(title),
      svid: svid,
      duration: duration,
    };
  });
  const mergedList = _.map(filteredData, function (item) {
    return _.extend(item, _.find(video_meta, { id: item.id }));
  });
  // console.log(mergedList);
  return mergedList;
}

function MuseEmbed({ svid }) {
  return (
    // <div>
    //   <div
    //     className="muse-video-player"
    //     data-video={svid}
    //     data-search="0"
    //     data-logo="0"
    //     data-title="0"
    //     data-sizing="full"
    //   ></div>
    //   <script src="https://muse.ai/static/js/embed-player.min.js"></script>
    // </div>
    <iframe
      src={`https://muse.ai/embed/${svid}?search=0&logo=0&title=0`}
      // width="576"
      // height="324"
      frameBorder="0"
      allowFullScreen
    ></iframe>
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

function combineFilters(data, dateRange, sort, setListData) {
  console.log(data, dateRange, sort);
  //date comes first
  if (dateRange != null) {
    var dateFilteredListData = data.filter(function (item) {
      if (
        moment(item.date).isBetween(dateRange[0], dateRange[1], "day", "[]")
      ) {
        return true;
      }
    });
    //sorting comes last
    if (sort === "asc") {
      //destructive, changes dateFilteredListData
      var sortFilteredListData = dateFilteredListData.reverse();
    } else {
      var sortFilteredListData = dateFilteredListData;
    }
  } else {
    if (sort === "asc") {
      //destructive, changes dateFilteredListData
      var sortFilteredListData = data.reverse();
    } else {
      var sortFilteredListData = data;
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
  // if (value == null) {
  // RangePicker cleared
  // setListData(data);
  // setDateRange(null);
  // } else {
  // filter listData then setListData
  // let filteredListData = data.filter(function (item) {
  //   if (moment(item.date).isBetween(value[0], value[1])) {
  //     return true;
  //   }
  // });
  // setDateRange(filteredListData);
  // setListData(filteredListData);
  // }
}

export default function App() {
  const [listData, setListData] = useState([]);
  const [data, setData] = useState([]);

  const [dateRange, setDateRange] = useState(null);
  const [sort, setSort] = useState("desc");

  const headers = {
    Key: apiKey,
  };

  useEffect(() => {
    axios
      .get("https://muse.ai/api/files/videos", { headers })
      .then((response) => {
        setListData(combineMeta(response.data));
        setData(combineMeta(response.data));
      });
  }, []);

  return (
    <div className="app">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          <img src={logo} width="46" height="44" />
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <Nav.Link href="#donate" style={{ color: "white" }}>
            Donate
          </Nav.Link>
          <Nav.Link href="#contact" style={{ color: "white" }}>
            Contact
          </Nav.Link>
        </Navbar.Collapse>
      </Navbar>
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
      <div className="list">
        <List
          itemLayout="vertical"
          size="large"
          pagination={{
            onChange: (page) => {
              console.log(page);
            },
            responsive: true,
            // pageSize: 3,
          }}
          dataSource={listData}
          renderItem={(item) => (
            <List.Item key={item.id} extra={<MuseEmbed svid={item.svid} />}>
              <List.Item.Meta
                title={item.title}
                description={
                  <Moment local utc format="MMMM Do YYYY, h:mm:ss A">
                    {item.date}
                  </Moment>
                }
              />
              {<Duration timestamp={item.duration} />}
            </List.Item>
          )}
        ></List>
      </div>
    </div>
    // <div className="app">
    //   <Layout style={{ height: "100vh" }}>
    //     <Header className="header">
    //       <div className="logo" />
    //       <Menu
    //         theme="dark"
    //         selectable={false}
    //         style={{ textAlign: "right" }}
    //         mode="horizontal"
    //       >
    //         <Menu.Item key="1">1</Menu.Item>
    //         <Menu.Item key="2">2</Menu.Item>
    //       </Menu>
    //     </Header>
    //     <Content style={{ padding: "32px 50px" }}>
    //       <Layout
    //         style={{
    //           padding: "24px 0",
    //           minHeight: "500px",
    //           height: "100%",
    //           overflowY: "auto",
    //           backgroundColor: "white",
    //         }}
    //       >
    //         <Content style={{ padding: "0 24px", minHeight: 280 }}>
    //           <ReactPlayer
    //             url={video_url}
    //             controls
    //             config={{
    //               file: {
    //                 attributes: {
    //                   crossOrigin: "true",
    //                 },
    //                 tracks: [
    //                   {
    //                     kind: "subtitles",
    //                     src: eng_sub,
    //                     srcLang: "en",
    //                     default: true,
    //                   },
    //                   { kind: "subtitles", src: kr_sub, srcLang: "kr" },
    //                 ],
    //               },
    //             }}
    //           />
    //         </Content>
    //       </Layout>
    //     </Content>
    //   </Layout>
    // </div>
  );
}

// https://www.npmjs.com/package/react-player
//https://qiita.com/mehdi/items/95a250cd36fa11fd6856
// https://www.channelape.com/uncategorized/host-images-amazon-s3-cheap-5-minutes/
// https://www.youtube.com/watch?v=Wn0TtkoRx58
