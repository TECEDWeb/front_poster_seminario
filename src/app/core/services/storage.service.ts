import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'token';
const USER_KEY = 'usuario';

@Injectable({ providedIn: 'root' })
export class StorageService {

  private tokenCache: string | null = null;
  private userCache: any = null;
  private initialized: boolean = false;
  private isWeb: boolean = false;

  constructor() {
    // Detectar si estamos en web (navegador)
    this.isWeb = !window?.hasOwnProperty('Capacitor');
    console.log('📌 StorageService - Modo:', this.isWeb ? 'WEB (localStorage)' : 'NATIVO (Capacitor)');
    this.init();
  }

  // =========================
  // INIT
  // =========================
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Si es web, usar localStorage
      if (this.isWeb) {
        this.tokenCache = localStorage.getItem(TOKEN_KEY);
        const userRaw = localStorage.getItem(USER_KEY);
        this.userCache = userRaw ? JSON.parse(userRaw) : null;
        console.log('✅ StorageService inicializado en WEB - Token:', this.tokenCache ? '✅ Existe' : '❌ No existe');
      } else {
        // Si es nativo, usar Capacitor Preferences
        this.tokenCache = await this.get(TOKEN_KEY);
        const userRaw = await this.get(USER_KEY);
        this.userCache = userRaw ? JSON.parse(userRaw) : null;
        console.log('✅ StorageService inicializado en NATIVO - Token:', this.tokenCache ? '✅ Existe' : '❌ No existe');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Error init StorageService:', error);
      this.initialized = false;
    }
  }

  // =========================
  // CORE
  // =========================
  async set(key: string, value: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(key, value);
    } else {
      await Preferences.set({ key, value });
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(key);
    } else {
      const { value } = await Preferences.get({ key });
      return value || null;
    }
  }

  async remove(key: string): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(key);
    } else {
      await Preferences.remove({ key });
    }
  }

  async clear(): Promise<void> {
    if (this.isWeb) {
      localStorage.clear();
    } else {
      await Preferences.clear();
    }
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

  // =========================
  // MÉTODO PARA FORZAR RECARGA
  // =========================
  async recargar(): Promise<void> {
    this.initialized = false;
    this.tokenCache = null;
    this.userCache = null;
    await this.init();
  }

  // =========================
  // SINCronizar TOKEN (WEB -> NATIVO)
  // =========================
  async sincronizarToken(): Promise<void> {
    if (this.isWeb) {
      // Si estamos en web, copiar token de localStorage a Capacitor
      const token = localStorage.getItem(TOKEN_KEY);
      const usuario = localStorage.getItem(USER_KEY);
      if (token) {
        await Preferences.set({ key: TOKEN_KEY, value: token });
        console.log('✅ Token sincronizado de localStorage a Capacitor');
      }
      if (usuario) {
        await Preferences.set({ key: USER_KEY, value: usuario });
        console.log('✅ Usuario sincronizado de localStorage a Capacitor');
      }
    } else {
      // Si estamos en nativo, copiar token de Capacitor a localStorage
      const token = await Preferences.get({ key: TOKEN_KEY });
      const usuario = await Preferences.get({ key: USER_KEY });
      if (token && token.value) {
        localStorage.setItem(TOKEN_KEY, token.value);
        console.log('✅ Token sincronizado de Capacitor a localStorage');
      }
      if (usuario && usuario.value) {
        localStorage.setItem(USER_KEY, usuario.value);
        console.log('✅ Usuario sincronizado de Capacitor a localStorage');
      }
    }
  }
}