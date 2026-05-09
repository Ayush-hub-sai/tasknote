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
  private notes = signal<Note[]>(this.createSeedNotes());
  private nextId = 5;

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

  private createSeedNotes(): Note[] {
    const now = new Date();

    return [
      {
        id: '1',
        title: 'Launch positioning',
        content: 'TaskNote should feel like a smart cockpit: fast capture, calm planning, and agent-assisted follow-through.',
        folder: 'Strategy',
        tags: ['launch', 'positioning'],
        isPinned: true,
        createdAt: new Date(now.getTime() - 86400000),
        updatedAt: now,
        attachments: [{ id: 'n1-a1', type: 'image', url: '', name: 'dashboard-moodboard.png' }],
        versions: [
          { id: 'v1', content: 'TaskNote positioning draft.', timestamp: new Date(now.getTime() - 172800000) },
          { id: 'v2', content: 'TaskNote should feel like a smart cockpit.', timestamp: new Date(now.getTime() - 86400000) }
        ]
      },
      {
        id: '2',
        title: 'Voice note transcript',
        content: 'Turn rough voice captures into structured notes, then let the agent suggest tags and subtasks.',
        folder: 'Ideas',
        tags: ['audio', 'ai'],
        isPinned: true,
        createdAt: new Date(now.getTime() - 172800000),
        updatedAt: now,
        attachments: [{ id: 'n2-a1', type: 'audio', url: '', name: 'morning-capture.webm' }],
        versions: [
          { id: 'v1', content: 'Voice capture idea.', timestamp: new Date(now.getTime() - 172800000) }
        ]
      },
      {
        id: '3',
        title: 'Customer interview clips',
        content: 'Users want one place to keep task context, meeting notes, screenshots, and short videos.',
        folder: 'Research',
        tags: ['video', 'research'],
        isPinned: false,
        createdAt: new Date(now.getTime() - 259200000),
        updatedAt: now,
        attachments: [{ id: 'n3-a1', type: 'video', url: '', name: 'interview-highlight.mp4' }],
        versions: []
      },
      {
        id: '4',
        title: 'Markdown checklist',
        content: '## Release checklist\n- Verify themes\n- Test command bar\n- Review keyboard shortcuts\n- Validate reduced motion',
        folder: 'Planning',
        tags: ['markdown', 'release'],
        isPinned: true,
        createdAt: new Date(now.getTime() - 3600000),
        updatedAt: now,
        attachments: [],
        versions: []
      }
    ];
  }
}
