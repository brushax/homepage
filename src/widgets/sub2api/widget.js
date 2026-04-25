import { asJson } from "utils/proxy/api-helpers";
import credentialedProxyHandler from "utils/proxy/handlers/credentialed";

const widget = {
  api: "{url}/{endpoint}",
  proxyHandler: credentialedProxyHandler,

  mappings: {
    stats: {
      endpoint: "api/v1/admin/dashboard/stats",
      validate: ["data"],
      map: (data) => asJson(data).data,
    },
  },
};

export default widget;
