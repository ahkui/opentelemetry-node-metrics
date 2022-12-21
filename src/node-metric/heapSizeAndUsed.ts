import { Meter, MetricAttributes } from '@opentelemetry/api';
import { safeMemoryUsage } from './helpers/safeMemoryUsage';

const NODEJS_HEAP_SIZE_TOTAL = 'nodejs_heap_size_total_bytes';
const NODEJS_HEAP_SIZE_USED = 'nodejs_heap_size_used_bytes';
const NODEJS_EXTERNAL_MEMORY = 'nodejs_external_memory_bytes';

export const heapSizeAndUsed: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { labels, prefix }) => {
  let stats: NodeJS.MemoryUsage | null | undefined;
  function getStats() {
    if (stats !== undefined) return stats;

    stats = safeMemoryUsage() || null;

    setTimeout(() => {
      stats = undefined;
    }, 1000).unref();

    return stats;
  }

  meter
    .createObservableGauge(prefix + NODEJS_HEAP_SIZE_TOTAL, {
      description: 'Process heap size from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats()) return;
      stats?.heapTotal && observable.observe(stats.heapTotal, labels);
    });

  meter
    .createObservableGauge(prefix + NODEJS_HEAP_SIZE_USED, {
      description: 'Process heap size used from Node.js in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats()) return;
      stats?.heapUsed && observable.observe(stats.heapUsed, labels);
    });

  meter
    .createObservableGauge(prefix + NODEJS_EXTERNAL_MEMORY, {
      description: 'Node.js external memory size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats()) return;
      if (stats?.external === undefined) return;
      stats?.external && observable.observe(stats.external, labels);
    });
};

export const metricNames = [
  NODEJS_HEAP_SIZE_TOTAL,
  NODEJS_HEAP_SIZE_USED,
  NODEJS_EXTERNAL_MEMORY,
];
