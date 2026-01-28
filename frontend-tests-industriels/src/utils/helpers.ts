import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire pour fusionner les classes Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formater une date au format FR
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'datetime' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = format === 'short'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : format === 'long'
            ? { year: 'numeric', month: 'long', day: 'numeric' }
            : { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

    return d.toLocaleDateString('fr-FR', options);
}

/**
 * Formater un nombre avec séparateurs de milliers
 */
export function formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
}

/**
 * Obtenir la classe de couleur pour un niveau de criticité
 */
export function getCriticalityColor(level: number): string {
    const colors: Record<number, string> = {
        1: 'text-green-600 bg-green-100',
        2: 'text-yellow-600 bg-yellow-100',
        3: 'text-orange-600 bg-orange-100',
        4: 'text-red-600 bg-red-100',
    };
    return colors[level] || 'text-gray-600 bg-gray-100';
}

/**
 * Obtenir la classe de couleur pour un statut
 */
export function getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
        // Tests (Legacy & New)
        'Planifié': 'bg-blue-100 text-blue-800',
        'PLANIFIE': 'bg-blue-100 text-blue-800',
        'En cours': 'bg-yellow-100 text-yellow-800',
        'EN_COURS': 'bg-yellow-100 text-yellow-800',
        'Terminé': 'bg-green-100 text-green-800',
        'TERMINE': 'bg-green-100 text-green-800',
        'Suspendu': 'bg-orange-100 text-orange-800',
        'SUSPENDU': 'bg-orange-100 text-orange-800',
        'Annulé': 'bg-gray-100 text-gray-800',
        'ANNULE': 'bg-gray-100 text-gray-800',

        // Résultats (Legacy & New)
        'Conforme': 'bg-green-100 text-green-800',
        'CONFORME': 'bg-green-100 text-green-800',
        'Non conforme': 'bg-red-100 text-red-800',
        'NON_CONFORME': 'bg-red-100 text-red-800',
        'Partiel': 'bg-yellow-100 text-yellow-800',
        'PARTIEL': 'bg-yellow-100 text-yellow-800',
        'Non applicable': 'bg-gray-100 text-gray-800',
        'NON_APPLICABLE': 'bg-gray-100 text-gray-800',

        // NC
        'Ouvert': 'bg-red-100 text-red-800',
        'OUVERTE': 'bg-red-100 text-red-800',
        'En analyse': 'bg-blue-100 text-blue-800',
        'EN_ANALYSE': 'bg-blue-100 text-blue-800',
        'En traitement': 'bg-yellow-100 text-yellow-800',
        'EN_TRAITEMENT': 'bg-yellow-100 text-yellow-800',
        'Résolu': 'bg-green-100 text-green-800',
        'RESOLU': 'bg-green-100 text-green-800',
        'Clôturé': 'bg-gray-100 text-gray-800',
        'CLOTUREE': 'bg-gray-100 text-gray-800',

        // Équipements
        'En service': 'bg-green-100 text-green-800',
        'EN_SERVICE': 'bg-green-100 text-green-800',
        'Arrêté': 'bg-orange-100 text-orange-800',
        'ARRETE': 'bg-orange-100 text-orange-800',
        'Maintenance': 'bg-yellow-100 text-yellow-800',
        'MAINTENANCE': 'bg-yellow-100 text-yellow-800',
        'Hors service': 'bg-red-100 text-red-800',
        'HORS_SERVICE': 'bg-red-100 text-red-800',
    };

    return statusMap[status] || 'bg-gray-100 text-gray-800';
}


/**
 * Calculer le nombre de jours entre deux dates
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Vérifier si une date est proche (dans les X jours)
 */
export function isDateNear(date: string | Date, daysThreshold: number = 7): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffDays = daysBetween(now, d);

    return diffDays <= daysThreshold && d >= now;
}

/**
 * Vérifier si une date est dépassée
 */
export function isDatePast(date: string | Date): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
}

/**
 * Tronquer un texte
 */
export function truncate(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Générer des initiales à partir d'un nom complet
 */
export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/**
 * Télécharger un fichier
 */
export function downloadFile(url: string, filename: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Exporter des données en CSV
 */
export function exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',')
                    ? `"${value}"`
                    : value;
            }).join(',')
        ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    downloadFile(url, `${filename}.csv`);
    URL.revokeObjectURL(url);
}

/** 
 * Débounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: any; // Use any to avoid NodeJS namespace issues in browser environment

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
