<?php

namespace App\Enums;

enum NormeStatutEnum: string
{
    case ACTIF = 'Actif';
    case OBSOLETE = 'Obsolète';
    case EN_REVISION = 'En révision';
}
