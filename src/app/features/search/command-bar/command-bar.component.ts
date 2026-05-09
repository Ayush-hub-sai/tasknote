import { Component, ElementRef, ViewChild, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TaskService, Task } from '../../../core/services/task/task.service';
import { NoteService, Note } from '../../../core/services/note/note.service';

declare var Tesseract: any; // OCR library

@Component({
  selector: 'app-command-bar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './command-bar.component.html',
  styleUrls: ['./command-bar.component.scss']
})
export class CommandBarComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('waveformCanvas') waveformCanvas!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('scanCanvas') scanCanvas!: ElementRef;

  query = '';
  isOpen = false;
  showResults = false;
  mode: 'text' | 'audio' | 'scan' = 'text';
  isRecording = false;
  isScanning = false;

  taskResults: Task[] = [];
  noteResults: Note[] = [];
  recentSearches: string[] = [];

  private mediaRecorder?: MediaRecorder;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private animationFrame?: number;
  private stream?: MediaStream;
  private readonly isBrowser: boolean;
  private readonly keydownHandler = (event: KeyboardEvent) => this.handleGlobalKeydown(event);

  constructor(
    private taskService: TaskService,
    private noteService: NoteService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.loadRecentSearches();
    if (this.isBrowser) {
      this.document.addEventListener('keydown', this.keydownHandler);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      this.document.removeEventListener('keydown', this.keydownHandler);
    }
    this.stopRecording();
    this.stopScanning();
  }

  private handleGlobalKeydown(event: KeyboardEvent) {
    if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      this.toggleCommandBar();
    }
  }

  toggleCommandBar() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.isBrowser) {
      setTimeout(() => this.searchInput.nativeElement.focus(), 100);
    } else {
      this.resetState();
    }
  }

  private resetState() {
    this.query = '';
    this.showResults = false;
    this.mode = 'text';
    this.isRecording = false;
    this.isScanning = false;
    this.stopRecording();
    this.stopScanning();
  }

  onQueryChange() {
    if (this.query.trim()) {
      this.performSearch();
      this.showResults = true;
    } else {
      this.showResults = false;
      this.taskResults = [];
      this.noteResults = [];
    }
  }

  private performSearch() {
    this.taskResults = this.taskService.searchTasks(this.query);
    this.noteResults = this.noteService.searchNotes(this.query);
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.isOpen = false;
      this.resetState();
    } else if (event.key === 'Enter') {
      this.saveRecentSearch();
    }
  }

  onFocus() {
    this.showResults = !!this.query.trim();
  }

  onBlur() {
    // Delay to allow clicking on results
    setTimeout(() => {
      this.showResults = false;
    }, 200);
  }

  getPlaceholder() {
    switch (this.mode) {
      case 'audio': return 'Listening...';
      case 'scan': return 'Point camera at text...';
      default: return 'Search tasks and notes... (⌘K)';
    }
  }

  toggleAudioMode() {
    if (this.mode === 'audio') {
      this.mode = 'text';
      this.stopRecording();
    } else {
      this.mode = 'audio';
      this.startRecording();
    }
  }

  private async startRecording() {
    if (!this.isBrowser || !navigator.mediaDevices || typeof MediaRecorder === 'undefined') return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.isRecording = true;

      // Setup audio analysis for waveform
      this.setupAudioAnalysis();

      this.mediaRecorder.ondataavailable = (event) => {
        // Handle audio data
      };

      this.mediaRecorder.onstop = () => {
        this.processAudioToText();
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  private setupAudioAnalysis() {
    if (!this.isBrowser || !this.stream) return;

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.analyser);

    this.analyser.fftSize = 256;
    this.drawWaveform();
  }

  private drawWaveform() {
    if (!this.isBrowser || !this.analyser || !this.waveformCanvas) return;

    const canvas = this.waveformCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      this.analyser!.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'var(--background-color)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'var(--primary-color)';
      const barWidth = canvas.width / bufferLength;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      this.animationFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.stream?.getTracks().forEach(track => track.stop());
      this.isRecording = false;
      if (this.isBrowser && this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
      }
    }
  }

  private async processAudioToText() {
    if (!this.isBrowser) return;

    // Use Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.query = transcript;
      this.mode = 'text';
      this.onQueryChange();
    };

    recognition.start();
  }

  toggleScanMode() {
    if (this.mode === 'scan') {
      this.mode = 'text';
      this.stopScanning();
    } else {
      this.mode = 'scan';
      this.startScanning();
    }
  }

  private async startScanning() {
    if (!this.isBrowser || !navigator.mediaDevices) return;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.isScanning = true;
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  }

  stopScanning() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.isScanning = false;
    }
  }

  async captureAndOCR() {
    if (!this.isBrowser || typeof Tesseract === 'undefined') return;

    const video = this.videoElement.nativeElement;
    const canvas = this.scanCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Use Tesseract.js for OCR
    try {
      const result = await Tesseract.recognize(canvas.toDataURL());
      this.query = result.data.text;
      this.mode = 'text';
      this.onQueryChange();
      this.stopScanning();
    } catch (error) {
      console.error('OCR failed:', error);
    }
  }

  setQuery(search: string) {
    this.query = search;
    this.onQueryChange();
  }

  private saveRecentSearch() {
    if (!this.isBrowser) return;

    if (this.query.trim() && !this.recentSearches.includes(this.query)) {
      this.recentSearches.unshift(this.query);
      this.recentSearches = this.recentSearches.slice(0, 10); // Keep last 10
      localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    }
  }

  private loadRecentSearches() {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        this.recentSearches = JSON.parse(saved);
      } catch {
        this.recentSearches = [];
      }
    }
  }
}
