<?php

namespace App\Enums;

enum TestResultatEnum: string
{
    case CONFORME = 'CONFORME';
    case NON_CONFORME = 'NON_CONFORME';
    case PARTIEL = 'PARTIEL';
    case EN_ATTENTE = 'EN_ATTENTE';
    case NON_APPLICABLE = 'NON_APPLICABLE';
}
