## Packages
framer-motion | For smooth page transitions and micro-interactions
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind classes efficiently

## Notes
- RTL Layout: The application uses `dir="rtl"` for Persian/Arabic support.
- Fonts: Using 'Vazirmatn' from Google Fonts for authentic Persian typography.
- Theme: Dark mode only, with neon cyan accents (#06b6d4) and glow effects.
- State:
  - Cart is client-side state (Context or simple state passed down).
  - Admin auth is simple client-side check (password "1234").
  - Products are fetched from backend via React Query.
- Images: Admin inputs image URLs directly (no file upload implemented per instructions).
