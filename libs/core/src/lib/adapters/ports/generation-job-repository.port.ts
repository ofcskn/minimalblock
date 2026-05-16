import { GenerationJob } from '../../domain/value-objects/generation-job.vo.js';

export interface IGenerationJobRepository {
  findById(id: string): Promise<GenerationJob | null>;
  findByConversionId(conversionId: string): Promise<GenerationJob[]>;
  findRunning(): Promise<GenerationJob[]>;
  save(job: GenerationJob): Promise<GenerationJob>;
}
