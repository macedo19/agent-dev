-- CreateTable
CREATE TABLE "execution_agent" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "flow_type" TEXT NOT NULL,
    "input_payload" JSONB NOT NULL,
    "output_payload" JSONB NOT NULL,
    "duration_ms" INTEGER NOT NULL,

    CONSTRAINT "execution_agent_pkey" PRIMARY KEY ("id")
);
