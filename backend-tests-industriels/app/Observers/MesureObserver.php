<?php

namespace App\Observers;

use App\Models\Mesure;

class MesureObserver
{
    /**
     * Calculs automatiques avant création
     */
    public function creating(Mesure $mesure): void
    {
        $this->calculerEcarts($mesure);
        $this->verifierConformite($mesure);
    }

    /**
     * Calculs automatiques avant mise à jour
     */
    public function updating(Mesure $mesure): void
    {
        $this->calculerEcarts($mesure);
        $this->verifierConformite($mesure);
    }

    /**
     * Calculer écart absolu et pourcentage
     */
    protected function calculerEcarts(Mesure $mesure): void
    {
        if ($mesure->valeur_reference !== null && $mesure->valeur_mesuree !== null) {
            // Calcul écart absolu
            $mesure->ecart_absolu = $mesure->valeur_mesuree - $mesure->valeur_reference;

            // Calcul écart en pourcentage
            if ($mesure->valeur_reference != 0) {
                $mesure->ecart_pct = round(($mesure->ecart_absolu / $mesure->valeur_reference) * 100, 2);
            } else {
                $mesure->ecart_pct = 0;
            }
        }
    }

    /**
     * Vérifier conformité par rapport aux tolérances
     */
    protected function verifierConformite(Mesure $mesure): void
    {
        if ($mesure->tolerance_min !== null && $mesure->tolerance_max !== null && $mesure->valeur_mesuree !== null) {
            $mesure->conforme = (
                $mesure->valeur_mesuree >= $mesure->tolerance_min && 
                $mesure->valeur_mesuree <= $mesure->tolerance_max
            );
        }
    }
}
