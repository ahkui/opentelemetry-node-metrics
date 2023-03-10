import { Meter, MetricAttributes } from '@opentelemetry/api';
import * as process from 'process';

const startInSeconds = Math.round(Date.now() / 1000 - process.uptime());
const PROCESS_START_TIME = 'process_start_time_seconds';

export const processStartTime: (
  Meter: Meter,
  config: {
    prefix?: string;
    labels?: MetricAttributes;
  },
) => void = (meter, { prefix, labels }) => {
  meter
    .createUpDownCounter(prefix + PROCESS_START_TIME, {
      description: 'Start time of the process since unix epoch in seconds.',
    })
    .add(startInSeconds, labels);
};

module.exports.metricNames = [PROCESS_START_TIME];
