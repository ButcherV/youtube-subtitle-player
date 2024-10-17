// 地址栏链接的格式: https://www.youtube.com/watch?v=xxxx
// 分享链接的格式: https://youtu.be/xxxx?xxx=xxxx
// 需要 embedUrl 分别处理。

export function extractVideoId(url) {
  let videoId = "";

  if (url.includes("youtu.be")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  } else if (url.includes("youtube.com")) {
    const urlParams = new URLSearchParams(url.split("?")[1]);
    videoId = urlParams.get("v");
  }

  if (!videoId) {
    console.error("无法提取视频 ID:", url);
    return null;
  }

  return videoId;
}

export function generateEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&showinfo=0&rel=0&cc_load_policy=0&disablekb=1&hl=en&cc_lang_pref=en&modestbranding=1&playsinline=1`;
}
