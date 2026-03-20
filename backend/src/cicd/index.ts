import { MockPipelineProvider } from './mockPipelineProvider';
import { PipelineProvider } from './pipelineProvider';

// Default provider for the demo. Swap with GitHub Actions / GitLab CI providers later.
export const pipelineProvider: PipelineProvider = new MockPipelineProvider();

