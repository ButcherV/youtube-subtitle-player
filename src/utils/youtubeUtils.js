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

export function generateEmbedUrl(videoId, options = {}) {
  const defaultOptions = {
    enablejsapi: 1, // 启用 YouTube Player API，允许通过 JavaScript 控制播放器。
    controls: 0, // 隐藏默认的 YouTube 播放器控件。
    showinfo: 0, // 隐藏视频标题和上传者信息（注意：这个参数已被 YouTube 弃用，但保留它不会造成问题）。
    rel: 0, // 禁止在视频结束时显示相关视频（注意：这个参数的行为已经改变，现在只会显示来自同一频道的视频）。
    cc_load_policy: 0, // 默认不显示字幕，即使视频有可用字幕。
    disablekb: 1, // 禁用键盘控制，防止用户使用键盘快捷键控制视频。
    hl: 'en', // 设置播放器界面语言为英语。
    cc_lang_pref: 'en', // 设置字幕的首选语言为英语。
    modestbranding: 1, // 使用较少的 YouTube 品牌化元素（注意：即使设置了这个参数，YouTube 标志仍会显示在控制栏中）。
    playsinline: 1 // 在 iOS 设备上直接在页面中播放视频，而不是全屏播放。
  };

  const finalOptions = { ...defaultOptions, ...options };
  const params = new URLSearchParams(finalOptions).toString();

  return `https://www.youtube.com/embed/${videoId}?${params}`;
}

export function normalizeYoutubeUrl(url) {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error("无效的 YouTube 链接");
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}


