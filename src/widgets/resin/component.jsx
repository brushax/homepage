import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = ["ingress_bps", "egress_bps", "healthy_nodes", "egress_ip_count"];
  } else if (widget.fields?.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  const { data, error } = useWidgetAPI(widget, "stats", {
    refreshInterval: Math.max(1000, widget.refreshInterval ?? 2000),
  });

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="resin.ingress_bps" />
        <Block label="resin.egress_bps" />
        <Block label="resin.healthy_nodes" />
        <Block label="resin.egress_ip_count" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="resin.ingress_bps" value={t("common.byterate", { value: data.ingress_bps ?? 0, decimals: 1 })} />
      <Block label="resin.egress_bps" value={t("common.byterate", { value: data.egress_bps ?? 0, decimals: 1 })} />
      <Block label="resin.healthy_nodes" value={t("common.number", { value: data.healthy_nodes ?? 0 })} />
      <Block label="resin.egress_ip_count" value={t("common.number", { value: data.egress_ip_count ?? 0 })} />
      <Block field="resin.status" label="widget.status" value={t(`resin.${data.status ?? "unknown"}`)} />
      <Block label="resin.total_nodes" value={t("common.number", { value: data.total_nodes ?? 0 })} />
      <Block label="resin.version" value={data.version ?? "-"} />
      <Block
        label="resin.healthy_egress_ip_count"
        value={t("common.number", { value: data.healthy_egress_ip_count ?? 0 })}
      />
    </Container>
  );
}
