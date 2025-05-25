export interface BasicSelectOpt<T = string> {
  label: string;
  value: T;
  [key: string]: any;
}
