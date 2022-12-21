# opentelemetry-node-metrics

This module is an adoption of the metric set of [`prom-client`](https://www.npmjs.com/package/prom-client) for [`@opentelemetry/api`](https://www.npmjs.com/package/@opentelemetry/api).

### Usage

```js
const { metrics } = require('@opentelemetry/api');
const { setupNodeMetrics } = require('@ahkui/opentelemetry-node-metrics');

setupNodeMetrics(metrics.getMeterProvider());
```

or

```typescript
import { metrics } from '@opentelemetry/api';
import { setupNodeMetrics } from '@ahkui/opentelemetry-node-metrics';

setupNodeMetrics(metrics.getMeterProvider());
```

## License

This project heavily relies on code from [`siimon/prom-client`](https://github.com/siimon/prom-client) and [`marcbachmann/opentelemetry-node-metrics`](https://github.com/marcbachmann/opentelemetry-node-metrics)
and therefore I'd like to thank to all the contributors.

The [`prom-client`](https://www.npmjs.com/package/prom-client) project is using an APACHE v2.0 LICENSE and threfore it's best to apply the same license to this project.

This module is only a proof of concept to get opentelemetry to work with the metrics support of [`prom-client`](https://www.npmjs.com/package/prom-client).
