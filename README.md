# heyjustin.dev

A personal website with an iOS 6 skeuomorphic aesthetic. Built as a love letter to the golden era of mobile design.

## Features

- **iOS 6-inspired design**: Skeuomorphic icons with gloss effects, leather textures, lined notepad paper
- **Three "apps"**:
  - **Notes**: Blog posts styled like the classic iOS Notes app with yellow lined paper
  - **About**: Contact card-style bio with brushed metal and linen textures  
  - **Photos**: Photo gallery with iOS-style grid and fullscreen viewer
- **Responsive**: Works on desktop (displays as an iPhone frame) and mobile (fullscreen)
- **Static site**: Easy deployment to GitHub Pages, Vercel, Netlify, etc.

## Tech Stack

- React 19.2 + TypeScript 5.9
- Vite 7.2
- Vanilla CSS (no Tailwind/frameworks)
- React Router 7 for navigation

## Getting Started

```bash
# Install dependencies (using bun)
bun install

# Or with npm
npm install

# Run development server
bun run dev

# Build for production
bun run build

# Type check
bun run typecheck

# Preview production build
bun run preview
```

## Deployment

### GitHub Pages

1. Update `vite.config.ts` to set `base` to your repo name:
   ```ts
   export default defineConfig({
     base: '/your-repo-name/',
     plugins: [react()],
   })
   ```

2. Build and deploy:
   ```bash
   bun run build
   # Deploy the `dist` folder to GitHub Pages
   ```

### Other Platforms

The `dist` folder contains static files that can be deployed to any static hosting service.

## Adding Content

### Blog Posts (Notes)

Edit `src/pages/NotesApp.tsx` and add entries to the `notes` array:

```typescript
{
  slug: 'my-post-slug',
  title: 'Post Title',
  date: 'December 7, 2024',
  preview: 'First line preview...',
  content: `Full markdown-like content here...`,
}
```

### Photos

1. Add images to `public/images/`
2. Update the `photos` array in `src/pages/PhotosApp.tsx`

### About Info

Edit the content directly in `src/pages/AboutApp.tsx`

## Customization

- **Wallpaper**: Edit the `.wallpaper` CSS class in `src/App.css`
- **Colors**: Modify CSS variables in `src/styles/variables.css`
- **Icons**: Edit icon styles in `src/components/AppIcon.css`

## Project Structure

```
src/
├── components/        # Reusable components (AppIcon)
├── pages/            # App screens (HomeScreen, NotesApp, AboutApp, PhotosApp)
├── styles/           # CSS variables and shared styles
├── App.tsx           # Main app with routing
├── main.tsx          # Entry point
└── vite-env.d.ts     # Vite type definitions
```

## License

MIT
