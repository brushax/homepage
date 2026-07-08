import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_FIELDS = ["bots", "version", "memory", "uptime"];
const MAX_ALLOWED_FIELDS = 4;
const STATS_FIELDS = ["version", "memory", "uptime"];

function parseFields(fields) {
  if (Array.isArray(fields)) {
    return fields;
  }

  if (typeof fields === "string") {
    try {
      const parsedFields = JSON.parse(fields);
      return Array.isArray(parsedFields) ? parsedFields : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getFields(fields) {
  const parsedFields = parseFields(fields)
    .filter((field) => DEFAULT_FIELDS.includes(field))
    .slice(0, MAX_ALLOWED_FIELDS);

  return parsedFields.length ? parsedFields : DEFAULT_FIELDS;
}

function getUptimeSeconds(processStartTime) {
  if (!processStartTime) {
    return null;
  }

  const startedAt = Date.parse(processStartTime);
  if (Number.isNaN(startedAt)) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const fields = getFields(widget.fields);
  widget.fields = fields;

  const needsBots = fields.includes("bots");
  const needsStats = fields.some((field) => STATS_FIELDS.includes(field));

  const { data: botsData, error: botsError } = useWidgetAPI(widget, needsBots ? "bots" : "", {
    refreshInterval: 30000,
  });
  const { data: statsData, error: statsError } = useWidgetAPI(widget, needsStats ? "stats" : "", {
    refreshInterval: 60000,
  });

  const error = botsError ?? statsError;
  if (error) {
    return <Container service={service} error={error} />;
  }

  const memoryBytes = Number.isFinite(statsData?.memoryKiB) ? statsData.memoryKiB * 1024 : null;
  const uptimeSeconds = getUptimeSeconds(statsData?.processStartTime);

  const values = {
    bots: t("common.number", { value: botsData?.count ?? 0 }),
    version: statsData?.version ? `v${statsData.version}` : t("archisteamfarm.unknown"),
    memory: memoryBytes === null ? t("archisteamfarm.unknown") : t("common.bbytes", { value: memoryBytes }),
    uptime: uptimeSeconds === null ? t("archisteamfarm.unknown") : t("common.duration", { value: uptimeSeconds }),
  };

  if ((needsBots && !botsData) || (needsStats && !statsData)) {
    return (
      <Container service={service}>
        {fields.map((field) => (
          <Block key={field} field={`archisteamfarm.${field}`} label={`archisteamfarm.${field}`} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {fields.map((field) => (
        <Block key={field} field={`archisteamfarm.${field}`} label={`archisteamfarm.${field}`} value={values[field]} />
      ))}
    </Container>
  );
}
