import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AgentService } from '../../../../core/services/agent/agent.service';

@Component({
  selector: 'app-media-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './media-page.component.html',
  styleUrls: ['./media-page.component.scss']
})
export class MediaPageComponent {
  recording = false;
  videoRecording = false;
  mediaLightboxOpen = false;
  agentDraft = '';
  readonly waveformBars = Array.from({ length: 10 });
  readonly mediaClips = [
    { type: 'Audio', title: 'Morning capture', detail: 'Transcript queued, 01:42', icon: 'graphic_eq' },
    { type: 'Video', title: 'Customer clip', detail: 'Highlight reel, 00:38', icon: 'movie' },
    { type: 'Image', title: 'Whiteboard scan', detail: 'OCR text extracted', icon: 'document_scanner' }
  ];

  constructor(private agentService: AgentService) {}

  toggleRecording() {
    this.recording = !this.recording;
  }

  toggleVideoRecording() {
    this.videoRecording = !this.videoRecording;
  }

  openMediaLightbox() {
    this.mediaLightboxOpen = true;
  }

  closeMediaLightbox() {
    this.mediaLightboxOpen = false;
  }

  draftFromVoice() {
    this.agentService.sendMessage('Draft a structured note from the latest voice transcript.').subscribe(response => {
      this.agentDraft = response;
    });
  }
}
