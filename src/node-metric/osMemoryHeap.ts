import {
  linuxVariant,
  metricNames as linuxMetricNames,
} from './osMemoryHeapLinux';
import { safeMemoryUsage } from './helpers/safeMemoryUsage';
import { platform } from 'process';
import { Meter, MetricAttributes } from '@opentelemetry/api';

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';

const notLinuxVariant: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  meter
    .createObservableGauge(prefix + PROCESS_RESIDENT_MEMORY, {
      description: 'Resident memory size in bytes.',
    })
    .addCallback((observable) => {
      const memUsage = safeMemoryUsage();
      // I don't think the other things returned from
      // `process.memoryUsage()` is relevant to a standard export
      if (memUsage) observable.observe(memUsage.rss, labels);
    });
};

export const osMemoryHeap =
  platform === 'linux' ? linuxVariant : notLinuxVariant;

export const metricNames =
  platform === 'linux' ? linuxMetricNames : [PROCESS_RESIDENT_MEMORY];
