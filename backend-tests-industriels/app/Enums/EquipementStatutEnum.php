<?php

namespace App\Enums;

enum EquipementStatutEnum: string
{
    case EN_SERVICE = 'En service';
    case ARRETE = 'Arrêté';
    case MAINTENANCE = 'Maintenance';
    case HORS_SERVICE = 'Hors service';
}
