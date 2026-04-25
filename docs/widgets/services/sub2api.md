---
title: Sub2API
description: Sub2API Widget Configuration
---

This widget reads the admin dashboard stats endpoint and displays usage and throughput metrics.

Allowed fields (maximum of 4): `["today_requests", "today_tokens", "today_actual_cost", "total_requests", "total_tokens", "total_actual_cost", "rpm", "tpm", "active_users", "active_api_keys", "total_accounts", "error_accounts", "average_duration_ms", "uptime"]`.

```yaml
widget:
  type: sub2api
  url: https://sub2api.host.or.ip
  key: your-admin-api-key
  fields: ["today_requests", "today_tokens", "today_actual_cost", "rpm"] # optional
```
