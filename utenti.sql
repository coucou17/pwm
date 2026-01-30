CREATE DATABASE IF NOT EXISTS mio_db;
USE mio_db;

CREATE TABLE IF NOT EXISTS utenti (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  UNIQUE KEY unique_user (nome, email)
);

CREATE TABLE IF NOT EXISTS critiques (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT,
  nom VARCHAR(100) NOT NULL,
  texte TEXT NOT NULL,
  date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,
  likes INT DEFAULT 0,
  FOREIGN KEY (utilisateur_id) REFERENCES utenti(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reponses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  critique_id INT NOT NULL,
  utilisateur_id INT,
  nom VARCHAR(100) NOT NULL,
  texte TEXT NOT NULL,
  date_reponse DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (critique_id) REFERENCES critiques(id) ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utenti(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  critique_id INT NOT NULL,
  utilisateur_id INT NOT NULL,
  date_like DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (critique_id) REFERENCES critiques(id) ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utenti(id) ON DELETE CASCADE,
  UNIQUE (critique_id, utilisateur_id) 
);




CREATE TABLE IF NOT EXISTS citations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  texte TEXT NOT NULL,
  theme VARCHAR(100),
  likes INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS citation_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  utilisateur_id INT NOT NULL,
  date_like DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (utilisateur_id),
  FOREIGN KEY (utilisateur_id) REFERENCES utenti(id) ON DELETE CASCADE
);



/** INIZIALIZZAZIONE **/
INSERT INTO citations (texte, theme) VALUES
("Je t'aime d'un amour que je ne comprends moi-même.", "Amour"),
("Vivre, c'est risquer de souffrir, mais c'est aussi risquer d'aimer.", "Vie"),
("Ce qu'on ne dit pas fait parfois plus de bruit que ce qu'on crie.", "Littérature"),
("Je pense, donc je suis.", "Philosophie"),
("On ne voit bien qu’avec le coeur.", "Amour"),
("La douleur forge parfois les plus belles renaissances.", "Vie");






