import { Meter, MetricAttributes } from '@opentelemetry/api';

import * as fs from 'fs';
import * as process from 'process';
const PROCESS_OPEN_FDS = 'process_open_fds';

export const processOpenFileDescriptors: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  if (process.platform !== 'linux') return;

  meter
    .createObservableGauge(prefix + PROCESS_OPEN_FDS, {
      description: 'Number of open file descriptors.',
    })
    .addCallback((observable) => {
      try {
        const fds = fs.readdirSync('/proc/self/fd');
        // Minus 1 to not count the fd that was used by readdirSync(),
        // it's now closed.
        observable.observe(fds.length - 1, labels);
      } catch {
        // noop
      }
    });
};

export const metricNames = [PROCESS_OPEN_FDS];
