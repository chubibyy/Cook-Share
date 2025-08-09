-- Script SQL pour insérer des challenges de test
-- Basé sur la structure existante de la table challenges

-- Challenge personnel (is_club_challenge = false)
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
  'Défi Pâtes Créatives',
  'Créez un plat de pâtes original en utilisant au moins 3 légumes de saison et une sauce faite maison.',
  'Utilisez des pâtes fraîches ou sèches, au moins 3 légumes différents, et préparez votre sauce sans utiliser de sauce industrielle',
  'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800',
  100,
  NOW(),
  NOW() + INTERVAL '30 days',
  false
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
  'Maître des Desserts',
  'Préparez un dessert sans sucre raffiné en utilisant uniquement des édulcorants naturels.',
  'Miel, sirop d''érable, fruits ou purée de dattes autorisés. Aucun sucre blanc, cassonade ou édulcorants artificiels',
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
  150,
  NOW(),
  NOW() + INTERVAL '21 days',
  false
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
  'Cuisine Zéro Déchet',
  'Cuisinez un repas complet en utilisant les épluchures et restes que vous auriez normalement jetés.',
  'Réutilisez les épluchures de légumes, fanes, ou restes de la veille pour créer un plat savoureux',
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
  200,
  NOW(),
  NOW() + INTERVAL '14 days',
  false
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
  'Spécialité Régionale',
  'Reproduisez un plat traditionnel d''une région française différente de la vôtre.',
  'Choisissez une région française et préparez un de ses plats emblématiques avec les techniques traditionnelles',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800',
  120,
  NOW(),
  NOW() + INTERVAL '25 days',
  false
);

-- Challenges de Club (is_club_challenge = true)
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
  'Battle Clubs : Menu 3 Services',
  'Défi collaboratif ! Chaque club doit créer un menu complet (entrée, plat, dessert) où chaque membre prend en charge un service.',
  'Collaboration obligatoire entre membres. Menu cohérent requis. Minimum 3 membres par club participants.',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  400,
  NOW(),
  NOW() + INTERVAL '35 days',
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
  'Tournoi Clubs : Cuisine du Monde',
  'Grand tournoi entre clubs ! Chaque club représente un pays et présente 3 plats traditionnels de ce pays.',
  'Un pays par club. Recherche culturelle obligatoire. Recettes authentiques uniquement. Vote de la communauté.',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800',
  600,
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '50 days',
  true
);

-- Vérification des challenges insérés par type
SELECT 
  id,
  title,
  is_club_challenge,
  CASE 
    WHEN is_club_challenge = true THEN '🏆 Challenge de Club' 
    ELSE '🎯 Challenge Personnel' 
  END as type_challenge,
  reward_xp,
  start_date,
  end_date,
  CASE 
    WHEN end_date > NOW() THEN '✅ Actif'
    ELSE '❌ Terminé'
  END as statut
FROM challenges 
ORDER BY is_club_challenge, id DESC;