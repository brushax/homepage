import resinProxyHandler from "./proxy";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: resinProxyHandler,

  mappings: {
    stats: {
      endpoint: "api/v1/system/info",
    },
  },
};

export default widget;
