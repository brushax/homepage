export const DEFAULT_FIELDS = ["today_requests", "today_tokens", "today_actual_cost", "rpm"];
export const ALLOWED_FIELDS = [
  "today_requests",
  "today_tokens",
  "today_actual_cost",
  "total_requests",
  "total_tokens",
  "total_actual_cost",
  "rpm",
  "tpm",
  "active_users",
  "active_api_keys",
  "total_accounts",
  "error_accounts",
  "average_duration_ms",
  "uptime",
];

const MAX_ALLOWED_FIELDS = 4;

export function parseFields(fields) {
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

export function getFields(fields) {
  const parsedFields = parseFields(fields)
    .filter((field) => ALLOWED_FIELDS.includes(field))
    .slice(0, MAX_ALLOWED_FIELDS);

  return parsedFields.length ? parsedFields : DEFAULT_FIELDS;
}

export function formatValue(t, field, data) {
  const value = data?.[field];

  switch (field) {
    case "today_tokens":
    case "total_tokens":
      return `${t("common.number", {
        value: (value ?? 0) / 1000000,
        maximumFractionDigits: 2,
      })}M`;
    case "today_actual_cost":
    case "total_actual_cost":
      return t("common.number", {
        value: value ?? 0,
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      });
    case "average_duration_ms":
      return `${t("common.number", {
        value: value ?? 0,
        maximumFractionDigits: 0,
      })} ms`;
    case "uptime":
      return t("common.duration", { value: value ?? 0 });
    default:
      return t("common.number", { value: value ?? 0 });
  }
}
