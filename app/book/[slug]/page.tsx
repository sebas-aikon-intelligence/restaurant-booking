'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Phone, Mail, User, Loader2, CheckCircle2, ChevronLeft, MapPin, Info } from 'lucide-react'
import { DEMO_DATA } from '@/lib/demo-data'
import { useParams } from 'next/navigation'

export default function BookingPage() {
    const params = useParams()
    const slug = params.slug as string
    const restaurant = DEMO_DATA.restaurant

    // Form State
    const [step, setStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [partySize, setPartySize] = useState(2)
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    })

    // Animation mount check
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    // Colors
    const primaryColor = restaurant.primary_color || '#D4AF37'

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate network
        setIsSubmitting(false)
        setStep(3)
    }

    const nextStep = () => setStep(prev => prev + 1)
    const prevStep = () => setStep(prev => prev - 1)

    // Formatted Data
    const formattedDate = date ? new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-black relative flex items-center justify-center p-4 md:p-8 font-sans">
            {/* Ambient Background */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
                style={{
                    backgroundImage: `url(${restaurant.cover_image_url})`,
                    filter: 'brightness(0.4) blur(4px)'
                }}
            />
            <div className="fixed inset-0 bg-black/40 z-0" />

            {/* Main Card Container */}
            <div className="relative z-10 w-full max-w-6xl bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">

                {/* Left Side: Brand & Visuals */}
                <div className="w-full md:w-2/5 relative p-8 md:p-12 flex flex-col justify-between text-white overflow-hidden">
                    {/* Background Image for Left Panel */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/90 z-10" />
                        <img src={restaurant.cover_image_url} alt="Cover" className="w-full h-full object-cover opacity-80" />
                    </div>

                    {/* Top Content */}
                    <div className="relative z-20">
                        <Button
                            variant="ghost"
                            className="text-white/80 hover:text-white hover:bg-white/10 -ml-4 mb-8"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            <ChevronLeft size={18} className="mr-2" /> Volver
                        </Button>

                        {restaurant.logo_url ? (
                            <img src={restaurant.logo_url} className="h-12 object-contain mb-6" alt="Logo" />
                        ) : (
                            <h1 className="text-3xl font-serif mb-6">{restaurant.name}</h1>
                        )}

                        <h2 className="text-3xl md:text-4xl font-serif font-medium leading-tight mb-4">
                            Una experiencia <br />
                            <span style={{ color: primaryColor }}>inolvidable.</span>
                        </h2>
                    </div>

                    {/* Bottom - Summary (Sticky) */}
                    <div className="relative z-20 mt-auto pt-10">
                        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="p-2 rounded-full bg-white/5 text-white/80">
                                    <MapPin size={16} />
                                </div>
                                <span className="opacity-90">Terraza Principal, {restaurant.name}</span>
                            </div>

                            {date && (
                                <div className="flex items-center gap-4 text-sm animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-2 rounded-full bg-white/5 text-white/80">
                                        <Calendar size={16} />
                                    </div>
                                    <span className="capitalize opacity-90">{formattedDate}</span>
                                </div>
                            )}

                            {(date && time) && (
                                <div className="flex items-center gap-4 text-sm animate-in fade-in slide-in-from-bottom-2">
                                    <div className="p-2 rounded-full bg-white/5 text-white/80">
                                        <Clock size={16} />
                                    </div>
                                    <span className="opacity-90">{time}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Form Wizard */}
                <div className="w-full md:w-3/5 bg-[#121212] p-8 md:p-12 relative flex flex-col overflow-y-auto">
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        <div
                            className="h-full transition-all duration-500 ease-out"
                            style={{
                                width: step === 1 ? '33%' : step === 2 ? '66%' : '100%',
                                backgroundColor: primaryColor
                            }}
                        />
                    </div>

                    <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold tracking-widest text-white/40 uppercase">Paso 1 de 3</span>
                                    <h3 className="text-2xl text-white font-medium">¿Cuándo nos visitas?</h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Party Size */}
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Users className="text-white/40" size={20} />
                                            <span className="text-white font-medium">Personas</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setPartySize(Math.max(1, partySize - 1))}
                                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                                            >-</button>
                                            <span className="text-xl font-bold text-white w-8 text-center">{partySize}</span>
                                            <button
                                                onClick={() => setPartySize(Math.min(20, partySize + 1))}
                                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/60 ml-1">Fecha</label>
                                        <input
                                            type="date"
                                            value={date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all cursor-pointer"
                                        />
                                    </div>

                                    {/* Time */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-white/60 ml-1">Hora</label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {['18:00', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTime(t)}
                                                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${time === t
                                                        ? 'bg-white text-black shadow-lg scale-105'
                                                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-14 text-base mt-4 rounded-xl font-bold hover:bg-gray-200"
                                    style={{ backgroundColor: 'white', color: 'black' }}
                                    onClick={nextStep}
                                    disabled={!date || !time}
                                >
                                    Siguiente Paso
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <button onClick={prevStep} className="text-xs font-bold tracking-widest text-white/40 uppercase hover:text-white mb-2 flex items-center gap-1">
                                        <ChevronLeft size={12} /> Volver
                                    </button>
                                    <h3 className="text-2xl text-white font-medium">Tus Detalles</h3>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 ml-1">Nombre Completo</label>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Ej. Sofia Martínez"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60 ml-1">Email</label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="correo@ejemplo.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-white/60 ml-1">Teléfono</label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                placeholder="+34..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-white/60 ml-1">Notas (Opcional)</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Alergias, ocasiones especiales..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[100px]"
                                        />
                                    </div>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full h-14 text-base mt-4 rounded-xl font-bold"
                                    style={{ backgroundColor: primaryColor, color: '#000' }}
                                    onClick={handleSubmit}
                                    disabled={!formData.name || !formData.email || !formData.phone || isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirmar Reserva'}
                                </Button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-6 animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-500/20">
                                    <CheckCircle2 size={40} className="text-white" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-3xl text-white font-bold">¡Confirmado!</h3>
                                    <p className="text-white/60 max-w-xs mx-auto">
                                        Te hemos enviado un correo a {formData.email} con todos los detalles.
                                    </p>
                                </div>

                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-left space-y-4 max-w-sm mx-auto">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-white/60">Fecha</span>
                                        <span className="text-white font-medium capitalize">{formattedDate}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <span className="text-white/60">Hora</span>
                                        <span className="text-white font-medium">{time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/60">Invitados</span>
                                        <span className="text-white font-medium">{partySize} Personas</span>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    className="mt-8 border-white/20 text-white hover:bg-white/10"
                                    onClick={() => window.location.href = '/dashboard'}
                                >
                                    Volver al Inicio
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
