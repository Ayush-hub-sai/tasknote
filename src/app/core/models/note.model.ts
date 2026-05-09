export interface Note {
  id: string;
  title: string;
  content: string;
  folder?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments?: NoteAttachment[];
  versions: NoteVersion[];
}

export interface NoteAttachment {
  id: string;
  type: 'audio' | 'video' | 'image';
  url: string;
  name: string;
}

export interface NoteVersion {
  id: string;
  content: string;
  timestamp: Date;
}
