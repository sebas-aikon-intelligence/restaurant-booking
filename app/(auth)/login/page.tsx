'use client'

import { Button } from "@/components/ui/button"
import { ChefHat, ArrowRight } from "lucide-react"
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="flex w-full max-w-sm flex-col items-center space-y-6 text-center">

                {/* Logo */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg">
                        <ChefHat size={28} />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-gray-900">GourmetOS</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Demo Access</h1>
                    <p className="text-gray-500">
                        Enter the interactive demo for Lumière Dining. <br />
                        No account required.
                    </p>
                </div>

                <div className="w-full space-y-4">
                    {/* Direct Link to Dashboard - bypassing auth */}
                    <Link href="/dashboard" className="w-full block">
                        <Button className="w-full h-12 text-base shadow-md transition-all hover:scale-[1.02]" size="lg">
                            Enter Dashboard
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gradient-to-br from-gray-50 to-gray-100 px-2 text-gray-500">Public View</span>
                        </div>
                    </div>

                    <Link href="/book/lumiere-dining" className="w-full block">
                        <Button variant="outline" className="w-full h-12 text-base border-primary/20 hover:border-primary hover:bg-primary/5 transition-all">
                            View Public Booking Page
                        </Button>
                    </Link>
                </div>

                <p className="px-8 text-center text-sm text-gray-400">
                    v0.1.0 • Demo Build
                </p>
            </div>
        </div>
    )
}
