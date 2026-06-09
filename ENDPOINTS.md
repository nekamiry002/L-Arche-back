# L-Arche API — Liste des endpoints

Base URL : `http://localhost:3000/api`  
Auth : header `Authorization: Bearer <access_token>` (token Supabase)

---

## Auth — `/api/auth`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/signup` | Non | Créer un compte |
| POST | `/signin` | Non | Connexion — retourne `{ session: { access_token, refresh_token, user } }` |
| POST | `/refresh` | Non | Rafraîchir le token — body: `{ refresh_token }` |
| POST | `/signout` | Non | Déconnexion — body: `{ user_id }` |

---

## Utilisateurs — `/api/users`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/me` | Oui | Mon profil |
| PATCH | `/me` | Oui | Mettre à jour mon profil |
| POST | `/me/verify-identity` | Oui | Marquer identité comme vérifiée |
| GET | `/gardiens` | Oui | Chercher des gardiens (filtres ci-dessous) |
| GET | `/gardiens/:id` | Oui | Profil public d'un gardien |
| GET | `/` | Admin | Liste tous les utilisateurs |
| PATCH | `/:id/ban` | Admin | Bannir un utilisateur |
| PATCH | `/:id/verify-gardien` | Admin | Valider le profil gardien |

**Filtres GET /gardiens :**
- `espece` — ex: `chien`
- `note_min` — ex: `4`
- `lat`, `lng`, `distance_km` — filtre géographique (Haversine)
- `verifie=true`
- `limit`, `offset`

---

## Animaux — `/api/animals`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Oui | Mes animaux |
| POST | `/` | Oui | Créer un animal |
| GET | `/:id` | Oui | Détail d'un animal |
| PATCH | `/:id` | Oui | Modifier un animal |
| DELETE | `/:id` | Oui | Supprimer un animal |
| POST | `/:id/upload-photo` | Oui | Uploader la photo (form-data, champ `photo`) |

---

## Espèces — `/api/species`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Oui | Liste toutes les espèces/races |
| GET | `/:id` | Oui | Détail d'une espèce/race |
| POST | `/` | Admin | Créer une espèce/race |
| PATCH | `/:id` | Admin | Modifier |
| DELETE | `/:id` | Admin | Supprimer |

---

## Réservations — `/api/reservations`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | Oui | Mes réservations (params: `role=proprietaire\|gardien`) |
| POST | `/` | Oui | Créer une demande de garde |
| GET | `/:id` | Oui | Détail d'une réservation |
| PATCH | `/:id/confirm` | Oui (gardien) | Accepter la garde |
| PATCH | `/:id/cancel` | Oui | Annuler la garde |
| PATCH | `/:id/complete` | Oui | Marquer comme terminée |

**Body POST :**
```json
{ "gardien_id": "", "animal_id": "", "date_debut": "YYYY-MM-DD", "date_fin": "YYYY-MM-DD", "assurance": false, "instructions": "" }
```

---

## Disponibilités — `/api/disponibilites`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/me` | Oui | Mes disponibilités |
| GET | `/:userId` | Oui | Disponibilités d'un gardien |
| POST | `/` | Oui | Déclarer une disponibilité |
| PATCH | `/:id` | Oui | Modifier |
| DELETE | `/:id` | Oui | Supprimer |

---

## Avis — `/api/reviews`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/me` | Oui | Avis que j'ai donnés |
| GET | `/user/:userId` | Oui | Avis reçus par un utilisateur |
| POST | `/` | Oui | Laisser un avis (réservation terminée uniquement) |
| DELETE | `/:id` | Oui (auteur/admin) | Supprimer un avis |

**Body POST :**
```json
{ "reservation_id": "", "cible_id": "", "note": 5, "commentaire": "", "recommande": true }
```

---

## Journal de garde — `/api/journaux`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/:reservationId` | Oui (propriétaire/gardien) | Lire le journal |
| POST | `/:reservationId` | Oui (propriétaire/gardien) | Ajouter une entrée texte/statut/alerte |
| POST | `/:reservationId/upload` | Oui | Uploader une photo (form-data, champ `media`) |
| DELETE | `/entries/:entryId` | Oui (auteur/admin) | Supprimer une entrée |

**type_entree :** `photo` | `message` | `statut` | `alerte`

---

## Carnets de santé — `/api/carnets-sante`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| GET | `/:animalId` | Oui (proprio + gardien en garde active) | Lire le carnet |
| POST | `/:animalId` | Oui (proprio) | Ajouter une entrée |
| POST | `/:animalId/upload` | Oui (proprio) | Uploader un document (form-data, champ `document`) |
| DELETE | `/entries/:entryId` | Oui (proprio/admin) | Supprimer |

**type_document :** `vaccin` | `traitement` | `visite` | `autre`

---

## Signalements — `/api/signalements`
| Méthode | Route | Auth | Description |
|---|---|---|---|
| POST | `/` | Oui | Signaler un utilisateur |
| GET | `/me` | Oui | Mes signalements émis |
| GET | `/` | Admin | Tous les signalements (param: `statut=ouvert\|traite\|ferme`) |
| PATCH | `/:id` | Admin | Changer le statut |

---

## Health check
| Méthode | Route | Auth |
|---|---|---|
| GET | `/api/health` | Non |
