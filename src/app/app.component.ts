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
    <main class="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 p-4 md:p-8 font-sans pb-20 relative">
      
      <!-- Top Header Section -->
      <div class="max-w-4xl mx-auto space-y-6 mb-12 text-center pt-8">
        <h1 class="text-4xl md:text-5xl font-serif text-rose-800 font-bold drop-shadow-sm">HENG MENGHOUR <br>❤️<br>THOU SEANGHONG</h1>
        <p class="text-rose-600 mt-2 text-lg">START DATE 08-08-2024</p>
        <app-timer [startDate]="anniversaryDate"></app-timer>

        <!-- 🌟 New Add Memory Button -->
        <div class="pt-6">
          <button (click)="openAddForm()" class="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center mx-auto gap-2 border-2 border-white/50">
            <span class="text-2xl leading-none -mt-1">+</span> Add Memory
          </button>
        </div>
      </div>

      <!-- Memories Grid (Now Full Width - 3 columns on large screens) -->
      <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <!-- Empty State -->
        <div *ngIf="memories().length === 0" class="col-span-full flex items-center justify-center h-48 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/40 border-dashed">
          <p class="text-rose-500 font-medium">No memories added yet.</p>
        </div>

        <!-- Memory Cards -->
        <div *ngFor="let memory of memories()" class="group relative bg-white/40 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col">
          <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button (click)="startEdit(memory)" class="bg-white/90 shadow-md p-2 rounded-full text-rose-600 hover:bg-white">✎</button>
            <button (click)="deleteMemory(memory.id)" class="bg-white/90 shadow-md p-2 rounded-full text-red-500 hover:bg-white">✕</button>
          </div>
          
          <!-- Image Box (Full Aspect Ratio Version) -->
          <div class="w-full overflow-hidden relative flex justify-center bg-black/5">
            <img [src]="memory.imageUrl" class="w-full h-auto object-contain group-hover:scale-105 transition-transform" [alt]="memory.caption">
          </div>
          
          <div class="p-4 flex-1 flex flex-col justify-between">
            <p class="text-rose-900 font-medium italic">"{{ memory.caption }}"</p>
            <div class="mt-4 text-xs font-bold text-rose-500 uppercase">{{ memory.date | date:'mediumDate' }}</div>
          </div>
        </div>

      </div>

      <!-- 🌟 Modal Popup Overlay for the Form -->
      <div *ngIf="showForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
        <div class="relative w-full max-w-md animate-fade-in-up">
          
          <!-- Close Modal Button (The X button) -->
          <button (click)="closeForm()" class="absolute -top-3 -right-3 z-50 bg-white text-rose-600 hover:text-white hover:bg-rose-500 transition-colors rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-xl border-2 border-rose-100">
            ✕
          </button>

          <!-- The Form Component -->
          <app-memory-form *ngIf="!editingMemory; else editForm" (save)="onAddMemory($event)"></app-memory-form>
          <ng-template #editForm>
            <app-memory-form [editData]="editingMemory!" (save)="onUpdateMemory($event)" (cancel)="closeForm()"></app-memory-form>
          </ng-template>

        </div>
      </div>

    </main>
  `
})
export class AppComponent {
  memoryService = inject(MemoryService);
  memories = this.memoryService.memories;
  
  // Update date here! format: YYYY-MM-DDTHH:MM:SS
  anniversaryDate = new Date('2024-08-08T00:00:00');
  
  editingMemory: Memory | null = null;
  showForm: boolean = false; // 🌟 Controls whether the modal is open or closed

  // 🌟 Logic for opening and closing the Modal
  openAddForm() {
    this.editingMemory = null;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingMemory = null;
  }

  // 🌟 Auto-close modal after saving
  onAddMemory(data: any) { 
    this.memoryService.addMemory(data); 
    this.closeForm(); 
  }

  startEdit(memory: Memory) { 
    this.editingMemory = memory; 
    this.showForm = true; 
  }

  onUpdateMemory(data: any) {
    if (this.editingMemory) {
      this.memoryService.updateMemory(this.editingMemory.id, data);
      this.closeForm();
    }
  }

  deleteMemory(id: string) {
    if (confirm('Are you sure you want to delete this memory?')) {
      this.memoryService.deleteMemory(id);
      if (this.editingMemory?.id === id) this.closeForm();
    }
  }
}