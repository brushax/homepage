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
    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("resin.healthy_nodes")).toBeInTheDocument();
    expect(screen.getByText("resin.total_nodes")).toBeInTheDocument();
    expect(screen.getByText("resin.egress_ip_count")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        status: "ok",
        version: "1.0.0",
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

    expectBlockValue(container, "widget.status", "resin.ok");
    expectBlockValue(container, "resin.healthy_nodes", 80);
    expectBlockValue(container, "resin.total_nodes", 100);
    expectBlockValue(container, "resin.egress_ip_count", 30);
  });
});
