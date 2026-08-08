import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { TimerComponent } from './timer/timer.component';
import { MemoryFormComponent } from './memory-form/memory-form.component';
import { MemoryService, Memory, CoupleProfile } from './memory.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, TimerComponent, MemoryFormComponent],
  
  // 🌟 បន្ថែម CSS សម្រាប់ Background លោតពណ៌ និង CSS Hearts (បេះដូងគូរដោយកូដ)
  styles: [`
    /* 1. ចលនាសម្រាប់ផ្ទៃខាងក្រោយ (Moving Gradient) */
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animated-gradient-bg {
      background: linear-gradient(-45deg, #ffe4e6, #fce7f3, #fff1f2, #fbcfe8);
      background-size: 400% 400%;
      animation: gradientShift 12s ease infinite;
    }

    /* 2. ចលនាសម្រាប់បេះដូងអណ្តែតឡើង (Floating Animation) */
    @keyframes floatUpHearts {
      0% { transform: translateY(10vh) scale(0.5); opacity: 0; }
      10% { opacity: 0.6; }
      90% { opacity: 0.6; }
      100% { transform: translateY(-110vh) scale(1.2); opacity: 0; }
    }
    
    .heart-wrapper {
      position: fixed;
      bottom: -10vh;
      animation: floatUpHearts linear infinite;
      z-index: 0;
    }
    
    /* 3. កូដគូររូបបេះដូង (CSS Heart Shape) 💖 */
    .heart-shape {
      position: relative;
      width: 20px;
      height: 20px;
      transform: rotate(-45deg);
    }
    .heart-shape::before,
    .heart-shape::after {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: inherit; /* យកពណ៌តាមតួកណ្ដាល */
    }
    .heart-shape::before {
      top: -10px;
      left: 0;
    }
    .heart-shape::after {
      top: 0;
      left: 10px;
    }
  `],

  template: `
    <main class="min-h-screen animated-gradient-bg p-4 md:p-8 font-sans pb-10 relative flex flex-col overflow-hidden">
      
      <!-- 🌟 CSS Floating Hearts Background 🌟 -->
      <div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div class="heart-wrapper" style="left: 10%; animation-duration: 12s; animation-delay: 0s;">
           <div class="heart-shape bg-rose-400"></div>
        </div>
        <div class="heart-wrapper" style="left: 30%; animation-duration: 15s; animation-delay: 4s;">
           <div class="heart-shape bg-pink-300" style="transform: scale(0.8) rotate(-45deg);"></div>
        </div>
        <div class="heart-wrapper" style="left: 50%; animation-duration: 18s; animation-delay: 2s;">
           <div class="heart-shape bg-rose-300" style="transform: scale(1.5) rotate(-45deg);"></div>
        </div>
        <div class="heart-wrapper" style="left: 70%; animation-duration: 14s; animation-delay: 7s;">
           <div class="heart-shape bg-pink-400" style="transform: scale(1.2) rotate(-45deg);"></div>
        </div>
        <div class="heart-wrapper" style="left: 85%; animation-duration: 20s; animation-delay: 1s;">
           <div class="heart-shape bg-rose-500" style="transform: scale(0.6) rotate(-45deg);"></div>
        </div>
        <div class="heart-wrapper" style="left: 20%; animation-duration: 17s; animation-delay: 5s;">
           <div class="heart-shape bg-pink-500" style="transform: scale(1.1) rotate(-45deg);"></div>
        </div>
        <div class="heart-wrapper" style="left: 60%; animation-duration: 13s; animation-delay: 8s;">
           <div class="heart-shape bg-rose-400" style="transform: scale(0.9) rotate(-45deg);"></div>
        </div>
        <div class="heart-wrapper" style="left: 80%; animation-duration: 16s; animation-delay: 3s;">
           <div class="heart-shape bg-pink-300" style="transform: scale(1.3) rotate(-45deg);"></div>
        </div>
      </div>

      <!-- 🔒 ផ្ទាំង Login -->
      <div *ngIf="!isLoggedIn" class="flex-1 flex flex-col items-center justify-center animate-fade-in-up relative z-10">
        <div class="bg-white/60 backdrop-blur-md p-8 sm:p-10 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-white/50 relative overflow-hidden">
          <div class="absolute -top-4 -left-4 text-4xl opacity-50 transform -rotate-12">💖</div>
          <div class="absolute -bottom-4 -right-4 text-4xl opacity-50 transform rotate-12">🌸</div>
          <div class="text-6xl animate-bounce mb-4">🔐</div>
          <h2 class="text-2xl sm:text-3xl font-bold text-rose-600 mb-2 font-serif drop-shadow-sm">Our Secret Diary</h2>
          <p class="text-rose-500 mb-6 text-sm font-medium">Please enter our secret code to unlock the memories.</p>
          <input type="password" [(ngModel)]="enteredCode" (keyup.enter)="checkLogin()" placeholder="Enter passcode..."
                 class="w-full px-4 py-3 rounded-full border-2 border-rose-200 focus:outline-none focus:border-rose-400 text-center text-rose-700 font-bold mb-4 bg-white/80 shadow-inner transition-colors">
          <p *ngIf="loginError" class="text-red-500 text-xs font-bold mb-4 animate-pulse">Incorrect code, please try again! 🥺</p>
          <button (click)="checkLogin()" class="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-full shadow-lg transition-transform transform hover:scale-105">
            Unlock Memories 🔓
          </button>
        </div>
      </div>

      <!-- 🌟 ផ្ទាំង Main Page -->
      <ng-container *ngIf="isLoggedIn">
        
        <!-- Profile Banner Section -->
        <div class="max-w-5xl w-full mx-auto rounded-3xl overflow-hidden shadow-2xl mb-8 relative group shrink-0 animate-fade-in-up z-10">
          <button (click)="openProfileForm()" class="absolute top-4 right-4 z-30 bg-white/30 hover:bg-white/90 text-white hover:text-rose-600 backdrop-blur-md px-3 py-2 rounded-full shadow-lg transition-all border border-white/50 text-sm font-bold">
             ✎ Edit Profile
          </button>
          <div class="h-72 sm:h-96 w-full relative">
            <img [src]="coupleProfile().backgroundUrl" class="w-full h-full object-cover" alt="Background">
            <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60"></div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center gap-2 sm:gap-16 px-2 pt-12">
             <div class="flex flex-col items-center z-10 text-white w-1/3">
                <img [src]="coupleProfile().person1.imageUrl" class="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white object-cover shadow-lg hover:scale-105 transition-transform">
                <h2 class="mt-3 text-sm sm:text-2xl font-bold drop-shadow-md text-center">{{coupleProfile().person1.name}}</h2>
                <p class="text-[9px] sm:text-sm font-medium text-pink-100 drop-shadow-md mt-0.5 tracking-wide">
                  🎂 {{ coupleProfile().person1.dob | date:'mediumDate' }}
                </p>
                <div class="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2">
                  <span class="bg-pink-500/90 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold backdrop-blur-sm shadow-md">
                    {{ coupleProfile().person1.gender === 'M' ? '♂' : '♀' }} {{ calculateAge(coupleProfile().person1.dob) }}
                  </span>
                  <span class="bg-[#8FBC8F]/90 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold backdrop-blur-sm shadow-md flex items-center gap-1">
                    {{ getZodiacSign(coupleProfile().person1.dob).icon }} {{ getZodiacSign(coupleProfile().person1.dob).sign }}
                  </span>
                </div>
             </div>
             
             <div class="flex flex-col items-center justify-center -mt-8 sm:-mt-12 z-20">
                <div class="text-4xl sm:text-7xl drop-shadow-2xl animate-pulse flex">
                  <span class="text-red-500 transform -rotate-12">❤️</span>
                  <span class="text-red-500 transform rotate-12 -ml-2 sm:-ml-4 mt-4 sm:mt-8">❤️</span>
                </div>
                <div class="mt-2 sm:mt-5 bg-black/20 backdrop-blur-md px-3 sm:px-5 py-1 sm:py-1.5 rounded-full border border-white/40 text-white font-medium text-[10px] sm:text-sm shadow-xl flex items-center gap-1 sm:gap-2 hover:bg-white/20 transition-colors">
                  <span>💍</span> Since {{ anniversaryDate | date:'longDate' }}
                </div>
             </div>
             
             <div class="flex flex-col items-center z-10 text-white w-1/3">
                <img [src]="coupleProfile().person2.imageUrl" class="w-24 h-24 sm:w-36 sm:h-36 rounded-full border-4 border-white object-cover shadow-lg hover:scale-105 transition-transform">
                <h2 class="mt-3 text-sm sm:text-2xl font-bold drop-shadow-md text-center">{{coupleProfile().person2.name}}</h2>
                <p class="text-[9px] sm:text-sm font-medium text-pink-100 drop-shadow-md mt-0.5 tracking-wide">
                  🎂 {{ coupleProfile().person2.dob | date:'mediumDate' }}
                </p>
                <div class="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2">
                  <span class="bg-pink-500/90 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold backdrop-blur-sm shadow-md">
                    {{ coupleProfile().person2.gender === 'M' ? '♂' : '♀' }} {{ calculateAge(coupleProfile().person2.dob) }}
                  </span>
                  <span class="bg-[#8FBC8F]/90 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm font-bold backdrop-blur-sm shadow-md flex items-center gap-1">
                    {{ getZodiacSign(coupleProfile().person2.dob).icon }} {{ getZodiacSign(coupleProfile().person2.dob).sign }}
                  </span>
                </div>
             </div>
          </div>
        </div>

        <!-- Timer & Add Button Section -->
        <div class="max-w-4xl w-full mx-auto space-y-4 mb-10 text-center shrink-0 z-10 relative">
          <app-timer [startDate]="anniversaryDate"></app-timer>
          <div class="pt-4">
            <button (click)="openAddForm()" class="bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center justify-center mx-auto gap-2 border-2 border-white/50">
              <span class="text-2xl leading-none -mt-1">+</span> Add Memory
            </button>
          </div>
        </div>

        <!-- Memories Grid -->
        <div class="max-w-6xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-start z-10 relative">
          <div *ngIf="memories().length === 0" class="col-span-full flex items-center justify-center h-48 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/40 border-dashed">
            <p class="text-rose-500 font-medium">No memories added yet.</p>
          </div>
          
          <div *ngFor="let memory of memories(); let i = index" class="group relative bg-white/40 backdrop-blur-md border border-white/50 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col">
            <div class="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button (click)="startEdit(memory)" class="bg-white/90 shadow-md p-2 rounded-full text-rose-600 hover:bg-white">✎</button>
              <button (click)="deleteMemory(memory.id)" class="bg-white/90 shadow-md p-2 rounded-full text-red-500 hover:bg-white">✕</button>
            </div>
            
            <div class="w-full overflow-hidden relative flex justify-center bg-black/5">
              <img [src]="memory.imageUrl" class="w-full h-auto object-contain group-hover:scale-105 transition-transform" [alt]="memory.caption">
            </div>
            
            <div class="p-4 flex-1 flex flex-col">
              <p class="text-rose-900 font-medium italic">"{{ memory.caption }}"</p>
              <div class="flex-1 flex items-center justify-center min-h-[3rem] mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <span class="text-3xl filter drop-shadow-sm group-hover:animate-bounce cursor-default">
                  {{ cuteStickers[i % cuteStickers.length] }}
                </span>
              </div>
              <div class="mt-3 text-xs font-bold text-rose-500 uppercase">{{ memory.date | date:'mediumDate' }}</div>
            </div>
          </div>
        </div>

        <!-- Bottom Custom Caption -->
        <div class="max-w-3xl mx-auto w-full text-center mt-16 pt-8 pb-4 shrink-0 border-t border-rose-200/60 z-10 relative">
          <p class="text-lg sm:text-xl md:text-2xl text-rose-600 font-serif italic drop-shadow-sm leading-relaxed">
            "{{ coupleProfile().bottomCaption || 'Every love story is beautiful, but ours is my favorite. ❤️' }}"
          </p>
        </div>
      </ng-container>

      <!-- Memory Add/Edit Modal -->
      <div *ngIf="showMemoryForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
        <div class="relative w-full max-w-md animate-fade-in-up">
          <button (click)="closeMemoryForm()" class="absolute -top-3 -right-3 z-50 bg-white text-rose-600 hover:text-white hover:bg-rose-500 transition-colors rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-xl border-2 border-rose-100">✕</button>
          <app-memory-form *ngIf="!editingMemory; else editMemoryTemplate" (save)="onAddMemory($event)"></app-memory-form>
          <ng-template #editMemoryTemplate>
            <app-memory-form [editData]="editingMemory!" (save)="onUpdateMemory($event)" (cancel)="closeMemoryForm()"></app-memory-form>
          </ng-template>
        </div>
      </div>

      <!-- Edit Profile Modal -->
      <div *ngIf="showProfileForm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity overflow-y-auto">
        <div class="relative w-full max-w-lg bg-white p-6 rounded-3xl shadow-2xl my-8">
          <button (click)="closeProfileForm()" class="absolute top-4 right-4 text-gray-400 hover:text-rose-500 font-bold text-xl">✕</button>
          <h2 class="text-2xl font-bold text-rose-600 mb-4 border-b pb-2">Edit Couple Profile</h2>
          
          <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-2" *ngIf="editProfileData">
            <div class="p-3 bg-pink-50 rounded-xl">
              <label class="block text-sm font-bold text-rose-700 mb-1">Background Image</label>
              <input type="file" (change)="onProfileImageSelected($event, 'bg')" class="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200">
            </div>

            <div class="p-3 bg-blue-50 rounded-xl border border-blue-100 space-y-2">
              <h3 class="font-bold text-blue-700">Person 1 (Left)</h3>
              <input type="text" [(ngModel)]="editProfileData.person1.name" placeholder="Name" class="w-full p-2 border rounded-lg">
              <div class="flex gap-2">
                <input type="date" [(ngModel)]="editProfileData.person1.dob" class="w-2/3 p-2 border rounded-lg">
                <select [(ngModel)]="editProfileData.person1.gender" class="w-1/3 p-2 border rounded-lg">
                  <option value="M">Male (♂)</option>
                  <option value="F">Female (♀)</option>
                </select>
              </div>
              <label class="block text-xs font-bold text-blue-700 mt-2">Profile Image</label>
              <input type="file" (change)="onProfileImageSelected($event, 'p1')" class="w-full text-sm">
            </div>

            <div class="p-3 bg-pink-50 rounded-xl border border-pink-100 space-y-2">
              <h3 class="font-bold text-pink-700">Person 2 (Right)</h3>
              <input type="text" [(ngModel)]="editProfileData.person2.name" placeholder="Name" class="w-full p-2 border rounded-lg">
              <div class="flex gap-2">
                <input type="date" [(ngModel)]="editProfileData.person2.dob" class="w-2/3 p-2 border rounded-lg">
                <select [(ngModel)]="editProfileData.person2.gender" class="w-1/3 p-2 border rounded-lg">
                  <option value="M">Male (♂)</option>
                  <option value="F">Female (♀)</option>
                </select>
              </div>
              <label class="block text-xs font-bold text-pink-700 mt-2">Profile Image</label>
              <input type="file" (change)="onProfileImageSelected($event, 'p2')" class="w-full text-sm">
            </div>

            <div class="p-3 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
              <label class="block text-sm font-bold text-gray-700 mb-1">Bottom Page Caption</label>
              <textarea [(ngModel)]="editProfileData.bottomCaption" rows="2" placeholder="Write a sweet message..." class="w-full p-2 border rounded-lg resize-none text-sm"></textarea>
            </div>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button (click)="closeProfileForm()" class="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-full font-bold transition">Cancel</button>
            <button (click)="saveProfile()" [disabled]="isSavingProfile" class="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold shadow-md transition disabled:opacity-50">
              {{ isSavingProfile ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  `
})
export class AppComponent {
  memoryService = inject(MemoryService);
  memories = this.memoryService.memories;
  coupleProfile = this.memoryService.profile; 
  
