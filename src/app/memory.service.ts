import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query } from '@angular/fire/firestore';

export interface Memory {
  id: string;
  imageUrl: string;
  caption: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private firestore = inject(Firestore);
  private memoriesCollection = collection(this.firestore, 'memories');
  
  memories = signal<Memory[]>([]);

  // 🔴 បញ្ចូល Cloud Name និង Preset Name របស់អ្នកនៅទីនេះ
  private cloudinaryName = 'anniversary_preset'; 
  private uploadPreset = 'anniversary_preset'; // ឧទាហរណ៍: anniversary_preset

  constructor() {
    const q = query(this.memoriesCollection);
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.memories.set(sortedData as Memory[]);
    });
  }

  // អនុគមន៍ថ្មីសម្រាប់ Upload ទៅកាន់ Cloudinary
  private async uploadToCloudinary(base64Image: string): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudinaryName}/image/upload`;
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    return data.secure_url; // នេះគឺជា Link រូបភាពដែល Upload រួច
  }

  async addMemory(memory: any) {
    let downloadUrl = '';
    if (memory.imageBase64) {
      downloadUrl = await this.uploadToCloudinary(memory.imageBase64);
    }

    await addDoc(this.memoriesCollection, {
      caption: memory.caption,
      date: memory.date,
      imageUrl: downloadUrl
    });
  }

  async updateMemory(id: string, updatedData: any) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    if (updatedData.imageBase64 && updatedData.imageBase64.startsWith('data:image')) {
        updatedData.imageUrl = await this.uploadToCloudinary(updatedData.imageBase64);
        delete updatedData.imageBase64;
    }
    await updateDoc(memoryDoc, updatedData);
  }

  async deleteMemory(id: string) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    await deleteDoc(memoryDoc);
  }
}