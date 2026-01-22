<?php

namespace App\Enums;

enum InstrumentStatutEnum: string
{
    case OPERATIONNEL = 'Opérationnel';
    case EN_CALIBRATION = 'En calibration';
    case HORS_SERVICE = 'Hors service';
    case REFORME = 'Réforme';
}
