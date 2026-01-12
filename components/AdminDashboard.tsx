'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { ContentData } from '@/lib/content';

export default function AdminDashboard() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
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

        {/* Hero Image Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Hero Image</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Image URL</label>
              <input
                type="text"
                value={content.hero.image}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, image: e.target.value } })
                }
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm uppercase font-medium">Alt Text</label>
              <input
                type="text"
                value={content.hero.alt}
                onChange={(e) =>
                  setContent({ ...content, hero: { ...content.hero, alt: e.target.value } })
                }
                className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all"
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

        {/* Competencies Section Editor */}
        <section className="mb-8 p-6 sm:p-8 bg-[rgba(37,0,115,0.3)] border-2 border-neon-green rounded-lg">
          <h2 className="text-2xl sm:text-3xl mb-6 uppercase font-semibold pb-3 border-b border-neon-green/30">Competencies Section</h2>
          <div className="space-y-3">
            {content.sections.competencies.map((item, index) => (
              <input
                key={index}
                type="text"
                value={item}
                onChange={(e) => {
                  const newCompetencies = [...content.sections.competencies];
                  newCompetencies[index] = e.target.value;
                  setContent({
                    ...content,
                    sections: { ...content.sections, competencies: newCompetencies },
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
          <div>
            <label className="block mb-2 text-sm uppercase font-medium">Image URL</label>
            <input
              type="text"
              value={content.kangaroo.image}
              onChange={(e) =>
                setContent({
                  ...content,
                  kangaroo: { ...content.kangaroo, image: e.target.value },
                })
              }
              className="w-full px-4 py-3 bg-black/50 border-2 border-neon-green/50 text-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-neon-green transition-all"
            />
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

