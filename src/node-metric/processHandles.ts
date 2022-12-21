import { Meter, MetricAttributes } from '@opentelemetry/api';

import { createAggregatorByObjectName } from './helpers/processMetricsHelpers';

const NODEJS_ACTIVE_HANDLES = 'nodejs_active_handles';
const NODEJS_ACTIVE_HANDLES_TOTAL = 'nodejs_active_handles_total';

export const processHandles: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  // Don't do anything if the function is removed in later nodes (exists in node@6-12...)
  if (typeof (process as any)._getActiveHandles !== 'function') return;

  const aggregateByObjectName = createAggregatorByObjectName();
  meter
    .createObservableGauge(prefix + NODEJS_ACTIVE_HANDLES, {
      description:
        'Number of active libuv handles grouped by handle type. Every handle type is C++ class name.', // eslint-disable-line max-len
    })
    .addCallback((observable) => {
      aggregateByObjectName(
        observable,
        labels,
        (process as any)._getActiveHandles(),
      );
    });

  meter
    .createObservableGauge(prefix + NODEJS_ACTIVE_HANDLES_TOTAL, {
      description: 'Total number of active handles.',
    })
    .addCallback((observable) => {
      const handles = (process as any)._getActiveHandles();
      observable.observe(handles.length, labels);
    });
};

export const metricNames = [NODEJS_ACTIVE_HANDLES, NODEJS_ACTIVE_HANDLES_TOTAL];
