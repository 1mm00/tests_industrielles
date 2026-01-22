<?php

namespace App\Enums;

enum TestStatutEnum: string
{
    case PLANIFIE = 'PLANIFIE';
    case EN_COURS = 'EN_COURS';
    case TERMINE = 'TERMINE';
    case SUSPENDU = 'SUSPENDU';
    case ANNULE = 'ANNULE';
}
