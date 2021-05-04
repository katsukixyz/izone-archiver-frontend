import React, { useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Moment from "react-moment";
import _ from "lodash";
import ReactPlayer from "react-player";
import { video_meta } from "../../src/all_videos_new";
import ListDataContext from "../../contexts/ListDataContext";
import DateRangeContext from "../../contexts/DateRangeContext";
import SortContext from "../../contexts/SortContext";
import { PlayCircleFilled, ArrowLeftOutlined } from "@ant-design/icons";
import { Typography, Button } from "antd";

const { Title } = Typography;

const AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: "us-east-2",
});
const s3 = new AWS.S3();

export default function Video({ vidObj }) {
  const router = useRouter();
  const { id } = router.query;

  const { vidUrl, subs, thumbUrl, date, title, duration } = vidObj;
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
        {/* <Link
          to={{
            pathname: "/",
            state: {
              data: data,
              listData: listData,
              sort: sort,
              dateRange: dateRange,
            },
          }}
        > */}
        <Link href="/">
          <ArrowLeftOutlined
            style={{ color: "black" }}
            //   onClick={() => {
            //     router.push({
            //       pathname: "/",
            //       query: {},
            //     });
            //   }}
          />
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

const awsParams = {
  Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
  MaxKeys: 999999,
};

export async function getStaticProps({ params }) {
  const resp = await s3.listObjectsV2(awsParams).promise();
  const vidArr = combineMeta(pullData(resp));
  const vidObj = vidArr.filter((vid) => vid.id === parseInt(params.id))[0];
  return { props: { vidObj } };
}

export async function getStaticPaths() {
  const resp = await s3.listObjectsV2(awsParams).promise();
  const vidArr = combineMeta(pullData(resp));
  const paths = vidArr.map((video) => ({
    params: {
      id: video.id.toString(),
      //   date: video.date,
      //   subs: video.subs,
      //   title: video.title,
      //   vidUrl: video.vidUrl,
    },
  }));
  console.log(paths);
  return { paths, fallback: false };
}
