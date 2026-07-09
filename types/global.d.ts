export {};

declare global {
  interface Window {
    GREENOLA_CONFIG?: {
      supabaseUrl: string;
      supabaseKey: string;
    };
  }
}
