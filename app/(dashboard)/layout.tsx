import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    // DEMO MODE: No auth check required
    return (
        <div className="min-h-screen bg-[#F2F2F7]">
            <Sidebar />
            <main className="ml-0 md:ml-20 min-h-screen p-6 transition-all duration-300">
                {children}
            </main>
        </div>
    )
}
