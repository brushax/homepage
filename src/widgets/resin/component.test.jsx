// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/resin/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "resin" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("resin.ingress_bps")).toBeInTheDocument();
    expect(screen.getByText("resin.egress_bps")).toBeInTheDocument();
    expect(screen.getByText("resin.healthy_nodes")).toBeInTheDocument();
    expect(screen.getByText("resin.egress_ip_count")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        status: "ok",
        version: "1.0.0",
        ingress_bps: 1000000,
        egress_bps: 2000000,
        total_nodes: 100,
        healthy_nodes: 80,
        egress_ip_count: 30,
        healthy_egress_ip_count: 20,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "resin" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "resin.ingress_bps", 1000000);
    expectBlockValue(container, "resin.egress_bps", 2000000);
    expectBlockValue(container, "resin.healthy_nodes", 80);
    expectBlockValue(container, "resin.egress_ip_count", 30);
  });
});
