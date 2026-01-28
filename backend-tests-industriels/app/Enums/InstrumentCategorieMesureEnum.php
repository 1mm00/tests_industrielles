<?php

namespace App\Enums;

enum InstrumentCategorieMesureEnum: string
{
    case ELECTRIQUE = 'ELECTRIQUE';
    case MECANIQUE = 'MECANIQUE';
    case THERMIQUE = 'THERMIQUE';
    case PRESSION = 'PRESSION';
    case DIMENSIONNEL = 'DIMENSIONNEL';
    case VIBRATION = 'VIBRATION';
    case CND = 'CND';
    case AUTRE = 'AUTRE';
}
