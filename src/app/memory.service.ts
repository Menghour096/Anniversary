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

  // 🔴 កុំភ្លេចប្ដូរ 'ដាក់_CLOUD_NAME_ពិតប្រាកដនៅទីនេះ' ទៅជា Cloud Name របស់អ្នក
  private cloudinaryName = 'hveaosx1'; 
  private uploadPreset = 'anniversary_preset'; 

  constructor() {
    const q = query(this.memoriesCollection);
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.memories.set(sortedData as Memory[]);
    });
  }

  // អនុគមន៍សម្រាប់ Upload ទៅកាន់ Cloudinary ដែលមានភ្ជាប់ប្រព័ន្ធចាប់ Error
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

    // ប្រព័ន្ធចាប់ Error
    if (!response.ok) {
      console.error('Cloudinary Error:', data);
      alert('បរាជ័យក្នុងការបញ្ជូនរូបភាព! សូមពិនិត្យមើល Cloud Name របស់អ្នកម្ដងទៀត។');
      throw new Error('Image upload failed');
    }

    return data.secure_url; 
  }

  async addMemory(memory: any) {
    try {
      let downloadUrl = '';
      if (memory.imageBase64) {
        downloadUrl = await this.uploadToCloudinary(memory.imageBase64);
      }

      await addDoc(this.memoriesCollection, {
        caption: memory.caption,
        date: memory.date,
        imageUrl: downloadUrl
      });
      console.log("Memory Added Successfully!");
    } catch (error) {
      console.error("Error saving memory:", error);
    }
  }

  async updateMemory(id: string, updatedData: any) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    try {
      if (updatedData.imageBase64 && updatedData.imageBase64.startsWith('data:image')) {
          updatedData.imageUrl = await this.uploadToCloudinary(updatedData.imageBase64);
          delete updatedData.imageBase64;
      }
      await updateDoc(memoryDoc, updatedData);
    } catch (error) {
      console.error("Error updating memory:", error);
    }
  }

  async deleteMemory(id: string) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    await deleteDoc(memoryDoc);
  }
}