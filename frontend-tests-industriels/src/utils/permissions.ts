import { User } from '@/types';

/**
 * Interface pour définir une exigence de permission
 */
export interface PermissionRequirement {
    resource: string;
    action: string;
}

/**
 * Vérifie si l'utilisateur possède une permission spécifique
 * Basé sur les permissions définies dans le rôle (backend RBAC)
 */
export const hasPermission = (user: User | null, resource: string, action: string): boolean => {
    if (!user || !user.personnel || !user.personnel.role) {
        return false;
    }

    // BYPASS COMPLET POUR L'ADMIN
    if (user.personnel.role.nom_role === 'Admin') {
        return true;
    }

    let permissions = user.personnel.role.permissions;

    // Sécurité: Si permissions est encodé en JSON (string)
    if (typeof permissions === 'string') {
        try {
            permissions = JSON.parse(permissions);
        } catch (e) {
            return false;
        }
    }

    if (!permissions || !permissions[resource]) {
        return false;
    }

    return (permissions[resource] as string[]).includes(action);
};

/**
 * Vérifie si l'utilisateur a accès à un module entier (au moins une action)
 */
export const hasModuleAccess = (user: User | null, resource: string): boolean => {
    if (!user || !user.personnel || !user.personnel.role) {
        return false;
    }

    // BYPASS COMPLET POUR L'ADMIN
    if (user.personnel.role.nom_role === 'Admin') {
        return true;
    }

    let permissions = user.personnel.role.permissions;

    // Sécurité: Si permissions est encodé en JSON (string)
    if (typeof permissions === 'string') {
        try {
            permissions = JSON.parse(permissions);
        } catch (e) {
            return false;
        }
    }

    return !!(permissions && permissions[resource] && (permissions[resource] as string[]).length > 0);
};

