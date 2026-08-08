import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, deleteDoc, updateDoc, query, docData, setDoc } from '@angular/fire/firestore';

export interface Memory { id: string; imageUrl: string; caption: string; date: string; }
// 🟢 បង្កើតទម្រង់ទិន្នន័យសម្រាប់ Profile
export interface CoupleProfile {
  backgroundUrl: string;
  person1: { name: string; dob: string; imageUrl: string; gender: string };
  person2: { name: string; dob: string; imageUrl: string; gender: string };
}

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private firestore = inject(Firestore);
  private memoriesCollection = collection(this.firestore, 'memories');
  private profileDoc = doc(this.firestore, 'settings/profile'); // 🟢 កន្លែងផ្ទុក Profile ក្នុង Database
  
  memories = signal<Memory[]>([]);
  
  // 🟢 Profile ដើម (វានឹងបង្ហាញទិន្នន័យនេះ បើអ្នកមិនទាន់បាន Edit)
  defaultProfile: CoupleProfile = {
    backgroundUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=2070&auto=format&fit=crop',
    person1: { name: 'Heng Menghour', dob: '2006-06-19', imageUrl: 'https://i.pravatar.cc/300?img=11', gender: 'M' },
    person2: { name: 'Thuo Seanghong', dob: '2006-05-13', imageUrl: 'https://i.pravatar.cc/300?img=5', gender: 'F' }
  };
  profile = signal<CoupleProfile>(this.defaultProfile);

  // 🔴 កុំភ្លេចប្ដូរឈ្មោះ Cloud Name របស់អ្នកត្រលប់មកវិញ!
  private cloudinaryName = 'hveaosx1'; 
  private uploadPreset = 'anniversary_preset'; 

  constructor() {
    // ទាញយកអត្ថបទអនុស្សាវរីយ៍
    const q = query(this.memoriesCollection);
    collectionData(q, { idField: 'id' }).subscribe((data: any[]) => {
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      this.memories.set(sortedData as Memory[]);
    });

    // 🟢 ទាញយក Profile ពី Database ជាក់ស្តែង
    docData(this.profileDoc).subscribe((data: any) => {
      if (data) {
        this.profile.set(data as CoupleProfile);
      }
    });
  }

  // អនុគមន៍ Upload រូបទៅកាន់ Cloudinary
  private async uploadToCloudinary(base64Image: string): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudinaryName}/image/upload`;
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', this.uploadPreset);
    const response = await fetch(url, { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) {
      console.error('Cloudinary Error:', data);
      alert('បរាជ័យក្នុងការបញ្ជូនរូបភាព! សូមពិនិត្យមើល Cloud Name។');
      throw new Error('Image upload failed');
    }
    return data.secure_url; 
  }

  // 🟢 អនុគមន៍ថ្មីសម្រាប់ Update Profile
  async updateProfileSettings(profileData: any) {
    // ប្រសិនបើមានការជ្រើសរើសរូបភាពថ្មី វានឹង Upload សិន
    if (profileData.backgroundBase64) {
      profileData.backgroundUrl = await this.uploadToCloudinary(profileData.backgroundBase64);
      delete profileData.backgroundBase64;
    }
    if (profileData.person1.imageBase64) {
      profileData.person1.imageUrl = await this.uploadToCloudinary(profileData.person1.imageBase64);
      delete profileData.person1.imageBase64;
    }
    if (profileData.person2.imageBase64) {
      profileData.person2.imageUrl = await this.uploadToCloudinary(profileData.person2.imageBase64);
      delete profileData.person2.imageBase64;
    }
    // រក្សាទុកចូលក្នុង Firebase
    await setDoc(this.profileDoc, profileData, { merge: true });
  }

  async addMemory(memory: any) {
    try {
      let downloadUrl = '';
      if (memory.imageBase64) downloadUrl = await this.uploadToCloudinary(memory.imageBase64);
      await addDoc(this.memoriesCollection, { caption: memory.caption, date: memory.date, imageUrl: downloadUrl });
    } catch (error) { console.error("Error saving memory:", error); }
  }

  async updateMemory(id: string, updatedData: any) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    try {
      if (updatedData.imageBase64 && updatedData.imageBase64.startsWith('data:image')) {
          updatedData.imageUrl = await this.uploadToCloudinary(updatedData.imageBase64);
          delete updatedData.imageBase64;
      }
      await updateDoc(memoryDoc, updatedData);
    } catch (error) { console.error("Error updating memory:", error); }
  }

  async deleteMemory(id: string) {
    const memoryDoc = doc(this.firestore, `memories/${id}`);
    await deleteDoc(memoryDoc);
  }
}