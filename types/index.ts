export interface Table {
    id: string;
    org_id: string;
    zone_id: string;
    number: string;
    seats: number;
    position: {
        x: number;
        y: number;
        rotation?: number;
        shape?: 'rect' | 'circle';
    };
    is_active: boolean;
    created_at: string;
}

export interface Zone {
    id: string;
    org_id: string;
    name: string;
    created_at?: string;
}
