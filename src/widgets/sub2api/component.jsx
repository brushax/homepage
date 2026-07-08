import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import { formatValue, getFields } from "./helpers";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const fields = getFields(widget.fields);
  widget.fields = fields;

  const { data, error } = useWidgetAPI(widget, "stats", {
    refreshInterval: 60000,
  });

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        {fields.map((field) => (
          <Block key={field} field={`sub2api.${field}`} label={`sub2api.${field}`} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {fields.map((field) => (
        <Block
          key={field}
          field={`sub2api.${field}`}
          label={`sub2api.${field}`}
          value={formatValue(t, field, data)}
          highlightValue={data?.[field]}
        />
      ))}
    </Container>
  );
}