  anniversaryDate = new Date('2024-08-08T00:00:00');
  cuteStickers = ['🧸✨', '🎀💖', '🌸💕', '🌷💌', '🍓❤️', '🦋✨', '🍄💗', '🎀🧸'];

  isLoggedIn: boolean = false;
  enteredCode: string = '';
  secretPasscode: string = '08082024'; 
  loginError: boolean = false;

  editingMemory: Memory | null = null;
  showMemoryForm: boolean = false;
  showProfileForm: boolean = false;
  editProfileData: any = null;
  isSavingProfile: boolean = false;

  checkLogin() {
    if (this.enteredCode === this.secretPasscode) {
      this.isLoggedIn = true;
      this.loginError = false;
    } else {
      this.loginError = true;
      this.enteredCode = ''; 
    }
  }

  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }

  getZodiacSign(dob: string): { sign: string, icon: string } {
    const date = new Date(dob);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if ((month == 1 && day <= 20) || (month == 12 && day >= 22)) return {sign: 'Capricorn', icon: '♑'};
    if ((month == 1 && day >= 21) || (month == 2 && day <= 18)) return {sign: 'Aquarius', icon: '♒'};
    if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return {sign: 'Pisces', icon: '♓'};
    if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return {sign: 'Aries', icon: '♈'};
    if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return {sign: 'Taurus', icon: '♉'};
    if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return {sign: 'Gemini', icon: '♊'};
    if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return {sign: 'Cancer', icon: '♋'};
    if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return {sign: 'Leo', icon: '♌'};
    if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return {sign: 'Virgo', icon: '♍'};
    if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return {sign: 'Libra', icon: '♎'};
    if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return {sign: 'Scorpio', icon: '♏'};
    if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return {sign: 'Sagittarius', icon: '♐'};
    return {sign: '', icon: ''};
  }

  openProfileForm() {
    this.editProfileData = JSON.parse(JSON.stringify(this.coupleProfile()));
    if (!this.editProfileData.bottomCaption) {
      this.editProfileData.bottomCaption = 'Every love story is beautiful, but ours is my favorite. ❤️';
    }
    this.showProfileForm = true;
  }

  closeProfileForm() {
    this.showProfileForm = false;
    this.editProfileData = null;
  }

  onProfileImageSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'bg') this.editProfileData.backgroundBase64 = e.target.result;
        else if (type === 'p1') this.editProfileData.person1.imageBase64 = e.target.result;
        else if (type === 'p2') this.editProfileData.person2.imageBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    const confirmed = confirm("Are you sure you want to update the profile?");
    if (confirmed) {
      this.isSavingProfile = true;
      try {
        await this.memoryService.updateProfileSettings(this.editProfileData);
        this.closeProfileForm();
      } catch (error) {
        alert("មានបញ្ហាក្នុងការរក្សាទុក សូមព្យាយាមម្ដងទៀត!");
      }
      this.isSavingProfile = false;
    }
  }

  openAddForm() { this.editingMemory = null; this.showMemoryForm = true; }
  closeMemoryForm() { this.showMemoryForm = false; this.editingMemory = null; }
  onAddMemory(data: any) { this.memoryService.addMemory(data); this.closeMemoryForm(); }
  startEdit(memory: Memory) { this.editingMemory = memory; this.showMemoryForm = true; }
  onUpdateMemory(data: any) {
    if (this.editingMemory) {
      this.memoryService.updateMemory(this.editingMemory.id, data);
      this.closeMemoryForm();
    }
  }
  deleteMemory(id: string) {
    if (confirm('Are you sure you want to delete this memory?')) {
      this.memoryService.deleteMemory(id);
      if (this.editingMemory?.id === id) this.closeMemoryForm();
    }
  }
}