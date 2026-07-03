import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private tokenCache: string | null = null;
  private userCache: any = null;

  // =========================
  // INIT (OBLIGATORIO)
  // =========================
  async init(): Promise<void> {
    this.tokenCache = await this.get(TOKEN_KEY);

    const userRaw = await this.get(USER_KEY);
    try {
      this.userCache = userRaw ? JSON.parse(userRaw) : null;
    } catch {
      this.userCache = null;
    }
  }

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
    this.tokenCache = null;
    this.userCache = null;
  }

  // =========================
  // TOKEN
  // =========================
  async setToken(token: string): Promise<void> {
    this.tokenCache = token;
    await this.set(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    if (this.tokenCache) return this.tokenCache;
    this.tokenCache = await this.get(TOKEN_KEY);
    return this.tokenCache;
  }

  async removeToken(): Promise<void> {
    this.tokenCache = null;
    await this.remove(TOKEN_KEY);
  }

  // =========================
  // USUARIO
  // =========================
  async setUsuario(usuario: any): Promise<void> {
    this.userCache = usuario;
    await this.set(USER_KEY, JSON.stringify(usuario));
  }

  async getUsuario<T = any>(): Promise<T | null> {
    if (this.userCache) return this.userCache;

    const raw = await this.get(USER_KEY);
    if (!raw) return null;

    try {
      this.userCache = JSON.parse(raw);
      return this.userCache;
    } catch {
      return null;
    }
  }

  async removeUsuario(): Promise<void> {
    this.userCache = null;
    await this.remove(USER_KEY);
  }
}