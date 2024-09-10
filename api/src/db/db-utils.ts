import moment, { Moment } from "moment";

export function isoFormat(m: Moment): any {
  return m.utc().format("YYYY-MM-DD HH:mm:ssZ");
}

export function isoTimeAgo(msIntoPast: number) {
  return isoFormat(moment(Date.now() - msIntoPast));
}

export function isNever(arg: never) {
  return arg;
}
