import { signup } from '../actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface p-4 bg-[url('/bg-abstract.jpg')] bg-cover bg-center">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl dark:bg-black/40" />

            <div className="glass relative z-10 w-full max-w-md overflow-hidden rounded-2xl p-8 shadow-2xl">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Start with GourmetOS</h1>
                    <p className="text-sm text-gray-500">Launch your digital restaurant today</p>
                </div>

                <form className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Full Name</label>
                            <Input name="fullName" placeholder="Sebas Lopez" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Restaurant</label>
                            <Input name="restaurantName" placeholder="Sebas Burger" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</label>
                        <Input name="email" type="email" placeholder="owner@restaurant.com" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium uppercase tracking-wider text-gray-500">Password</label>
                        <Input name="password" type="password" placeholder="••••••••" required minLength={6} />
                    </div>

                    <Button formAction={signup} className="mt-2 w-full">Create Account</Button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <a href="/login" className="font-medium text-primary hover:underline">
                        Sign In
                    </a>
                </div>
            </div>
        </div>
    )
}
