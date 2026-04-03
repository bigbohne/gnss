export type SendCallback = (data: Buffer) => void;

export class BufferCoalescer {
  private buffers: Buffer[] = [];
  private currentSize: number = 0;
  private timer: NodeJS.Timeout | null = null;
  private readonly MAX_SIZE = 300;
  private readonly MAX_WAIT = 100;

  constructor(private onFlush: SendCallback) {}

  /**
   * Adds a buffer to the queue and determines if we should flush immediately
   */
  public add(data: Buffer): void {
    // If a single buffer exceeds the limit, flush existing and then send new one
    if (data.length > this.MAX_SIZE) {
      this.flush();
      this.onFlush(data);
      return;
    }

    // Flush if adding this buffer would exceed the 300-byte limit
    if (this.currentSize + data.length > this.MAX_SIZE) {
      this.flush();
    }

    // Start the 100ms timer if this is the first item in a new batch
    if (this.buffers.length === 0) {
      this.timer = setTimeout(() => this.flush(), this.MAX_WAIT);
    }

    this.buffers.push(data);
    this.currentSize += data.length;

    // Optional: Immediate flush if we hit exactly the limit
    if (this.currentSize === this.MAX_SIZE) {
      this.flush();
    }
  }

  /**
   * Concatenates all queued buffers and sends them
   */
  public flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffers.length === 0) return;

    const combined = Buffer.concat(this.buffers);
    this.onFlush(combined);

    // Reset state
    this.buffers = [];
    this.currentSize = 0;
  }
}