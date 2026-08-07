import { Component, EventEmitter, Output, Input, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Memory } from '../memory.service';

@Component({
  selector: 'app-memory-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="memoryForm" (ngSubmit)="onSubmit()" class="bg-white/30 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-6 flex flex-col gap-4">
      <h3 class="text-xl font-serif text-rose-800">{{ isEdit ? 'Update Memory' : 'Add New Memory' }}</h3>
      
      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-rose-700">Photo</label>
        <input type="file" (change)="onFileSelected($event)" accept="image/*"
               class="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 transition-all text-sm text-rose-900" />
        
        <div *ngIf="previewImage" class="mt-2 h-32 w-32 rounded-xl overflow-hidden border-2 border-white/50">
          <img [src]="previewImage" class="object-cover h-full w-full" alt="Preview"/>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-rose-700">Date</label>
        <input type="date" formControlName="date" class="p-2 rounded-lg bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"/>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-sm font-semibold text-rose-700">Caption</label>
        <textarea formControlName="caption" rows="2" class="p-2 rounded-lg bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-rose-400 text-rose-900"></textarea>
      </div>

      <div class="flex gap-2 justify-end mt-2">
        <button type="button" *ngIf="isEdit" (click)="cancel.emit()" class="px-4 py-2 rounded-lg text-rose-700 hover:bg-rose-100">Cancel</button>
        <button type="submit" [disabled]="memoryForm.invalid || !previewImage" class="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white shadow-md disabled:opacity-50">
          {{ isEdit ? 'Save Changes' : 'Add Memory' }}
        </button>
      </div>
    </form>
  `
})
export class MemoryFormComponent implements OnInit {
  @Input() editData?: Memory;
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  memoryForm: FormGroup;
  previewImage: string = '';
  isEdit = false;
  private cdr = inject(ChangeDetectorRef);

  constructor(private fb: FormBuilder) {
    this.memoryForm = this.fb.group({
      caption: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.editData) {
      this.isEdit = true;
      this.previewImage = this.editData.imageUrl;
      this.memoryForm.patchValue({
        caption: this.editData.caption,
        date: this.editData.date
      });
    }
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { 
        this.previewImage = reader.result as string; 
        this.cdr.detectChanges(); // 🔴 ការពារ Error NG0100
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.memoryForm.valid && this.previewImage) {
      this.save.emit({ ...this.memoryForm.value, imageBase64: this.previewImage });
      if (!this.isEdit) {
        this.memoryForm.reset();
        this.previewImage = '';
      }
    }
  }
}