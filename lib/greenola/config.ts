export const greenolaConfig = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    "https://rcijhstzwwuhqiwxtzoa.supabase.co",
  supabaseKey:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjaWpoc3R6d3d1aHFpd3h0em9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNjMyMjIsImV4cCI6MjA5MTkzOTIyMn0.aaguE99pR4u5J-uOW08M4cvuCmCA1IYSiN_LO9rwVZY",
  checkoutApiUrl: "/api/payment/checkout",
};
