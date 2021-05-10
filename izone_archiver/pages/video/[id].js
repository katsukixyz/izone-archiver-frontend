import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import ReactPlayer from "react-player";
import * as dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import ParseKeys from "../../components/ParseKeys";
import { video_meta } from "../../src/all_videos_new";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Title } = Typography;

const S3 = require("aws-sdk/clients/s3");
const s3 = new S3({
  region: "us-east-2",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

dayjs.extend(utc);

export default function Video({ vidObj }) {
  const router = useRouter();
  const { id } = router.query;

  const { vidUrl, subs, date, title } = vidObj;
  return (
    <div>
      <Head>
        <title>{title}</title>
        <meta property="og:site_name" content="IZ*ONE VLIVE Archive" />
        <meta property="og:title" content={title} />
        <meta
          property="og:description"
          content={`${dayjs.utc(date).format("YYYY-MM-DD")} ${id} ${title}`}
        />
      </Head>
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
        <Link href="/">
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
                    controlsList: "nodownload",
                  },
                },
                tracks: subs ? subs : [],
              }}
            />
          </div>
          <div className="cardMeta" style={{ paddingTop: "20px" }}>
            <Title level={4}>{title}</Title>
            <p>{dayjs.utc(date).local().format("MMMM D YYYY, h:mm:ss A")}</p>
          </div>
        </div>
      </div>
    </div>
  );
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

const awsParams = {
  Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
  Delimiter: "/",
};

async function listAllKeys(params, allKeys = []) {
  const resp = await s3.listObjectsV2(params).promise();

  resp.Contents.forEach((o) => allKeys.push(o.Key));

  if (resp.NextContinuationToken) {
    params.ContinuationToken = resp.NextContinuationToken;
    await listAllKeys(params, allKeys);
  }
  return allKeys;
}

// export async function getServerSideProps({ params }) {
export async function getStaticProps({ params }) {
  const allKeys = await listAllKeys({
    Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
  });
  const vidArr = combineMeta(ParseKeys(allKeys));
  const vidObj = vidArr.filter((vid) => vid.id === parseInt(params.id))[0];
  return { props: { vidObj } };
}

export async function getStaticPaths() {
  const resp = await s3.listObjectsV2(awsParams).promise();
  const paths = resp.CommonPrefixes.map((video) => ({
    params: {
      id: video.Prefix.replace("/", "").split("_")[1],
    },
  }));
  return { paths, fallback: false };
}
