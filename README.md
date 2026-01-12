# HelloJoey - Next.js Portfolio

A modern React/Next.js conversion of the HelloJoey portfolio website with an admin panel for content management.

## Features

- **Next.js 14** with App Router
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Admin Panel** for content management
- **JSON-based** content storage
- All original visual effects preserved:
  - Custom game controller cursor with trail
  - Glitch effects on hero image
  - Parallax scrolling animations
  - Kangaroo animation
  - Particle effects
  - Background video
  - Audio system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
ADMIN_PASSWORD_HASH=<your-hashed-password>
SESSION_SECRET=<random-secret-string>
```

To generate a password hash, run:
```bash
node scripts/generate-password.js <your-password>
```

Or use Node.js directly:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-password',10).then(h=>console.log('ADMIN_PASSWORD_HASH='+h))"
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Panel

Access the admin panel at `/admin/login`. Use the password you configured in the environment variables.

The admin panel allows you to edit:
- Navigation links
- Hero image
- Section content (About, Competencies)
- Footer information
- Background video URL
- Kangaroo image

## Project Structure

```
/app
  /admin          - Admin panel routes
  /api            - API routes (content, auth)
  /components     - React components
  /lib            - Utilities (auth, content)
  /public         - Static assets
    /images       - Images
    /fonts        - Fonts
    /videos       - Videos
  /data           - JSON content files
```

## Building for Production

```bash
npm run build
npm start
```

## Notes

- The admin password is stored as a bcrypt hash in environment variables
- Content is stored in `/data/content.json`
- All original assets are preserved in the `/public` directory
- The site maintains pixel-perfect visual fidelity with the original

