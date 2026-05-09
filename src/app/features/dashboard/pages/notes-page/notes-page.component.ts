import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Note } from '../../../../core/models/note.model';
import { NoteService } from '../../../../core/services/note/note.service';

@Component({
  selector: 'app-notes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './notes-page.component.html',
  styleUrls: ['./notes-page.component.scss']
})
export class NotesPageComponent {
  newNoteTitle = '';
  markdownPreview = signal(true);
  notes = computed(() => this.noteService.getNotes()());
  folders = computed(() => this.noteService.getFolders());
  pinnedCount = computed(() => this.notes().filter(note => note.isPinned).length);

  constructor(private noteService: NoteService) {}

  addNote() {
    this.noteService.createNote({
      title: this.newNoteTitle.trim() || 'Untitled note',
      content: 'New note captured from the notes workspace.',
      folder: 'Inbox',
      tags: ['note-page'],
      isPinned: false,
      attachments: []
    });
    this.newNoteTitle = '';
  }

  togglePin(note: Note) {
    this.noteService.pinNote(note.id, !note.isPinned);
  }

  appendActionItem(note: Note) {
    this.noteService.updateNote(note.id, {
      content: `${note.content}\n- Action item added from Notes workspace`
    });
  }

  deleteNote(note: Note) {
    this.noteService.deleteNote(note.id);
  }
}
