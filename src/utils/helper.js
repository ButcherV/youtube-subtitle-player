export const cleanText = (text) => {
  if (!text) return "";

  return text
    .trim() // 去除首尾空格
    .replace(/^[.,!?;:'"，。！？；：""'']+/, "") // 去除开头的标点
    .replace(/[.,!?;:'"，。！？；：""'']+$/, "") // 去除结尾的标点
    .trim(); // 再次去除可能出现的空格
};