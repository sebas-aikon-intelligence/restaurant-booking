'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Upload, Loader2, Palette } from 'lucide-react'
import { DEMO_DATA } from '@/lib/demo-data'

export default function SettingsPage() {
    // Initialize state from DEMO_DATA directly
    const [name, setName] = useState(DEMO_DATA.restaurant.name)
    const [slug, setSlug] = useState(DEMO_DATA.restaurant.slug)
    const [description, setDescription] = useState(DEMO_DATA.restaurant.description)
    const [logoUrl, setLogoUrl] = useState(DEMO_DATA.restaurant.logo_url)
    const [coverUrl, setCoverUrl] = useState(DEMO_DATA.restaurant.cover_image_url)
    const [primaryColor, setPrimaryColor] = useState(DEMO_DATA.restaurant.primary_color)
    const [secondaryColor, setSecondaryColor] = useState(DEMO_DATA.restaurant.secondary_color)

    const [isSaving, setIsSaving] = useState(false)

    // Construct booking URL for display
    const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/book/${slug}` : `/book/${slug}`

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setIsSaving(true)

        // Simulate API call
        setTimeout(() => {
            setIsSaving(false)
            alert('Settings saved successfully! (Demo Mode)')
        }, 800)
    }

    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Restaurant Settings</h1>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Basic Info */}
                <div className="glass p-6 rounded-2xl space-y-4">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                    <div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Restaurant Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Restaurant Name"
                                required
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Public Booking URL</label>
                            <div className="flex gap-2">
                                <Input
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                    placeholder="restaurant-slug"
                                    required
                                />
                            </div>
                            {slug && (
                                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Your public booking link:</p>
                                    <a
                                        href={`/book/${slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary font-medium hover:underline break-all"
                                    >
                                        {bookingUrl}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell customers about your restaurant..."
                                className="w-full px-4 py-3 rounded-xl border border-border bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                {/* Branding */}
                <div className="glass p-6 rounded-2xl space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Palette size={20} />
                        Branding & Colors
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Primary Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="h-12 w-20 rounded-lg border border-border cursor-pointer"
                                />
                                <Input
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Secondary Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="h-12 w-20 rounded-lg border border-border cursor-pointer"
                                />
                                <Input
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="glass p-6 rounded-2xl space-y-4">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Upload size={20} />
                        Images
                    </h2>

                    <div>
                        <label className="block text-sm font-medium mb-2">Logo URL</label>
                        <Input
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            type="url"
                        />
                        {logoUrl && (
                            <div className="mt-2">
                                <img src={logoUrl} alt="Logo preview" className="h-16 object-contain rounded-lg border border-border p-2 bg-white" />
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                        <Input
                            value={coverUrl}
                            onChange={(e) => setCoverUrl(e.target.value)}
                            placeholder="https://example.com/cover.jpg"
                            type="url"
                        />
                        {coverUrl && (
                            <div className="mt-2">
                                <img src={coverUrl} alt="Cover preview" className="w-full h-32 object-cover rounded-lg border border-border" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview */}
                <div className="glass p-6 rounded-2xl">
                    <h2 className="text-xl font-semibold mb-4">Preview</h2>
                    <div
                        className="rounded-xl overflow-hidden border-2 border-dashed"
                        style={{ borderColor: primaryColor }}
                    >
                        {coverUrl && (
                            <img src={coverUrl} alt="Cover" className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6 bg-white" style={{ borderTop: `4px solid ${primaryColor}` }}>
                            {logoUrl && (
                                <img src={logoUrl} alt="Logo" className="h-12 mb-3" />
                            )}
                            <h3 className="text-2xl font-bold" style={{ color: primaryColor }}>{name || 'Restaurant Name'}</h3>
                            <p className="text-gray-600 mt-2">{description || 'Your restaurant description will appear here...'}</p>
                            <button
                                type="button"
                                className="mt-4 px-6 py-2 rounded-lg text-white font-medium shadow-md"
                                style={{ backgroundColor: secondaryColor }}
                            >
                                Book a Table
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving} size="lg">
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
                        Save Settings
                    </Button>
                </div>
            </form>
        </div>
    )
}
