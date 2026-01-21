import { Queue, QueueEvents, type ConnectionOptions } from "bullmq";

// Queue names
export const QUEUE_NAMES = {
  GENERATE_DOCUMENT: "generate-document",
  INGEST_JURIS: "ingest-juris",
  GENERATE_EMBEDDINGS: "generate-embeddings",
} as const;

const getConnectionOptions = (): ConnectionOptions => {
  const url = process.env.REDIS_URL || "redis://localhost:6379";
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port) || 6379,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
  };
};

// Create queue instances
const connection = getConnectionOptions();

export const generateDocumentQueue = new Queue(QUEUE_NAMES.GENERATE_DOCUMENT, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const ingestJurisQueue = new Queue(QUEUE_NAMES.INGEST_JURIS, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
});

export const generateEmbeddingsQueue = new Queue(QUEUE_NAMES.GENERATE_EMBEDDINGS, {
  connection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

// Queue events for monitoring
export const createQueueEvents = (queueName: string) => {
  return new QueueEvents(queueName, { connection: getConnectionOptions() });
};

// Job data types
export interface GenerateDocumentJobData {
  caseId: string;
  userId: string;
  organizationId: string;
  format: "docx" | "pdf";
  includeJurisprudence: boolean;
}

export interface IngestJurisJobData {
  source: string;
  datasetUrl?: string;
  organizationId?: string;
}

export interface GenerateEmbeddingsJobData {
  jurisprudenceId: string;
  chunks: {
    id: string;
    content: string;
    chunkType: string;
  }[];
}

// Helper functions to add jobs
export const addGenerateDocumentJob = async (data: GenerateDocumentJobData) => {
  return generateDocumentQueue.add("generate", data, {
    jobId: `generate-${data.caseId}-${Date.now()}`,
  });
};

export const addIngestJurisJob = async (data: IngestJurisJobData) => {
  return ingestJurisQueue.add("ingest", data, {
    jobId: `ingest-${data.source}-${Date.now()}`,
  });
};

export const addGenerateEmbeddingsJob = async (data: GenerateEmbeddingsJobData) => {
  return generateEmbeddingsQueue.add("embeddings", data, {
    jobId: `embeddings-${data.jurisprudenceId}-${Date.now()}`,
  });
};
