import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const chrono = {
  now: (date?: Date | string | number) => dayjs(date).tz("Asia/Jakarta").toDate(),
  format: (datetime?: any, format?: string) => dayjs(datetime).tz("Asia/Jakarta").format(format || "DD MMM YYYY HH:mm:ss"),
  time: (datetime?: any, format?: string) => dayjs(datetime).tz("Asia/Jakarta").format(format || "HH:mm:ss"),
  shortDate: (date?: Date | string | number) => dayjs(date).tz("Asia/Jakarta").format("DD MMM YYYY"),
  longDate: (date?: Date | string | number) => dayjs(date).tz("Asia/Jakarta").format("DD MMM YYYY HH.mm"),
  addDays: (date?: Date | string | number, days: number = 0) => dayjs(date).tz("Asia/Jakarta").add(days, "day").toDate(),
  addMonths: (date?: Date | string | number, months: number = 0) => dayjs(date).tz("Asia/Jakarta").add(months, "month").toDate(),
};