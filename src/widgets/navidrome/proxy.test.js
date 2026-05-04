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

vi.mock("crypto", async () => {
  const actual = await vi.importActual("crypto");

  return {
    ...actual,
    randomBytes: vi.fn(() => Buffer.from("salt1234")),
  };
});

import navidromeProxyHandler from "./proxy";

describe("widgets/navidrome/proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("derives subsonic token from password when token is not provided", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "https://navidrome.example.com",
      user: "Landslide9280",
      password: "secret",
    });
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ "subsonic-response": { status: "ok" } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "getNowPlaying", index: "0" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(httpProxy).toHaveBeenCalledTimes(1);
    expect(httpProxy.mock.calls[0][0].toString()).toBe(
      "https://navidrome.example.com/rest/getNowPlaying?u=Landslide9280&t=8345c4031fec0aa090487f0af54d5da8&s=73616c7431323334&v=1.16.1&c=homepage&f=json",
    );
    expect(res.statusCode).toBe(200);
  });

  it("keeps explicit token and salt untouched", async () => {
    getServiceWidget.mockResolvedValue({
      type: "navidrome",
      url: "https://navidrome.example.com",
      user: "Landslide9280",
      token: "existing-token",
      salt: "existing-salt",
      password: "secret",
    });
    httpProxy.mockResolvedValueOnce([
      200,
      "application/json",
      Buffer.from(JSON.stringify({ "subsonic-response": { status: "ok" } })),
    ]);

    const req = { query: { group: "g", service: "svc", endpoint: "getNowPlaying", index: "0" } };
    const res = createMockRes();

    await navidromeProxyHandler(req, res);

    expect(httpProxy.mock.calls[0][0].toString()).toBe(
      "https://navidrome.example.com/rest/getNowPlaying?u=Landslide9280&t=existing-token&s=existing-salt&v=1.16.1&c=homepage&f=json",
    );
  });
});
