import { blue, green, purple } from '@mui/material/colors';

export enum Role {
    ROOT = 1,
    ADMIN = 2,
    CLIENT = 3,
    SUPPORT = 4
}

export function getRoleName(role: number): string {
    switch (role) {
        case 1:
            return "Root"
        case 2:
            return "Administrador"
        case 3:
            return "Cliente"
        case 4:
            return "Soporte"
        default:
            return "N/A"
    }
}
export function getColorRole(role: number) {
    switch (role) {
        case 1:
            return purple[900]
        case 2:
            return purple[700]
        case 3:
            return green[900]
        case 4:
            return blue[900]
        default:
            return blue[900]
    }
}

export type UserObj = {
    userName: string;
    email: string;
    rol: number;
    status: boolean;
    accessFailedCount: number;
    lockoutEnabled: boolean
}