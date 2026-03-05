export class RingBuffer<T> {
  private buffer: (T | null)[];
  private size: number;
  private head: number = 0;
  private count: number = 0;

  constructor(size: number) {
    this.size = size;
    this.buffer = new Array(size).fill(null);
  }

  push(item: T) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.size;
    if (this.count < this.size) {
      this.count++;
    }
  }

  getAll(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head - this.count + i + this.size) % this.size;
      const item = this.buffer[index];
      if (item !== null) {
        result.push(item);
      }
    }
    return result;
  }

  getRecent(n: number): T[] {
    const take = Math.min(n, this.count);
    const result: T[] = [];
    for (let i = 0; i < take; i++) {
        const index = (this.head - take + i + this.size) % this.size;
        const item = this.buffer[index];
        if (item !== null) {
            result.push(item);
        }
    }
    return result;
  }
}
