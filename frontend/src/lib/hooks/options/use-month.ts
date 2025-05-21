import type { BasicSelectOpt } from "@/lib/types/index";

interface ReturnProps {
  arr: BasicSelectOpt<number>[];
  loading: boolean;
}

interface Props {}

const useMonthOpts = ({}: Props): ReturnProps => {
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return {
    arr: month.map((item: string, index: number) => {
      return {
        label: item.toString(),
        value: index,
      };
    }),
    loading: false,
  };
};

export default useMonthOpts;
