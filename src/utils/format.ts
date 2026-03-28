import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

export function formatDayjs(utcString: string, format = "YYYY-MM-DD HH:mm:ss") {
  return dayjs.utc(utcString).utcOffset(8).format(format)
  //  使用 dayjs 库处理 UTC 时间格式转换 将 UTC 时间字符串转换为东八区（北京时间）的格式化时间字符串 参数 utcString: UTC 格式的时间字符串 参数 format: 目标格式，如 'YYYY-MM-DD HH:mm:ss' 返回: 转换后的格式化时间字符串
}
