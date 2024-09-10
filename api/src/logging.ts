import express from "express";
import morgan from "morgan";

morgan.token("json", (req: express.Request) => {
  if (process.env.LOG_REQUEST_BODIES === "off") {
    return "[Omitted]";
  }
  const str = JSON.stringify(req.body, (key, value) => {
    // Hide things that look like API keys and session secrets from the logs
    if (key === "key") return "omitted";
    if (key === "token") return "omitted";
    return value;
  });
  if (str === "null" || str === "{}") return "";
  return str.length < 10000 ? str : "[Large JSON]";
});

morgan.token("referer", (req: express.Request) => {
  return req.headers.referer ? `R=${req.headers.referer}` : "-";
});

const LOG_FORMAT =
  process.env.NODE_ENV === "production"
    ? ":remote-addr :method :url HTTP/:http-version :referer"
    : ":method :url HTTP/:http-version";

export const requestFinishedLogger = morgan(
  `${LOG_FORMAT} :status :res[content-length] - :response-time ms`,
  {
    skip: (req: express.Request) => process.env.LOG_NO_AUTH_REQUESTS === "off",
  },
);
