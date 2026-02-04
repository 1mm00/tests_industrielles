# Système de Verrouillage Temporel Industriel - Documentation Technique

## Vue d'ensemble
Ce document décrit l'implémentation du système de **Time-Locking** et de **workflow séquentiel strict** pour le module d'exécution des tests industriels.

---

## 🔐 1. Architecture de Sécurité Temporelle

### Backend (Laravel)
**Fichier modifié :** `app/Services/TestIndustrielService.php`

#### Validation Temporelle
```php
// Sécurité temporelle industrielle : Verrouillage si avant l'heure prévue
$dateStr = $test->date_test instanceof \DateTime ? $test->date_test->format('Y-m-d') : $test->date_test;
$planStart = Carbon::parse($dateStr . ' ' . ($test->heure_debut_planifiee ?? '00:00:00'));

if (Carbon::now()->lessThan($planStart)) {
    $diff = Carbon::now()->diffForHumans($planStart, ['parts' => 3, 'join' => true]);
    throw new \Exception("Verrouillage de sécurité : Ce test ne peut démarrer que dans " . $diff . ".");
}
```

**Caractéristiques :**
- Comparaison stricte entre l'heure serveur et l'heure planifiée
- Rejet immédiat avec message d'erreur explicite
- Calcul du temps restant en temps réel

---

## 📊 2. Schéma de Base de Données

### Migration
**Fichier :** `2026_01_31_210402_add_planned_times_to_tests_industriels.php`

**Nouvelles colonnes ajoutées :**
| Colonne | Type | Description |
|---------|------|-------------|
| `heure_debut_planifiee` | `TIME` | Heure de début choisie dans le formulaire (objectif) |
| `heure_fin_planifiee` | `TIME` | Heure de fin estimée (objectif) |

**But :** Dissocier le planning initial (intention) de l'exécution réelle (traçabilité).

---

## 🎯 3. Workflow Séquentiel (Frontend)

### Phase 1 : PLANIFIE (Attente)
**État du cockpit :**
- ✅ Dossier technique visible
- ✅ Timeline visible (Input/Output prévus)
- ⏱️ Compte à rebours actif (`StartCountdownTimer`)
- 🔒 Bouton "Démarrer" **désactivé** jusqu'à l'heure exacte
- ❌ Tableau de mesures **masqué**

**Code clé :**
```tsx
{!isTimeReady && scheduledStartTime && (
    <StartCountdownTimer 
        targetDate={scheduledStartTime} 
        onComplete={() => setIsTimeReady(true)} 
    />
)}
<button
    disabled={!isTimeReady}
    className={isTimeReady ? "bg-sky-500" : "bg-gray-300 cursor-not-allowed"}
>
    DÉMARRER LA SESSION
</button>
```

---

### Phase 2 : EN_COURS (Action Physique)
**État du cockpit :**
- ✅ HUD minimal avec chronomètre géant
- ✅ Timeline mise à jour (heure réelle de début)
- ✅ Bouton "Clôturer" **actif** (arrêt manuel autorisé)
- ❌ Tableau de mesures **masqué** (focus opérateur)

**Avantage :** L'opérateur n'est pas distrait par les saisies administratives pendant l'intervention.

---

### Phase 3 : TERMINE + isEnteringResults (Saisie Administrative)
**État du cockpit :**
- ✅ Chronomètre figé sur la durée finale
- ✅ Tableau de mesures **déverrouillé**
- ✅ Bouton "Modifier les Résultats" actif
- ✅ Bouton "Rapport PDF" disponible

**Transition automatique :**
```tsx
const finishMutation = useMutation({
    onSuccess: () => {
        setIsEnteringResults(true); // Passage automatique en mode saisie
        toast.success('Session clôturée. Saisie ouverte.');
    }
});
```

---

### Phase 4 : Validation Finale
**État du cockpit :**
- ✅ Bouton "Valider & Sauvegarder" visible
- ✅ Génération du rapport PDF activée
- ✅ Archivage des données

---

## 🧩 4. Composants Clés

### `StartCountdownTimer`
**Rôle :** Affiche le temps restant avant l'ouverture de la session.

**Fonctionnement :**
1. Calcule la différence entre `Date.now()` et `targetDate`
2. Rafraîchit toutes les secondes
3. Appelle `onComplete()` quand le compte atteint `00:00:00`

