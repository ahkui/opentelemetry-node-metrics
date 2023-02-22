import { Meter, MetricAttributes } from '@opentelemetry/api';
import {
  PerformanceObserver,
  constants,
  NodeGCPerformanceDetail,
} from 'perf_hooks';

const NODEJS_GC_DURATION_SECONDS = 'nodejs_gc_duration_seconds';

export const gc: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  const histogram = meter.createHistogram(prefix + NODEJS_GC_DURATION_SECONDS, {
    description:
      'Garbage collection duration by kind, one of major, minor, incremental or weakcb.',
  });

  const kinds: Record<number, MetricAttributes & { kind: string }> = {};

  if (constants) {
    kinds[constants.NODE_PERFORMANCE_GC_MAJOR] = { ...labels, kind: 'major' };
    kinds[constants.NODE_PERFORMANCE_GC_MINOR] = { ...labels, kind: 'minor' };
    kinds[constants.NODE_PERFORMANCE_GC_INCREMENTAL] = {
      ...labels,
      kind: 'incremental',
    };
    kinds[constants.NODE_PERFORMANCE_GC_WEAKCB] = { ...labels, kind: 'weakcb' };
  }

  const obs = new PerformanceObserver((list) => {
    const entry = list.getEntries()[0];
    const detail: NodeGCPerformanceDetail =
      entry.detail as NodeGCPerformanceDetail;
    // Convert duration from milliseconds to seconds
    detail?.kind && histogram.record(entry.duration / 1000, kinds[detail.kind]);
  });

  // We do not expect too many gc events per second, so we do not use buffering
  obs.observe({ entryTypes: ['gc'], buffered: false });
};

export const metricNames = [NODEJS_GC_DURATION_SECONDS];
