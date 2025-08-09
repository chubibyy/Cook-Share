-- Script SQL pour insérer des challenges de test
-- Basé sur la structure existante de la table challenges

-- Challenge personnel/global (sans club_id)
INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date
) VALUES (
  'Défi Pâtes Créatives',
  'Créez un plat de pâtes original en utilisant au moins 3 légumes de saison et une sauce faite maison.',
  'Utilisez des pâtes fraîches ou sèches, au moins 3 légumes différents, et préparez votre sauce sans utiliser de sauce industrielle',
  'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800',
  100,
  NOW(),
  NOW() + INTERVAL '30 days'
);

INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date
) VALUES (
  'Maître des Desserts',
  'Préparez un dessert sans sucre raffiné en utilisant uniquement des édulcorants naturels.',
  'Miel, sirop d''érable, fruits ou purée de dattes autorisés. Aucun sucre blanc, cassonade ou édulcorants artificiels',
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
  150,
  NOW(),
  NOW() + INTERVAL '21 days'
);

INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date
) VALUES (
  'Cuisine Zéro Déchet',
  'Cuisinez un repas complet en utilisant les épluchures et restes que vous auriez normalement jetés.',
  'Réutilisez les épluchures de légumes, fanes, ou restes de la veille pour créer un plat savoureux',
  'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=800',
  200,
  NOW(),
  NOW() + INTERVAL '14 days'
);

INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date
) VALUES (
  'Spécialité Régionale',
  'Reproduisez un plat traditionnel d''une région française différente de la vôtre.',
  'Choisissez une région française et préparez un de ses plats emblématiques avec les techniques traditionnelles',
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800',
  120,
  NOW(),
  NOW() + INTERVAL '25 days'
);

-- Challenge avec club_id (si la structure supporte les clubs)
-- Note: Si la colonne club_id n'existe pas, ces requêtes échoueront
-- Dans ce cas, vous pouvez les ignorer ou d'abord ajouter la colonne :
-- ALTER TABLE challenges ADD COLUMN club_id UUID REFERENCES clubs(id);

/*
INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date,
  club_id
) VALUES (
  'Défi Club : Cuisine du Monde',
  'Chaque membre du club doit préparer un plat d\'un pays différent. Objectif : faire le tour du monde culinaire ensemble !',
  'Coordination requise entre membres pour éviter les doublons de pays. Plats traditionnels authentiques uniquement',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  250,
  NOW(),
  NOW() + INTERVAL '45 days',
  (SELECT id FROM clubs WHERE name LIKE '%Cuisine%' LIMIT 1)
);

INSERT INTO challenges (
  title,
  description,
  constraint_text,
  challenge_img,
  reward_xp,
  start_date,
  end_date,
  club_id
) VALUES (
  'Battle Club : Ingrédient Mystère',
  'Tous les membres reçoivent le même ingrédient mystère et doivent créer leur meilleure recette avec.',
  'L''ingrédient mystère sera révélé le jour J. Utilisation obligatoire comme ingrédient principal',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  300,
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '10 days',
  (SELECT id FROM clubs WHERE name LIKE '%Défi%' OR name LIKE '%Battle%' LIMIT 1)
);
*/

-- Exemples de participations (optionnel)
-- Remplacez les UUIDs par des IDs réels de votre base de données

/*
INSERT INTO challenge_participants (
  challenge_id,
  user_id,
  status
) VALUES (
  (SELECT id FROM challenges WHERE title = 'Défi Pâtes Créatives' LIMIT 1),
  'votre-user-id-ici',
  'en_cours'
);

INSERT INTO challenge_participants (
  challenge_id,
  user_id,
  status
) VALUES (
  (SELECT id FROM challenges WHERE title = 'Maître des Desserts' LIMIT 1),
  'votre-user-id-ici',
  'reussi'
);
*/

-- Vérification des challenges insérés
SELECT 
  id,
  title,
  reward_xp,
  start_date,
  end_date,
  CASE 
    WHEN end_date > NOW() THEN 'Actif'
    ELSE 'Terminé'
  END as statut
FROM challenges 
ORDER BY id DESC
LIMIT 10;