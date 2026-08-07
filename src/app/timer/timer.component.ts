import { Component, Input, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white/30 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl p-6 text-center">
      <h2 class="text-2xl font-serif mb-4 text-rose-700">Time Together</h2>
      <div class="flex justify-center gap-4 text-center">
        <div class="flex flex-col">
          <span class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">{{ time().years }}</span>
          <span class="text-xs uppercase tracking-widest text-rose-600 font-semibold">Years</span>
        </div>
        <div class="text-2xl text-rose-400 mt-1">:</div>
        <div class="flex flex-col">
          <span class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">{{ time().days }}</span>
          <span class="text-xs uppercase tracking-widest text-rose-600 font-semibold">Days</span>
        </div>
        <div class="text-2xl text-rose-400 mt-1">:</div>
        <div class="flex flex-col">
          <span class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">{{ time().hours }}</span>
          <span class="text-xs uppercase tracking-widest text-rose-600 font-semibold">Hours</span>
        </div>
        <div class="text-2xl text-rose-400 mt-1">:</div>
        <div class="flex flex-col w-12">
          <span class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">{{ time().seconds }}</span>
          <span class="text-xs uppercase tracking-widest text-rose-600 font-semibold">Secs</span>
        </div>
      </div>
    </div>
  `
})
export class TimerComponent implements OnInit, OnDestroy {
  @Input() startDate: Date = new Date(); 
  time = signal({ years: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
  private intervalId: any;

  ngOnInit() {
    this.calculateTime();
    this.intervalId = setInterval(() => this.calculateTime(), 1000);
  }
  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
  private calculateTime() {
    const now = new Date().getTime();
    const start = this.startDate.getTime();
    const difference = now - start;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    this.time.set({
      years: Math.floor(days / 365),
      days: days % 365,
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    });
  }
}