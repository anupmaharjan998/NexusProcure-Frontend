export interface Permission {
    id: string;
    name: string;
    description: string;
    group: string;
    isGranted?: boolean;
}