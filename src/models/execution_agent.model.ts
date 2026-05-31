class ExecutionAgent {
  public flowType: string;
  public inputPayload: Record<string, any>;
  public outputPayload: Record<string, any>;
  public durationMs: number;

  public constructor({
    flowType,
    inputPayload,
    outputPayload,
    durationMs,
  }: {
    flowType: string;
    inputPayload: Record<string, any>;
    outputPayload: Record<string, any>;
    durationMs: number;
  }) {
    this.flowType = flowType;
    this.inputPayload = inputPayload;
    this.outputPayload = outputPayload;
    this.durationMs = durationMs;
  }
}

export { ExecutionAgent };