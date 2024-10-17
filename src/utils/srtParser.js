/* 
  后端发来的 SRT 文件的数据格式：

  1
  00:00:00,485 --> 00:00:05,297
  MR. TRASK: I'm going to recommend 
  to the disciplinary committee

  2
  00:00:05,297 --> 00:00:07,878
  that you be expelled, Mr. Simms.

  3
  00:00:07,878 --> 00:00:11,666
  You are a cover-up artist and you are a liar.

  4
  00:00:11,666 --> 00:00:14,975
  But not a snitch!

  5
  00:00:14,975 --> 00:00:16,523
  Excuse me?

  ...


  parseSRT 解析后:
  [
    {
      start: 0.485,
      end: 5.297,
      text: "MR. TRASK: I'm going to recommend to the disciplinary committee"
    },
    {
      start: 5.297,
      end: 7.878,
      text: "that you be expelled, Mr. Simms."
    },
    {
      start: 7.878,
      end: 11.666,
      text: "You are a cover-up artist and you are a liar."
    },
    {
      start: 11.666,
      end: 14.975,
      text: "But not a snitch!"
    },
    // ... 
  ]
*/


export function parseSRT(subtitlesArray) {
  // 如果输入已经是数组格式，直接返回
  if (Array.isArray(subtitlesArray)) {
    console.log("Input is an array, processing...");
    return subtitlesArray.map((subtitle) => {
      console.log("Processing subtitle:", subtitle);
      return {
        start: timeToSeconds(subtitle.start),
        end: timeToSeconds(subtitle.end),
        text: subtitle.text,
      };
    });
  }

  // 如果输入是字符串（旧的 SRT 格式），保留原来的解析逻辑
  if (typeof subtitlesArray === "string") {
    const subtitles = [];
    const subtitleBlocks = subtitlesArray.trim().split("\n\n");

    subtitleBlocks.forEach((block) => {
      const lines = block.split("\n");
      if (lines.length >= 3) {
        const timeCode = lines[1].split(" --> ");
        subtitles.push({
          start: timeToSeconds(timeCode[0]),
          end: timeToSeconds(timeCode[1]),
          text: lines.slice(2).join(" "),
        });
      }
    });

    return subtitles;
  }

  // 如果输入既不是数组也不是字符串，返回空数组
  console.error("Invalid subtitles format");
  return [];
}

function timeToSeconds(timeString) {
  // 如果timeString已经是数字，直接返回
  if (typeof timeString === "number") {
    return timeString;
  }

  const [hours, minutes, seconds] = timeString.split(":");
  return (
    parseFloat(hours) * 3600 +
    parseFloat(minutes) * 60 +
    parseFloat(seconds.replace(",", "."))
  );
}
