import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class StorageService {

  // =========================
  // CORE
  // =========================
  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
  }

  // =========================
  // TOKEN
  // =========================
  async setToken(token: string): Promise<void> {
    await this.set(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return this.get(TOKEN_KEY);
  }

  async removeToken(): Promise<void> {
    await this.remove(TOKEN_KEY);
  }

  // =========================
  // USUARIO
  // =========================
  async setUsuario(usuario: any): Promise<void> {
    await this.set(USER_KEY, JSON.stringify(usuario));
  }

  async getUsuario<T = any>(): Promise<T | null> {
    const raw = await this.get(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async removeUsuario(): Promise<void> {
    await this.remove(USER_KEY);
  }
}