export function parseSRT(srtContent) {
    const subtitles = [];
    const subtitleBlocks = srtContent.trim().split('\n\n');
  
    subtitleBlocks.forEach(block => {
      const lines = block.split('\n');
      if (lines.length >= 3) {
        const timeCode = lines[1].split(' --> ');
        subtitles.push({
          start: timeToSeconds(timeCode[0]),
          end: timeToSeconds(timeCode[1]),
          text: lines.slice(2).join(' ')
        });
      }
    });
  
    return subtitles;
  }
  
  function timeToSeconds(timeString) {
    const [hours, minutes, seconds] = timeString.split(':');
    return parseFloat(hours) * 3600 + parseFloat(minutes) * 60 + parseFloat(seconds.replace(',', '.'));
  }