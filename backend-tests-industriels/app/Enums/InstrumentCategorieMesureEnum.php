<?php

namespace App\Enums;

enum InstrumentCategorieMesureEnum: string
{
    case ELECTRIQUE = 'Électrique';
    case MECANIQUE = 'Mécanique';
    case THERMIQUE = 'Thermique';
    case ACOUSTIQUE = 'Acoustique';
    case VIBRATION = 'Vibration';
    case CND = 'CND';
    case AUTRE = 'Autre';
}
