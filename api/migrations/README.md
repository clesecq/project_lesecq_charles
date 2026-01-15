# Migrations de la base de données

Ce dossier contient les migrations SQL pour la base de données PostgreSQL.

## Comment exécuter une migration

### En environnement de développement local

```bash
psql -U <username> -d <database_name> -f api/migrations/001_add_discovered_by.sql
```

### En production (Render.com)

1. Se connecter à la base de données via le shell Render
2. Exécuter le contenu du fichier SQL manuellement
3. Ou utiliser un outil comme `pgAdmin` ou `DBeaver` pour exécuter le script

## Liste des migrations

- **001_add_discovered_by.sql** (2026-01-15) : Ajout de la colonne `discoveredBy` à la table `pollutions`
- **002_add_photo_blob.sql** (2026-01-15) : Ajout des colonnes `photo` (BYTEA) et `photoMimeType` pour stocker les photos uploadées

## Note importante

Si vous utilisez `sequelize.sync()` en mode développement, Sequelize créera automatiquement les colonnes manquantes. Cependant, en production, il est recommandé d'utiliser des migrations explicites.

Pour désactiver la synchronisation automatique en production, modifiez `api/src/index.ts` :

```typescript
// En production, ne pas synchroniser automatiquement
if (process.env.NODE_ENV !== 'production') {
  db.sequelize.sync()
    .then(() => {
      console.log("Synced db.");
    })
    .catch((err: Error) => {
      console.log("Failed to sync db: " + err.message);
    });
}
```
