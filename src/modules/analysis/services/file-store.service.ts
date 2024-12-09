import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface StoredFile {
  buffer: Buffer;
  text: string;
}

@Injectable()
export class FileStoreService {
  // TODO: Replace with actual file storage in production
  private fileStore: Map<string, StoredFile> = new Map();

  async storeFile(buffer: Buffer, text: string): Promise<string> {
    const fileId = randomUUID();
    this.fileStore.set(fileId, { buffer, text });
    return fileId;
  }

  getFile(fileId: string): StoredFile | undefined {
    return this.fileStore.get(fileId);
  }

  deleteFile(fileId: string): boolean {
    return this.fileStore.delete(fileId);
  }
} 