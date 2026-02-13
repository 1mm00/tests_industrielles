import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
    title: string;
    value: number | string;
    unit?: string;
    variation?: number;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    format?: 'number' | 'percentage' | 'time';
}

const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
};

const KpiCard: React.FC<KpiCardProps> = ({
    title,
    value,
    unit,
    variation,
    icon,
    color = 'blue',
    format = 'number',
}) => {
    const formatValue = () => {
        if (format === 'percentage') {
            return `${value}${unit || '%'}`;
        }
        if (format === 'time') {
            return `${value} ${unit || 'h'}`;
        }
        return typeof value === 'number' ? value.toLocaleString('fr-FR') : value;
    };

    const getVariationIcon = () => {
        if (!variation || variation === 0) return <Minus className="w-4 h-4" />;
        return variation > 0 ? (
            <TrendingUp className="w-4 h-4" />
        ) : (
            <TrendingDown className="w-4 h-4" />
        );
    };

    const getVariationColor = () => {
        if (!variation || variation === 0) return 'text-gray-500';
        return variation > 0 ? 'text-green-600' : 'text-red-600';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
                    {icon}
                </div>
                {variation !== undefined && (
                    <div className={`flex items-center gap-1 ${getVariationColor()}`}>
                        {getVariationIcon()}
                        <span className="text-sm font-medium">
                            {Math.abs(variation)}
                            {format === 'percentage' ? 'pts' : ''}
                        </span>
                    </div>
                )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

            {/* Value */}
            <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{formatValue()}</span>
                {unit && format !== 'percentage' && format !== 'time' && (
                    <span className="text-sm text-gray-500">{unit}</span>
                )}
            </div>
        </div>
    );
};

export default KpiCard;
