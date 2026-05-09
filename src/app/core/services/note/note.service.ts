import { Injectable, signal } from '@angular/core';

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

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private notes = signal<Note[]>([]);
  private nextId = 1;

  getNotes() {
    return this.notes;
  }

  getNoteById(id: string) {
    return this.notes().find(note => note.id === id);
  }

  createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) {
    const note: Note = {
      ...noteData,
      id: this.nextId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      versions: []
    };
    this.notes.update(notes => [...notes, note]);
    this.nextId++;
    return note;
  }

  updateNote(id: string, updates: Partial<Note>) {
    this.notes.update(notes =>
      notes.map(note => {
        if (note.id === id) {
          // Save version before update
          const updatedNote = { ...note, ...updates, updatedAt: new Date() };
          if (updates.content && updates.content !== note.content) {
            updatedNote.versions = [
              ...note.versions.slice(-4), // Keep last 5 versions
              { id: Date.now().toString(), content: note.content, timestamp: new Date() }
            ];
          }
          return updatedNote;
        }
        return note;
      })
    );
  }

  deleteNote(id: string) {
    this.notes.update(notes => notes.filter(note => note.id !== id));
  }

  pinNote(id: string, pinned: boolean) {
    this.updateNote(id, { isPinned: pinned });
  }

  getPinnedNotes() {
    return this.notes().filter(note => note.isPinned);
  }

  getNotesByFolder(folder: string) {
    return this.notes().filter(note => note.folder === folder);
  }

  searchNotes(query: string) {
    const lowerQuery = query.toLowerCase();
    return this.notes().filter(note =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  getFolders() {
    const folders = new Set<string>();
    this.notes().forEach(note => {
      if (note.folder) folders.add(note.folder);
    });
    return Array.from(folders);
  }
}