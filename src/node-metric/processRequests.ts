import { Meter, MetricAttributes } from '@opentelemetry/api';

import { createAggregatorByObjectName } from './helpers/processMetricsHelpers';

const NODEJS_ACTIVE_REQUESTS = 'nodejs_active_requests';
const NODEJS_ACTIVE_REQUESTS_TOTAL = 'nodejs_active_requests_total';

export const processRequests: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  // Don't do anything if the function is removed in later nodes (exists in node@6)
  if (typeof (process as any)._getActiveRequests !== 'function') return;

  const aggregateByObjectName = createAggregatorByObjectName();
  meter
    .createObservableGauge(prefix + NODEJS_ACTIVE_REQUESTS, {
      description:
        'Number of active libuv requests grouped by request type. Every request type is C++ class name.',
    })
    .addCallback((observable) => {
      aggregateByObjectName(
        observable,
        labels,
        (process as any)._getActiveRequests(),
      );
    });

  meter
    .createObservableGauge(prefix + NODEJS_ACTIVE_REQUESTS_TOTAL, {
      description: 'Total number of active requests.',
    })
    .addCallback((observable) => {
      observable.observe((process as any)._getActiveRequests().length, labels);
    });
};

export const metricNames = [
  NODEJS_ACTIVE_REQUESTS,
  NODEJS_ACTIVE_REQUESTS_TOTAL,
];
