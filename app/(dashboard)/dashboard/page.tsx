'use client'

import { DEMO_DATA } from '@/lib/demo-data'
import { ArrowDown, ArrowUp, DollarSign, Users, Calendar, ChefHat, Timer, TrendingUp, Star, UtensilsCrossed } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

// Enhanced Dummy Data for Visuals
const hourlyRevenueData = [
    { name: '12pm', value: 400 },
    { name: '1pm', value: 850 },
    { name: '2pm', value: 600 },
    { name: '3pm', value: 200 },
    { name: '4pm', value: 350 },
    { name: '5pm', value: 900 },
    { name: '6pm', value: 1500 },
    { name: '7pm', value: 2400 },
    { name: '8pm', value: 2800 },
    { name: '9pm', value: 1800 },
    { name: '10pm', value: 800 },
]

const topDishes = [
    { name: 'Tasting Menu', count: 45, price: 125, id: 1 },
    { name: 'Wagyu Ribeye', count: 32, price: 85, id: 2 },
    { name: 'Truffle Pasta', count: 28, price: 42, id: 3 },
]

// Extended Metrics based on User Request
const KPICards = [
    { label: "Today's Revenue", value: "$12,450", change: "+12%", trend: "up", icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Avg Ticket Size", value: "$85.00", change: "+5%", trend: "up", icon: TrendingUp, color: "text-blue-600 bg-blue-50" },
    { label: "Labor Cost", value: "22%", change: "-2%", trend: "down", isGood: true, icon: Users, color: "text-purple-600 bg-purple-50" }, // Down is good for cost
    { label: "Table Turnover", value: "1.8x", change: "+0.2", trend: "up", icon: Timer, color: "text-orange-600 bg-orange-50" },
    { label: "Occupancy Rate", value: "85%", change: "+10%", trend: "up", icon: ChefHat, color: "text-pink-600 bg-pink-50" },
    { label: "Cust. Satisfaction", value: "4.8/5", change: "+0.1", trend: "up", icon: Star, color: "text-yellow-600 bg-yellow-50" }
]

export default function DashboardPage() {
    const { restaurant, reservations } = DEMO_DATA
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Owner Dashboard</h1>
                        <p className="text-gray-500 mt-1">Real-time overview for {restaurant.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border text-sm font-medium text-gray-600">
                            {format(new Date(), 'EEEE, MMM do')}
                        </div>
                        <Button variant="outline">Download Report</Button>
                    </div>
                </div>

                {/* High-Level Financials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {KPICards.map((metric, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${metric.color} bg-opacity-10`}>
                                    <metric.icon size={18} className={metric.color.split(' ')[0]} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${(metric.trend === 'up' && !metric.isGood) || (metric.trend === 'down' && metric.isGood)
                                        ? 'text-green-700 bg-green-50'
                                        : 'text-gray-500 bg-gray-100'
                                    }`}>
                                    {metric.trend === 'up' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                                    {metric.change}
                                </div>
                            </div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{metric.label}</p>
                            <p className="text-xl font-bold text-gray-900 mt-1 group-hover:text-primary transition-colors">{metric.value}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Revenue Chart (Left - Wider) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Houly Revenue */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Today's Revenue Trend</h3>
                                <div className="text-sm text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">
                                    +12% vs Last Week
                                </div>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={hourlyRevenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={restaurant.primary_color || '#FBBF24'} stopOpacity={0.2} />
                                                <stop offset="95%" stopColor={restaurant.primary_color || '#FBBF24'} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={15} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tickMargin={15} tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(value) => `$${value}`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                                            cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke={restaurant.primary_color || '#FBBF24'} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bottom Row inside Left Column */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top Dishes */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <UtensilsCrossed size={18} className="text-gray-400" />
                                    Top Sellers
                                </h3>
                                <div className="space-y-4">
                                    {topDishes.map((dish, i) => (
                                        <div key={dish.id} className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                                                #{i + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-gray-900">{dish.name}</p>
                                                <p className="text-xs text-gray-500">{dish.count} orders today</p>
                                            </div>
                                            <span className="font-bold text-sm ml-auto">${dish.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Staff On Duty */}
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <Users size={18} className="text-gray-400" />
                                    Staff On-Duty
                                </h3>
                                <div className="space-y-3">
                                    {['Sarah M. (Host)', 'Chef Marco (Kitchen)', 'Luis R. (Waiter)'].map((person, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-sm font-medium text-gray-700">{person}</span>
                                        </div>
                                    ))}
                                    <div className="pt-2">
                                        <p className="text-xs text-gray-400 text-center">Labor cost running at $245/hr</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Feed */}
                    <div className="space-y-6">
                        {/* Live Floor Status Card */}
                        <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16"></div>
                            <h3 className="font-bold text-lg mb-1 relative z-10">Live Floor Status</h3>
                            <p className="text-white/60 text-sm mb-6 relative z-10">Occupancy is high for a Tuesday.</p>

                            <div className="flex gap-4 relative z-10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">12</div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">Occupied</div>
                                </div>
                                <div className="w-px bg-white/10"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-400">4</div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">Free</div>
                                </div>
                                <div className="w-px bg-white/10"></div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-400">2</div>
                                    <div className="text-[10px] uppercase tracking-wider text-white/50">Dirty</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reservations (Existing but updated style) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex-1">
                            <h3 className="text-lg font-bold mb-4">Incoming</h3>
                            <div className="space-y-2">
                                {reservations.slice(0, 5).map((res) => (
                                    <div key={res.id} className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-pointer">
                                        <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {res.reservation_time}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-bold text-sm text-gray-900 truncate">{res.customer_name}</p>
                                            <p className="text-xs text-gray-500">{res.party_size} People • Table TBD</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
