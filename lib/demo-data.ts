import { Table } from '@/types';

// Types for Demo Data
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: 'Starters' | 'Mains' | 'Desserts' | 'Drinks';
    image_url?: string;
    is_available: boolean;
}

export interface Reservation {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    party_size: number;
    reservation_date: string; // YYYY-MM-DD
    reservation_time: string; // HH:mm
    table_number?: string;
    status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
    notes?: string;
    created_at: string;
}

export interface Metric {
    label: string;
    value: string | number;
    change: number; // percentage
    trend: 'up' | 'down' | 'neutral';
}

export interface Staff {
    id: string;
    name: string;
    role: 'Manager' | 'Head Chef' | 'Chef' | 'Waiter' | 'Bartender' | 'Host';
    email: string;
    phone: string;
    status: 'Active' | 'On Leave' | 'Inactive';
    start_date: string;
    avatar_url?: string;
}

export const DEMO_DATA = {
    restaurant: {
        id: 'demo-org-id',
        name: 'Lumière Dining',
        slug: 'lumiere-dining',
        description: 'Experience culinary excellence in an ambiance of refined elegance. Lumière Dining offers a modern interpretation of classic French cuisine, using only the finest seasonal ingredients.',
        logo_url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=200&h=200',
        cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=2000',
        gallery_urls: [
            'https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2',
            'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b',
            'https://images.unsplash.com/photo-1559339352-11d035aa65de'
        ],
        primary_color: '#D4AF37', // Gold
        secondary_color: '#FBBF24', // Amber
    },

    metrics: [
        { label: 'Total Revenue', value: '$12,450', change: 12.5, trend: 'up' },
        { label: 'Active Tables', value: '8/12', change: -5, trend: 'down' },
        { label: 'Reservations', value: '45', change: 8.2, trend: 'up' },
        { label: 'Avg. Ticket', value: '$85', change: 2.1, trend: 'up' },
    ] as Metric[],

    tables: [
        { id: 't1', number: 'T1', seats: 2, position: { x: 100, y: 100 }, is_active: true, shape: 'circle' },
        { id: 't2', number: 'T2', seats: 2, position: { x: 100, y: 300 }, is_active: true, shape: 'circle' },
        { id: 't3', number: 'T3', seats: 4, position: { x: 400, y: 100 }, is_active: true, shape: 'rect' },
        { id: 't4', number: 'T4', seats: 4, position: { x: 400, y: 300 }, is_active: true, shape: 'rect' },
        { id: 't5', number: 'T5', seats: 6, position: { x: 700, y: 200 }, is_active: true, shape: 'rect' },
        { id: 't6', number: 'VIP', seats: 8, position: { x: 900, y: 500 }, is_active: true, shape: 'rect' },
    ] as any[], // Casting as any to avoid strict shape type issues for now, or assume shape is handled

    menu: [
        {
            id: 'm1',
            name: 'Truffle Scallops',
            description: 'Pan-seared scallops with truffle puree and crispy prosciutto.',
            price: 24,
            category: 'Starters',
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 'm2',
            name: 'Wagyu Beef Tartare',
            description: 'Hand-cut wagyu beef, capers, cured egg yolk, toasted brioche.',
            price: 28,
            category: 'Starters',
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1519690889869-e705e59f72e1?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 'm3',
            name: 'Duck Confit',
            description: 'Slow-cooked duck leg, braised red cabbage, potato gratin.',
            price: 36,
            category: 'Mains',
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 'm4',
            name: 'Lobster Risotto',
            description: 'Saffron risotto, butter-poached lobster tail, parmesan foam.',
            price: 42,
            category: 'Mains',
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 'm5',
            name: 'Chocolate Soufflé',
            description: 'Warm dark chocolate soufflé, vanilla bean ice cream.',
            price: 16,
            category: 'Desserts',
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1579372786545-ea51e48ba427?auto=format&fit=crop&q=80&w=500'
        },
        {
            id: 'm6',
            name: 'Signature Old Fashioned',
            description: 'Bourbon, smoked maple syrup, angostura bitters, orange peel.',
            price: 18,
            category: 'Drinks',
            is_available: true,
            image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=500'
        }
    ] as MenuItem[],

    reservations: [
        {
            id: 'r1',
            customer_name: 'Isabella Rossellini',
            customer_email: 'isabella@example.com',
            customer_phone: '+1 (555) 0123',
            party_size: 4,
            reservation_date: new Date().toISOString().split('T')[0], // Today
            reservation_time: '19:00',
            status: 'confirmed',
            notes: 'Anniversary celebration. Window seat preferred.',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
            id: 'r2',
            customer_name: 'Marcus Thorne',
            customer_email: 'marcus@example.com',
            customer_phone: '+1 (555) 9876',
            party_size: 2,
            reservation_date: new Date().toISOString().split('T')[0], // Today
            reservation_time: '20:30',
            status: 'pending',
            notes: 'Allergic to shellfish.',
            created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 'r3',
            customer_name: 'Elena Gilbert',
            customer_email: 'elena@example.com',
            customer_phone: '+1 (555) 4567',
            party_size: 6,
            reservation_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            reservation_time: '18:30',
            status: 'confirmed',
            created_at: new Date(Date.now() - 86400000).toISOString()
        }
    ] as Reservation[],

    staff: [
        {
            id: 's1',
            name: 'Julianne Moore',
            role: 'Manager',
            email: 'julianne@lumieredining.com',
            phone: '+1 (555) 1111',
            status: 'Active',
            start_date: '2023-01-15',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200'
        },
        {
            id: 's2',
            name: 'Gordon Ramsay',
            role: 'Head Chef',
            email: 'gordon@lumieredining.com',
            phone: '+1 (555) 2222',
            status: 'Active',
            start_date: '2023-02-01',
            avatar_url: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&q=80&w=200'
        },
        {
            id: 's3',
            name: 'Tom Holland',
            role: 'Waiter',
            email: 'tom@lumieredining.com',
            phone: '+1 (555) 3333',
            status: 'Active',
            start_date: '2023-03-10',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200'
        },
        {
            id: 's4',
            name: 'Zendaya Coleman',
            role: 'Host',
            email: 'zendaya@lumieredining.com',
            phone: '+1 (555) 4444',
            status: 'On Leave',
            start_date: '2023-04-05',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        },
        {
            id: 's5',
            name: 'Stanley Tucci',
            role: 'Bartender',
            email: 'stanley@lumieredining.com',
            phone: '+1 (555) 5555',
            status: 'Active',
            start_date: '2023-05-20',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        }
    ] as Staff[]
};
