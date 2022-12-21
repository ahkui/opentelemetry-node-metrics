import { Meter, MetricAttributes } from '@opentelemetry/api';
import { readFileSync } from 'fs';

const values = ['VmSize', 'VmRSS', 'VmData'];

const PROCESS_RESIDENT_MEMORY = 'process_resident_memory_bytes';
const PROCESS_VIRTUAL_MEMORY = 'process_virtual_memory_bytes';
const PROCESS_HEAP = 'process_heap_bytes';

function structureOutput(input: string) {
  const returnValue: Record<string, number> = {};

  input
    .split('\n')
    .filter((s) => values.some((value) => s.indexOf(value) === 0))
    .forEach((string) => {
      const split = string.split(':');

      // Get the value
      let value = split[1].trim();
      // Remove trailing ` kb`
      value = value.slice(0, value.length - 3);
      // Make it into a number in bytes bytes
      returnValue[split[0]] = Number(value) * 1024;
    });

  return returnValue;
}

export const linuxVariant: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  let stats: Record<string, number> | null | undefined;
  function getStats() {
    if (stats !== undefined) return stats;

    try {
      const stat = readFileSync('/proc/self/status', 'utf8');
      stats = structureOutput(stat);
    } catch {
      stats = null;
    }

    setTimeout(() => {
      stats = undefined;
    }, 1000).unref();

    return stats;
  }

  meter
    .createObservableGauge(prefix + PROCESS_RESIDENT_MEMORY, {
      description: 'Resident memory size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats()) return;
      stats?.VmRSS && observable.observe(stats.VmRSS, labels);
    });

  meter
    .createObservableGauge(prefix + PROCESS_VIRTUAL_MEMORY, {
      description: 'Virtual memory size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats()) return;
      stats?.VmSize && observable.observe(stats.VmSize, labels);
    });

  meter
    .createObservableGauge(prefix + PROCESS_HEAP, {
      description: 'Process heap size in bytes.',
    })
    .addCallback((observable) => {
      if (!getStats()) return;
      stats?.VmData && observable.observe(stats.VmData, labels);
    });
};

export const metricNames = [
  PROCESS_RESIDENT_MEMORY,
  PROCESS_VIRTUAL_MEMORY,
  PROCESS_HEAP,
];
