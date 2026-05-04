import getServiceWidget from "utils/config/service-helpers";
import createLogger from "utils/logger";
import { sanitizeErrorURL } from "utils/proxy/api-helpers";
import { httpProxy } from "utils/proxy/http";

const logger = createLogger("resinProxyHandler");

function authHeaders(widget) {
  const headers = {
    Accept: "application/json",
  };

  if (widget.key) {
    headers.Authorization = `Bearer ${widget.key}`;
  }

  return headers;
}

async function fetchJSON(url, headers) {
  const [status, , data] = await httpProxy(url, {
    method: "GET",
    headers,
  });

  let parsed = null;
  if (data?.length) {
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      parsed = data.toString();
    }
  }

  return { status, data: parsed };
}

async function fetchHealth(url) {
  const [status, , data] = await httpProxy(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  let parsed = null;
  if (data?.length) {
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      parsed = data.toString();
    }
  }

  return { status, data: parsed };
}

export default async function resinProxyHandler(req, res) {
  const { group, service, index } = req.query;

  if (!group || !service) {
    logger.debug("Invalid or missing service '%s' or group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const widget = await getServiceWidget(group, service, index);
  if (!widget) {
    logger.debug("Invalid or missing widget for service '%s' in group '%s'", service, group);
    return res.status(400).json({ error: "Invalid proxy service type" });
  }

  const baseURL = widget.url?.replace(/\/+$/, "");
  const infoURL = new URL(`${baseURL}/api/v1/system/info`);
  const poolURL = new URL(`${baseURL}/api/v1/metrics/snapshots/node-pool`);
  const healthURL = new URL(`${baseURL}/healthz`);

  const headers = authHeaders(widget);

  const [infoResult, poolResult, healthResult] = await Promise.all([
    fetchJSON(infoURL, headers),
    fetchJSON(poolURL, headers),
    fetchHealth(healthURL),
  ]);

  if (infoResult.status !== 200 || poolResult.status !== 200 || healthResult.status !== 200) {
    const failed =
      infoResult.status !== 200
        ? { url: infoURL, status: infoResult.status, data: infoResult.data }
        : poolResult.status !== 200
          ? { url: poolURL, status: poolResult.status, data: poolResult.data }
          : { url: healthURL, status: healthResult.status, data: healthResult.data };

    logger.error("Error getting data from Resin: %d. Data: %o", failed.status, failed.data);
    return res.status(failed.status).json({
      error: {
        message: `HTTP Error ${failed.status}`,
        url: sanitizeErrorURL(failed.url),
        data: failed.data,
      },
    });
  }

  return res.status(200).json({
    status: healthResult.data?.status ?? "ok",
    version: infoResult.data?.version ?? null,
    total_nodes: poolResult.data?.total_nodes ?? 0,
    healthy_nodes: poolResult.data?.healthy_nodes ?? 0,
    egress_ip_count: poolResult.data?.egress_ip_count ?? 0,
    healthy_egress_ip_count: poolResult.data?.healthy_egress_ip_count ?? 0,
  });
}
