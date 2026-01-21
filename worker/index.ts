import "dotenv/config";
import { Worker, type ConnectionOptions } from "bullmq";
import { QUEUE_NAMES } from "../src/lib/queue";
import { processGenerateDocument } from "./processors/generate-document";
import { processIngestJuris } from "./processors/ingest-juris";
import { processGenerateEmbeddings } from "./processors/generate-embeddings";

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

async function startWorkers() {
  console.log("Starting PetiChat workers...");

  const connection = getConnectionOptions();

  // Document generation worker
  const documentWorker = new Worker(
    QUEUE_NAMES.GENERATE_DOCUMENT,
    processGenerateDocument,
    {
      connection,
      concurrency: 2,
    }
  );

  documentWorker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.GENERATE_DOCUMENT}] Job ${job.id} completed`);
  });

  documentWorker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.GENERATE_DOCUMENT}] Job ${job?.id} failed:`, err.message);
  });

  // Jurisprudence ingestion worker
  const ingestWorker = new Worker(
    QUEUE_NAMES.INGEST_JURIS,
    processIngestJuris,
    {
      connection,
      concurrency: 1,
    }
  );

  ingestWorker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.INGEST_JURIS}] Job ${job.id} completed`);
  });

  ingestWorker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.INGEST_JURIS}] Job ${job?.id} failed:`, err.message);
  });

  // Embeddings generation worker
  const embeddingsWorker = new Worker(
    QUEUE_NAMES.GENERATE_EMBEDDINGS,
    processGenerateEmbeddings,
    {
      connection,
      concurrency: 3,
    }
  );

  embeddingsWorker.on("completed", (job) => {
    console.log(`[${QUEUE_NAMES.GENERATE_EMBEDDINGS}] Job ${job.id} completed`);
  });

  embeddingsWorker.on("failed", (job, err) => {
    console.error(`[${QUEUE_NAMES.GENERATE_EMBEDDINGS}] Job ${job?.id} failed:`, err.message);
  });

  console.log("Workers started successfully!");
  console.log(`  - ${QUEUE_NAMES.GENERATE_DOCUMENT}: concurrency 2`);
  console.log(`  - ${QUEUE_NAMES.INGEST_JURIS}: concurrency 1`);
  console.log(`  - ${QUEUE_NAMES.GENERATE_EMBEDDINGS}: concurrency 3`);

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\nShutting down workers...");
    await Promise.all([
      documentWorker.close(),
      ingestWorker.close(),
      embeddingsWorker.close(),
    ]);
    console.log("Workers stopped.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startWorkers().catch((err) => {
  console.error("Failed to start workers:", err);
  process.exit(1);
});
