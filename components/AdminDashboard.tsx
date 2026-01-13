'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ContentData } from '@/lib/content';

export default function AdminDashboard() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState<string | null>(null); // Track which field is uploading
  const router = useRouter();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      setMessage('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setMessage('Content saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save content');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleImageUpload = async (file: File, fieldName: 'hero' | 'kangaroo' | 'logo') => {
    if (!content) return;

    setUploading(fieldName);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldName', fieldName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.path) {
        // Update the content with the new image path
        if (fieldName === 'hero') {
          setContent({
            ...content,
            hero: { ...content.hero, image: data.path },
          });
          setMessage('Hero image uploaded successfully!');
        } else if (fieldName === 'kangaroo') {
          setContent({
            ...content,
            kangaroo: { ...content.kangaroo, image: data.path },
          });
          setMessage('Kangaroo image uploaded successfully!');
        } else if (fieldName === 'logo') {
          setContent({
            ...content,
            logo: { ...content.logo, image: data.path },
          });
          setMessage('Logo uploaded successfully!');
        }
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || 'Failed to upload image');
      }
    } catch (error) {
      setMessage('An error occurred while uploading');
    } finally {
      setUploading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-neon-green font-upheaval">
        Loading...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-upheaval">
        Failed to load content
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen bg-black text-neon-green font-upheaval py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-neon-green/30">
          <h1 className="text-3xl sm:text-4xl uppercase font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-3 border-2 border-neon-green hover:bg-neon-green hover:text-black transition-all duration-300 uppercase font-medium text-sm sm:text-base whitespace-nowrap"
          >
            Logout
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded border-2 ${
              message.includes('success') 
                ? 'bg-green-900/50 border-green-500/50 text-green-300' 
                : 'bg-red-900/50 border-red-500/50 text-red-300'
            }`}
          >
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Navigation Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Navigation Links</h2>
          <div className="space-y-4">
            {content.navigation.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const newNav = [...content.navigation];
                  newNav[index].label = e.target.value;
                  setContent({ ...content, navigation: newNav });
                }}
                className="flex-1 px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green uppercase transition-all"
                placeholder="Label"
              />
              <input
                type="text"
                value={item.href}
                onChange={(e) => {
                  const newNav = [...content.navigation];
                  newNav[index].href = e.target.value;
                  setContent({ ...content, navigation: newNav });
                }}
                className="flex-1 px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all"
                placeholder="Link (e.g., #section)"
              />
              </div>
            ))}
          </div>
        </section>

        {/* Logo Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Navigation Logo</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Current Logo</label>
              {content.logo.image && (
                <div className="mb-4">
                  <img 
                    src={content.logo.image} 
                    alt={content.logo.alt || 'Logo'} 
                    className="max-w-full h-auto max-h-48 border-2 border-neon-green/50 rounded"
                  />
                </div>
              )}
              <label className="block mb-2 text-sm uppercase font-medium">Upload New Logo</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'logo');
                  }
                }}
                disabled={uploading === 'logo'}
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-neon-green file:text-black file:font-upheaval file:uppercase file:cursor-pointer hover:file:bg-[#00cc00] disabled:opacity-50"
              />
              {uploading === 'logo' && (
                <p className="mt-2 text-sm text-neon-green/70">Uploading...</p>
              )}
              <p className="mt-2 text-xs text-neon-green/60">Current path: {content.logo.image}</p>
            </div>
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Alt Text</label>
              <input
                type="text"
                value={content.logo.alt}
                onChange={(e) =>
                  setContent({ ...content, logo: { ...content.logo, alt: e.target.value } })
                }
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all font-sans normal-case"
              />
            </div>
          </div>
        </section>

        {/* Hero Image Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Hero Image</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Current Image</label>
              {content.hero.image && (
                <div className="mb-4">
                  <img 
                    src={content.hero.image} 
                    alt={content.hero.alt || 'Hero image'} 
                    className="max-w-full h-auto max-h-48 border-2 border-neon-green/50 rounded"
                  />
                </div>
              )}
              <label className="block mb-2 text-sm uppercase font-medium">Upload New Image</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'hero');
                  }
                }}
                disabled={uploading === 'hero'}
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-neon-green file:text-black file:font-upheaval file:uppercase file:cursor-pointer hover:file:bg-[#00cc00] disabled:opacity-50"
              />
              {uploading === 'hero' && (
                <p className="mt-2 text-sm text-neon-green/70">Uploading...</p>
              )}
              <p className="mt-2 text-xs text-neon-green/60">Current path: {content.hero.image}</p>
            </div>
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Alt Text</label>
              <input
                type="text"
                value={content.hero.alt}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, alt: e.target.value } })
                }
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all font-sans normal-case"
              />
            </div>
          </div>
        </section>

        {/* About Section Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">About Section</h2>
          <div className="space-y-3">
            {content.sections.about.map((item, index) => (
              <input
                key={index}
                type="text"
                value={item}
                onChange={(e) => {
                  const newAbout = [...content.sections.about];
                  newAbout[index] = e.target.value;
                  setContent({
                    ...content,
                    sections: { ...content.sections, about: newAbout },
                  });
                }}
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green uppercase transition-all"
              />
            ))}
          </div>
        </section>

        {/* Footer Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Footer</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Email</label>
              <input
                type="email"
                value={content.footer.email}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, email: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Copyright</label>
              <input
                type="text"
                value={content.footer.copyright}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footer: { ...content.footer, copyright: e.target.value },
                  })
                }
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green uppercase transition-all"
              />
            </div>
          </div>
        </section>

        {/* Video Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Background Video</h2>
          <div>
            <label className="block mb-2 text-sm uppercase font-medium">Video URL</label>
            <input
              type="text"
              value={content.video.url}
              onChange={(e) =>
                setContent({ ...content, video: { ...content.video, url: e.target.value } })
              }
              className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all"
            />
          </div>
        </section>

        {/* Kangaroo Image Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Kangaroo Image</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Current Image</label>
              {content.kangaroo.image && (
                <div className="mb-4">
                  <img 
                    src={content.kangaroo.image} 
                    alt={content.kangaroo.alt || 'Kangaroo image'} 
                    className="max-w-full h-auto max-h-48 border-2 border-neon-green/50 rounded"
                  />
                </div>
              )}
              <label className="block mb-2 text-sm uppercase font-medium">Upload New Image</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'kangaroo');
                  }
                }}
                disabled={uploading === 'kangaroo'}
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-neon-green file:text-black file:font-upheaval file:uppercase file:cursor-pointer hover:file:bg-[#00cc00] disabled:opacity-50"
              />
              {uploading === 'kangaroo' && (
                <p className="mt-2 text-sm text-neon-green/70">Uploading...</p>
              )}
              <p className="mt-2 text-xs text-neon-green/60">Current path: {content.kangaroo.image}</p>
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div className="mt-10 pt-6 border-t border-neon-green/30">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-8 py-4 bg-neon-green text-black font-upheaval uppercase text-lg sm:text-xl font-bold hover:bg-[#00cc00] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-green/50 hover:shadow-neon-green/70"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