**Rendu :**
```tsx
<div className="flex items-center gap-2 text-amber-500 bg-amber-50 px-3 py-1 rounded-full animate-pulse">
    <Clock className="h-3 w-3" />
    Disponible dans {timeLeft}
</div>
```

---

### `TimelineTemporelle`
**Rôle :** Visualisation graphique de la fenêtre temporelle du test.

**Données affichées :**
- **Input (planifié) :** `heure_debut_planifiee`
- **Output (planifié) :** `heure_fin_planifiee`
- **Réel Début :** `heure_debut` (si test démarré)
- **Réel Fin :** `heure_fin` (si test terminé)

**Indicateur visuel :**
- Point bleu (sky-400) = planifié
- Point vert (emerald-500) = réalisé

---

## 🔄 5. Flux de Données

```
UTILISATEUR
    ↓
[TestCreationModal] 
    → heure_debut : "08:00"
    → heure_fin : "10:00"
    ↓
[Backend] Enregistrement
    → heure_debut_planifiee : "08:00"
    → heure_fin_planifiee : "10:00"
    ↓
[TestExecutionModal - Phase PLANIFIE]
    → Calcul de scheduledStartTime
    → Verrouillage Start si NOW < scheduledStartTime
    ↓
[Clic sur Démarrer @ 08:00:00]
    → Backend vérifie l'heure
    → Si OK → statut = 'EN_COURS'
    → heure_debut = NOW()
    ↓
[Clic sur Clôturer @ 09:30:00]
    → Backend calcule durée réelle
    → statut = 'TERMINE'
    → heure_fin = NOW()
    → Transition automatique vers isEnteringResults
```

---

## ✅ 6. Points de Contrôle Qualité

### Sécurité
- [x] Validation backend empêchant le démarrage anticipé
- [x] Message d'erreur avec temps restant fourni à l'utilisateur
- [x] Aucune marge de tolérance (précision à la seconde)

### UX/UI
- [x] Compte à rebours visuel clair
- [x] Bouton grisé/désactivé avec feedback
- [x] Masquage dynamique du tableau selon la phase
- [x] Transition automatique vers la saisie après clôture

### Traçabilité
- [x] Dissociation planning/réel
- [x] Enregistrement précis des timestamps
- [x] Calcul automatique des écarts temporels

---

## 🚀 7. Utilisation du Système

### Scénario Normal
1. **Créer un test** avec heure de début : `14:00` et heure de fin : `16:00`
2. **Ouvrir le cockpit** à `13:45`
   - Le bouton "Démarrer" affiche : *"Disponible dans 00:15:00"*
3. **Attendre jusqu'à 14:00**
   - Le bouton se déverrouille automatiquement
4. **Démarrer le test** à `14:00:00`
   - Le chronomètre commence immédiatement
5. **Intervention physique**
   - L'opérateur réalise ses mesures sur le terrain
6. **Clôturer à 14:45**
   - Le système enregistre la fin réelle
   - Le tableau de saisie s'ouvre automatiquement
7. **Remplir les mesures**
8. **Valider et générer le rapport PDF**

### Scénario de Tentative Précoce
1. Créer un test prévu pour `14:00`
2. Essayer de démarrer à `13:50`
   - ❌ Backend retourne : *"Verrouillage de sécurité : Ce test ne peut démarrer que dans 10 minutes."*
   - Le bouton reste grisé

---

## 📈 8. Améliorations Futures Possibles

- [ ] Notifications push quand le test devient disponible
- [ ] Tolérance configurable (ex: ±5 min) pour les cas exceptionnels approuvés
- [ ] Dashboard de supervision temps réel des tests en attente
- [ ] Alertes si un test dépasse l'heure de fin planifiée
- [ ] Export des écarts temporels pour analyse de performance

---

## 🛠️ 9. Dépendances Techniques

### Backend
- Laravel 10+
- Carbon (manipulation de dates)
- Eloquent ORM

### Frontend
- React 18+
- TanStack Query (react-query)
- Lucide Icons
- Tailwind CSS
- TypeScript

---

**Date de dernière modification :** 2026-02-01  
**Version :** 1.0.0  
**Statut :** ✅ Production Ready
