import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query } from '@angular/fire/firestore';
import { Storage, ref, uploadString, getDownloadURL } from '@angular/fire/storage';

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
  private storage = inject(Storage);
  private memoriesCollection = collection(this.firestore, 'memories');
  
  memories = signal<Memory[]>([]);

  constructor() {
    // 🔴 ត្រូវរុំ collection ជាមួយ query() ទីនេះ ដើម្បីបំបាត់ Error _Query
    const q = query(this.memoriesCollection);
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.memories.set(sortedData as Memory[]);
    });
  }

  async addMemory(memory: any) {
    const filePath = `memories/${Date.now()}`;
    const storageRef = ref(this.storage, filePath);
    await uploadString(storageRef, memory.imageBase64, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);

    await addDoc(this.memoriesCollection, {
      caption: memory.caption,
      date: memory.date,
      imageUrl: downloadUrl
    });
  }

  async updateMemory(id: string, updatedData: any) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    if (updatedData.imageBase64 && updatedData.imageBase64.startsWith('data:image')) {
        const filePath = `memories/${Date.now()}`;
        const storageRef = ref(this.storage, filePath);
        await uploadString(storageRef, updatedData.imageBase64, 'data_url');
        updatedData.imageUrl = await getDownloadURL(storageRef);
        delete updatedData.imageBase64;
    }
    await updateDoc(memoryDoc, updatedData);
  }

  async deleteMemory(id: string) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    await deleteDoc(memoryDoc);
  }
}