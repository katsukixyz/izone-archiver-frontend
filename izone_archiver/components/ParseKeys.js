export default function ParseKeys(allKeys) {
  let uniqueDirs = [];
  allKeys.forEach((key) => {
    if (!uniqueDirs.includes(key.split("/")[0])) {
      uniqueDirs.push(key.split("/")[0]);
    }
  });

  let allVidArr = [];
  uniqueDirs.forEach((dir) => {
    const vidFiles = allKeys.filter((element) => element.startsWith(dir));
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

    allVidArr.push({
      title: title,
      vidUrl: vidUrl,
      subs: subs,
      thumbUrl: thumbUrl,
    });
  });
  return allVidArr;
}
