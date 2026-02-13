<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait HasAuditLog
{
    /**
     * Boot the trait and register observers
     */
    public static function bootHasAuditLog()
    {
        static::created(function ($model) {
            $model->logAudit('created');
        });

        static::updated(function ($model) {
            // Uniquement si des attributs ont changé
            if (count($model->getChanges()) > 0) {
                $model->logAudit('updated');
            }
        });

        static::deleted(function ($model) {
            $model->logAudit('deleted');
        });
    }

    /**
     * Enregistrer une trace d'audit
     */
    public function logAudit(string $event)
    {
        $old = null;
        $new = $this->getAttributes();

        if ($event === 'updated') {
            $changedAttributes = array_keys($this->getChanges());
            $old = array_intersect_key($this->getOriginal(), array_flip($changedAttributes));
            $new = $this->getChanges();
        }

        // Exclure les colonnes de maintenance de Laravel pour plus de clarté
        $exclude = ['updated_at', 'created_at', 'deleted_at'];
        if ($old) {
            $old = array_diff_key($old, array_flip($exclude));
        }
        $new = array_diff_key($new, array_flip($exclude));

        // Si après filtrage il n'y a plus de changement (ex: seulement updated_at a changé)
        if ($event === 'updated' && empty($new)) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::check() ? Auth::id() : null,
            'event' => $event,
            'auditable_type' => get_class($this),
            'auditable_id' => $this->getKey(),
            'old_values' => $old,
            'new_values' => $new,
            'url' => Request::fullUrl(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'tags' => $this->getAuditTag(),
        ]);
    }

    /**
     * Déterminer le tag par défaut (Nom de la table ou propriété du modèle)
     */
    protected function getAuditTag()
    {
        if (property_exists($this, 'auditTag')) {
            return $this->auditTag;
        }
        return strtoupper($this->getTable());
    }
}
