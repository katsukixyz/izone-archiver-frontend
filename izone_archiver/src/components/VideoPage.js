import React from "react";
import Moment from "react-moment";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import { Typography, Button } from "antd";
import { PlayCircleFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import ReactPlayer from "react-player";
import "../App.css";
const { Title } = Typography;

const VideoPage = (props) => {
  const {
    date,
    id,
    subs,
    title,
    vidUrl,
    data,
    listData,
    sort,
    dateRange,
  } = props.location.state;
  return (
    <div>
      <div
        style={{
          fontSize: "18px",
          maxWidth: "1000px",
          paddingTop: "10px",
          textAlign: "left",
          marginLeft: "auto",
          marginRight: "auto",
          display: "block",
        }}
      >
        <Link
          to={{
            pathname: "/",
            state: {
              data: data,
              listData: listData,
              sort: sort,
              dateRange: dateRange,
            },
          }}
        >
          <ArrowLeftOutlined style={{ color: "black" }} />
        </Link>
      </div>
      <div style={{ paddingTop: "20px" }}>
        <div
          className="card"
          key={id}
          style={{
            paddingLeft: "10px",
            paddingRight: "10px",
            padding: "20px",
            maxWidth: "1000px",
            borderRadius: "6px",
            // justifyContent: "space-between",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            flexDirection: "row",
            border: "0px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            // backgroundColor: "#F8F8F8",
          }}
        >
          <div className="video" style={{ width: "100%" }}>
            <ReactPlayer
              url={vidUrl}
              width="100%"
              height="100%"
              controls
              playing
              config={{
                file: {
                  attributes: {
                    crossOrigin: "true",
                  },
                },
                tracks: subs ? subs : [],
              }}
            />
          </div>
          <div className="cardMeta" style={{ paddingTop: "20px" }}>
            <Title level={4}>{title}</Title>
            <p>
              <Moment local utc format="MMMM Do YYYY, h:mm:ss A">
                {date}
              </Moment>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPage;
