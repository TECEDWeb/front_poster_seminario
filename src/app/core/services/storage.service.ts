import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private tokenCache: string | null = null;
  private userCache: any = null;
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  // =========================
  // INIT (OBLIGATORIO)
  // =========================
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.tokenCache = await this.get(TOKEN_KEY);

      const userRaw = await this.get(USER_KEY);
      try {
        this.userCache = userRaw ? JSON.parse(userRaw) : null;
      } catch {
        this.userCache = null;
      }

      this.initialized = true;
      console.log('✅ StorageService inicializado');
    } catch (error) {
      console.error('❌ Error init StorageService:', error);
      this.initialized = false;
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
    return value || null;
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }

  async clear(): Promise<void> {
    await Preferences.clear();
    this.tokenCache = null;
    this.userCache = null;
    this.initialized = false;
    console.log('🧹 Storage limpiado');
  }

  // =========================
  // TOKEN
  // =========================
  async setToken(token: string): Promise<void> {
    this.tokenCache = token;
    await this.set(TOKEN_KEY, token);
    console.log('🔑 Token guardado en storage');
  }

  async getToken(): Promise<string | null> {
    if (this.tokenCache) return this.tokenCache;
    this.tokenCache = await this.get(TOKEN_KEY);
    return this.tokenCache;
  }

  async removeToken(): Promise<void> {
    this.tokenCache = null;
    await this.remove(TOKEN_KEY);
    console.log('🔑 Token removido del storage');
  }

  // =========================
  // USUARIO
  // =========================
  async setUsuario(usuario: any): Promise<void> {
    this.userCache = usuario;
    await this.set(USER_KEY, JSON.stringify(usuario));
    console.log('👤 Usuario guardado en storage');
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
    console.log('👤 Usuario removido del storage');
  }

  // =========================
  // UTILITY
  // =========================
  async getSession(): Promise<{ token: string | null; usuario: any | null }> {
    const token = await this.getToken();
    const usuario = await this.getUsuario();
    return { token, usuario };
  }

  async setSession(token: string, usuario: any): Promise<void> {
    await this.setToken(token);
    await this.setUsuario(usuario);
  }

  async removeSession(): Promise<void> {
    await this.removeToken();
    await this.removeUsuario();
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}