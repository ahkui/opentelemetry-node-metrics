import { Meter, MetricAttributes } from '@opentelemetry/api';

import { createAggregatorByObjectName } from './helpers/processMetricsHelpers';

const NODEJS_ACTIVE_RESOURCES = 'nodejs_active_resources';
const NODEJS_ACTIVE_RESOURCES_TOTAL = 'nodejs_active_resources_total';

export const processResources: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  if (typeof (process as any).getActiveResourcesInfo !== 'function') return;

  const aggregateByObjectName = createAggregatorByObjectName();
  meter
    .createObservableGauge(prefix + NODEJS_ACTIVE_RESOURCES, {
      description:
        'Number of active resources that are currently keeping the event loop alive, grouped by async resource type.',
    })
    .addCallback((observable) => {
      aggregateByObjectName(
        observable,
        labels,
        (process as any).getActiveResourcesInfo(),
      );
    });

  meter
    .createObservableGauge(prefix + NODEJS_ACTIVE_RESOURCES_TOTAL, {
      description: 'Total number of active resources.',
    })
    .addCallback((observable) => {
      observable.observe(
        (process as any).getActiveResourcesInfo().length,
        labels,
      );
    });
};

export const metricNames = [
  NODEJS_ACTIVE_RESOURCES,
  NODEJS_ACTIVE_RESOURCES_TOTAL,
];
