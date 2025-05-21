import type { BasicSelectOpt } from "@/lib/types/index";

interface ReturnProps {
  arr: BasicSelectOpt<number>[];
  loading: boolean;
}

interface Props {
  start_year?: number;
}

const useYearOpts = ({ start_year = 1900 }: Props): ReturnProps => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];

  for (let year = start_year; year <= currentYear; year++) {
    years.push(year);
  }

  return {
    arr: years
      .sort((a, b) => b - a)
      .map((item: number) => {
        return {
          label: item.toString(),
          value: item,
        };
      }),
    loading: false,
  };
};

export default useYearOpts;
