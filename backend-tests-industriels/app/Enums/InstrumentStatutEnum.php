<?php

namespace App\Enums;

enum InstrumentStatutEnum: string
{
    case OPERATIONNEL = 'OPERATIONNEL';
    case EN_CALIBRATION = 'CALIBRATION';
    case HORS_SERVICE = 'HORS_SERVICE';
    case REFORME = 'REFORME';
}
