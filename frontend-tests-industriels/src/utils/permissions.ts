import { User } from '@/types';

/**
 * Configuration de la pertinence des ressources par rôle.
 * Définit quelles ressources sont autorisées pour chaque profil métier.
 * Sert de filtre de sécurité supplémentaire au-delà du simple JSON backend.
 */
export const ROLE_RESOURCES_RELEVANCE: Record<string, string[]> = {
    'Admin': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports',
        'personnel', 'instruments', 'expertise', 'maintenance', 'planning', 'users'
    ],
    'Ingénieur': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports',
        'instruments', 'expertise', 'planning'
    ],
    'Technicien': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports',
        'instruments', 'maintenance', 'planning'
    ],
    'Lecteur': [
        'dashboards', 'tests', 'non_conformites', 'equipements', 'rapports', 'instruments', 'planning'
    ],
};

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

    const roleName = user.personnel.role.nom_role;
    const normalizedRole = roleName?.toLowerCase() === 'admin' ? 'Admin' : roleName;

    // BYPASS COMPLET POUR L'ADMIN
    if (normalizedRole === 'Admin') {
        return true;
    }

    // VÉRIFICATION DE LA PERTINENCE DU RÔLE (Whitelist Frontend)
    const allowedResources = ROLE_RESOURCES_RELEVANCE[normalizedRole] || [];
    if (!allowedResources.includes(resource)) {
        return false;
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

    const roleName = user.personnel.role.nom_role;
    const normalizedRole = roleName?.toLowerCase() === 'admin' ? 'Admin' : roleName;

    // BYPASS COMPLET POUR L'ADMIN
    if (normalizedRole === 'Admin') {
        return true;
    }

    // VÉRIFICATION DE LA PERTINENCE DU RÔLE (Whitelist Frontend)
    const allowedResources = ROLE_RESOURCES_RELEVANCE[normalizedRole] || [];
    if (!allowedResources.includes(resource)) {
        return false;
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

/**
 * Vérifie si l'utilisateur est un simple Lecteur (Mode consultation uniquement)
 * Insensible à la casse pour plus de robustesse
 */
export const isLecteur = (user: User | null): boolean => {
    const roleName = user?.personnel?.role?.nom_role?.toLowerCase();
    return roleName === 'lecteur';
};

