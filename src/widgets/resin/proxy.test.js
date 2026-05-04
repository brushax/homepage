import { beforeEach, describe, expect, it, vi } from "vitest";

import createMockRes from "test-utils/create-mock-res";

const { httpProxy, getServiceWidget, logger } = vi.hoisted(() => ({
  httpProxy: vi.fn(),
  getServiceWidget: vi.fn(),
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("utils/logger", () => ({
  default: () => logger,
}));

vi.mock("utils/config/service-helpers", () => ({
  default: getServiceWidget,
}));

vi.mock("utils/proxy/http", () => ({
  httpProxy,
}));

import resinProxyHandler from "./proxy";

describe("widgets/resin/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("aggregates resin api responses", async () => {
    getServiceWidget.mockResolvedValue({ type: "resin", url: "https://resin.example.com", key: "token" });
    httpProxy
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ version: "1.0.0" }))])
      .mockResolvedValueOnce([
        200,
        "application/json",
        Buffer.from(
          JSON.stringify({
            total_nodes: 100,
            healthy_nodes: 80,
            egress_ip_count: 30,
            healthy_egress_ip_count: 20,
          }),
        ),
      ])
      .mockResolvedValueOnce([200, "application/json", Buffer.from(JSON.stringify({ status: "ok" }))]);

    const req = { query: { group: "g", service: "svc", endpoint: "stats", index: "0" } };
    const res = createMockRes();

    await resinProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(3);
    expect(httpProxy.mock.calls[0][0].toString()).toBe("https://resin.example.com/api/v1/system/info");
    expect(httpProxy.mock.calls[1][0].toString()).toBe("https://resin.example.com/api/v1/metrics/snapshots/node-pool");
    expect(httpProxy.mock.calls[2][0].toString()).toBe("https://resin.example.com/healthz");
    expect(httpProxy.mock.calls[0][1].headers.Authorization).toBe("Bearer token");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      version: "1.0.0",
      total_nodes: 100,
      healthy_nodes: 80,
      egress_ip_count: 30,
      healthy_egress_ip_count: 20,
    });
  });
});
