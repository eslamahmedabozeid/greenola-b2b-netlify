export {};

declare global {
  interface Window {
    GREENOLA_CONFIG?: {
      supabaseUrl: string;
      supabaseKey: string;
      checkoutApiUrl?: string;
    };
    wpwlOptions?: {
      style?: string;
      locale?: string;
      brandDetection?: boolean;
      showCVVHint?: boolean;
      requireCardHolder?: boolean;
      showOneClickWidget?: boolean;
      hideOtherPaymentButton?: boolean;
      paymentTarget?: string;
      spinner?: {
        lines?: number;
        length?: number;
        width?: number;
        radius?: number;
        color?: string;
      };
      showLabels?: boolean;
      showPlaceholders?: boolean;
      labels?: Record<string, string>;
      onReady?: () => void;
      onBeforeSubmitCard?: () => boolean;
      onError?: (error: { name?: string; message?: string }) => void;
    };
  }
}
