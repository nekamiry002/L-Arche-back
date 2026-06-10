-- Ajoute 'gardien' et 'banni' aux valeurs autorisées pour le role
-- Nécessaire pour la fonctionnalité de ban (userController.banUser)

ALTER TABLE utilisateurs
DROP CONSTRAINT IF EXISTS chk_role;

ALTER TABLE utilisateurs
ADD CONSTRAINT chk_role CHECK (role IN ('utilisateur', 'gardien', 'admin', 'banni'));
