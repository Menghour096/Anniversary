import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimerComponent } from './timer/timer.component';
import { MemoryFormComponent } from './memory-form/memory-form.component';
import { MemoryService, Memory } from './memory.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TimerComponent, MemoryFormComponent],
  template: `
    <main class="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 p-4 md:p-8 font-sans pb-20">
      <div class="max-w-4xl mx-auto space-y-8 mb-12 text-center pt-8">
        <h1 class="text-4xl md:text-5xl font-serif text-rose-800 font-bold drop-shadow-sm">Our Journey</h1>
        <p class="text-rose-600 mt-2 text-lg">Every moment counts.</p>
        <app-timer [startDate]="anniversaryDate"></app-timer>
      </div>

      <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-4">
          <app-memory-form *ngIf="!editingMemory; else editForm" (save)="onAddMemory($event)"></app-memory-form>
          <ng-template #editForm>
            <app-memory-form [editData]="editingMemory!" (save)="onUpdateMemory($event)" (cancel)="editingMemory = null"></app-memory-form>
          </ng-template>
        </div>

        <div class="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div *ngIf="memories().length === 0" class="col-span-full flex items-center justify-center h-48 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/40 border-dashed">
            <p class="text-rose-500 font-medium">No memories added yet.</p>
          </div>
          <div *ngFor="let memory of memories()" class="group relative bg-white/40 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col">
            <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button (click)="startEdit(memory)" class="bg-white/80 p-2 rounded-full text-rose-600">✎</button>
              <button (click)="deleteMemory(memory.id)" class="bg-white/80 p-2 rounded-full text-red-500">✕</button>
            </div>
            <div class="h-48 overflow-hidden relative">
              <img [src]="memory.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform" [alt]="memory.caption">
            </div>
            <div class="p-4 flex-1 flex flex-col justify-between">
              <p class="text-rose-900 font-medium italic">"{{ memory.caption }}"</p>
              <div class="mt-4 text-xs font-bold text-rose-500 uppercase">{{ memory.date | date:'mediumDate' }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `
})
export class AppComponent {
  memoryService = inject(MemoryService);
  memories = this.memoryService.memories;
  
  // 🔴 Update date here! format: YYYY-MM-DDTHH:MM:SS
  anniversaryDate = new Date('2021-05-15T00:00:00');
  editingMemory: Memory | null = null;

  onAddMemory(data: any) { this.memoryService.addMemory(data); }
  startEdit(memory: Memory) { this.editingMemory = memory; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  onUpdateMemory(data: any) {
    if (this.editingMemory) {
      this.memoryService.updateMemory(this.editingMemory.id, data);
      this.editingMemory = null;
    }
  }
  deleteMemory(id: string) {
    if (confirm('Are you sure?')) {
      this.memoryService.deleteMemory(id);
      if (this.editingMemory?.id === id) this.editingMemory = null;
    }
  }
}