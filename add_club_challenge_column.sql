-- Script SQL pour ajouter la colonne is_club_challenge à la table challenges
-- Cette colonne permet de distinguer les challenges personnels des challenges de club

-- Ajouter la colonne is_club_challenge (false par défaut pour les challenges existants)
ALTER TABLE challenges 
ADD COLUMN is_club_challenge BOOLEAN DEFAULT false;

-- Mettre à jour les challenges existants comme challenges personnels (optionnel)
UPDATE challenges 
SET is_club_challenge = false 
WHERE is_club_challenge IS NULL;

-- Vérifier la structure de la table
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'challenges' 
ORDER BY ordinal_position;

-- Exemple d'insertion d'un challenge de club
INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date,
  is_club_challenge
) VALUES (
  'Battle Clubs : Pizza Royale',
  'Défi exclusif aux clubs ! Chaque club doit créer sa pizza signature et les membres votent pour la meilleure création collective.',
  'Chaque club inscrit doit présenter UNE pizza créée collaborativement par ses membres. Vote communautaire obligatoire.',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
  500,
  NOW(),
  NOW() + INTERVAL '30 days',
  true
);

INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date,
  is_club_challenge
) VALUES (
  'Tournoi Clubs : Cuisine Fusion',
  'Grand tournoi entre clubs ! Chaque club représente un pays et doit fusionner sa cuisine traditionnelle avec une cuisine moderne.',
  'Collaboration obligatoire entre membres du club. Minimum 3 membres participants par club. Fusion authentique requise.',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
  750,
  NOW() + INTERVAL '5 days',
  NOW() + INTERVAL '45 days',
  true
);

-- Vérifier les challenges par type
SELECT 
  title,
  is_club_challenge,
  CASE 
    WHEN is_club_challenge = true THEN 'Challenge de Club' 
    ELSE 'Challenge Personnel' 
  END as type_challenge,
  reward_xp,
  start_date,
  end_date
FROM challenges 
ORDER BY is_club_challenge, id DESC;