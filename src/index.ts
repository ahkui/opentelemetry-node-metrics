import { MeterProvider, MetricAttributes } from '@opentelemetry/api';
import { Constants } from './Constants';
import { eventLoopLag } from './node-metric/eventLoopLag';
import { gc } from './node-metric/gc';
import { heapSizeAndUsed } from './node-metric/heapSizeAndUsed';
import { heapSpacesSizeAndUsed } from './node-metric/heapSpacesSizeAndUsed';
import { osMemoryHeap } from './node-metric/osMemoryHeap';
import { processCpuTotal } from './node-metric/processCpuTotal';
import { processHandles } from './node-metric/processHandles';
import { processMaxFileDescriptors } from './node-metric/processMaxFileDescriptors';
import { processOpenFileDescriptors } from './node-metric/processOpenFileDescriptors';
import { processRequests } from './node-metric/processRequests';
import { processResources } from './node-metric/processResources';
import { processStartTime } from './node-metric/processStartTime';
import { version } from './node-metric/version';

export type Config = {
  prefix?: string;
  labels?: MetricAttributes;
};

export function setupNodeMetrics(
  meterProvider: MeterProvider,
  config: Config = {},
) {
  const _config: Config = {
    prefix: config?.prefix ?? '',
    labels: config?.labels ?? {},
  };

  const meter = meterProvider.getMeter(Constants.OTEL_METRIC_NAME);

  version(meter, _config);
  eventLoopLag(meter, _config);
  gc(meter, _config);
  heapSizeAndUsed(meter, _config);
  heapSpacesSizeAndUsed(meter, _config);
  osMemoryHeap(meter, _config);
  processResources(meter, _config);
  processCpuTotal(meter, _config);
  processMaxFileDescriptors(meter, _config);
  processOpenFileDescriptors(meter, _config);
  processStartTime(meter, _config);
  processHandles(meter, _config);
  processRequests(meter, _config);
}

export default setupNodeMetrics;
