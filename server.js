// server.js
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const nodemailer = require("nodemailer");
const app = express();
const PORT = process.env.PORT || 3000;
// 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
const JWT_SECRET = "coucou";
const cors = require('cors');

// Place cette ligne AVANT tes routes app.post et app.get
app.use(cors({
  origin: 'https://697d568972d00e20577862b0--celadon-jalebi-bdc3ba.netlify.app', 
  credentials: true
}));


app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
app.use("/immagini", express.static("immagini"));
app.use(express.urlencoded({ extended: true }));

// --- Connexion MySQL 
const pool = mysql.createPool({
  host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
  user: "3v64absum5y4e4N.root",
  password: "Francette04!", // VOTRE_MOT_DE_PASSE_TIDB Tapez ici votre vrai mot de passe
  database: "test",
  port: 4000,
  ssl: {
    rejectUnauthorized: false // Indispensable pour TiDB Cloud
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


app.get("/", (req,res) => {  //redirect iniziale nella home
  res.redirect("/index.html");
});

// Middleware per proteggere i route
function isAuthenticated(req, res, next) {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ authenticated: false, message: "Non autorisé" });

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).redirect("/index.html");
    }
}

  /* ============================
           ROUTES API
============================ */

// LOGIN (nom + email)
app.post("/login", async (req, res) => {
  const { nome, email } = req.body;
  if (!nome || !email) {
    return res.status(400).json({ authenticated: false, message: "Tutti i campi sono obbligatori" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, nome, email FROM utenti WHERE nome = ? AND email = ?",
      [nome, email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ authenticated: false, message: "Utilisateur introuvable" });
    }

    const user = rows[0];

    // Creo il JWT
    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Inserisce il token in un cookie solo HTTP
res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",   // Indispensable pour la communication entre domaines différents
  maxAge: 3600000, 
  secure: true,       // Obligatoire pour le HTTPS sur Render
});


    return res.json({ authenticated: true, message: "Sei connesso" });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ authenticated: false, message: "Erreur serveur" });
  }
});

//  LOGOUT (cancella il cookie)
app.post("/logout",isAuthenticated, (req, res) => {
  res.clearCookie("token");
  return res.json({ authenticated: true, message: "Déconnecté" });
});

// test se conneso
app.get("/api/profile", isAuthenticated, (req, res) => {
  return res.json({ authenticated: true, user: req.user }); // {id, nome, email}
});



app.get("/Quiz.html", isAuthenticated, (req, res) => {
    res.sendFile(__dirname + "/public/Quiz.html");
});

app.get("/critiques.html", isAuthenticated, (req, res) => {
    res.sendFile(__dirname + "/public/critiques.html");
});


app.get("/formulaire-citation.html", isAuthenticated, (req, res) => {
    res.sendFile(__dirname + "/public/formulaire-citation.html");
});

// ===================
//   ROUTE REGISTER
// ===================
app.post("/register", async (req, res) => {
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ registered: false, message: "Nom et email requis" });
    }

    try {
        // verifico se l'email esiste già
        const [rows] = await pool.query("SELECT * FROM utenti WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res.status(400).json({ registered: false, message: "Cet email est déjà utilisé" });
        }

        // inserisco un nuovo user
        await pool.query("INSERT INTO utenti (nome, email) VALUES (?, ?)", [nome, email]);

        return res.json({ registered: true, message: "Inscription réussie, vous pouvez maintenant vous connecter" });

    } catch (err) {
        console.error("Erreur inscription:", err);
        return res.status(500).json({ registered: false, message: "Erreur serveur lors de l'inscription" });
    }
});

// Route per inviare la citazione
app.post("/send-citation", async (req, res) => {
  const { nom, citation, auteur, theme } = req.body;

  if (!nom || !citation || !auteur || !theme) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kiminoufrancette@gmail.com",
        pass: "icdn uuoz jfao evxz"
      }
    });

    await transporter.sendMail({
      from: `"Mon site citations" <kiminoufrancette@gmail.com>`,
      to: "kiminoufrancette2@gmail.com",
      subject: "Nouvelle citation proposée",
      text: `Nom: ${nom}\nAuteur: ${auteur}\nThème: ${theme}\nCitation: ${citation}`
    });

    res.json({ message: "Votre citation a bien été envoyée !" });
 } catch (err) {
  console.error("Erreur email:", err);
  res.status(500).json({ message: "Impossible d'envoyer l'email", error: err.toString() });
}
});

// recupero tutti i critici (dal più vecchio al più recente)
app.get("/api/critiques", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.nom, c.texte, c.date_publication, c.likes,
              COUNT(r.id) AS nb_reponses
       FROM critiques c
       LEFT JOIN reponses r ON c.id = r.critique_id
       GROUP BY c.id
       ORDER BY c.date_publication ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});


app.post("/api/critiques", async (req, res) => {
  // recupero i dati inviati dal navigatore
  const { nom, texte, utilisateur_id } = req.body;
  if (!nom || !texte) return res.status(400).send("Nom et texte sont requis");

  // analizzo il testo
  const pos = ["jolie", "merci", "j'aime", "bon", "merveilleux"];
  const neg = ["déteste", "horrible", "nul", "moche", "affreux", "nulle"];

let sentiment = "neutre";
if (pos.some(word => texte.includes(word))) sentiment = "positif";
else if (neg.some(word => texte.includes(word))) sentiment = "negatif";

  // salvo nella BD
  const [result] = await pool.query(
    "INSERT INTO critiques (nom, texte, utilisateur_id, sentiment) VALUES (?, ?, ?, ?)",
    [nom, texte, utilisateur_id || null, sentiment]
  );

  const [newCritique] = await pool.query(
    "SELECT * FROM critiques WHERE id = ?",
    [result.insertId]
  );

  res.status(201).json(newCritique[0]);
});

// metter mi pice ad una critica (1 solo like per user)
app.post("/api/critiques/:id/like", async (req, res) => {
  const critiqueId = req.params.id;
  const { utilisateur_id } = req.body;

  if (!utilisateur_id)
    return res.status(400).send("Utilisateur requis");

  try {
    // verifico se il user ha già messo mi piace
    const [rows] = await pool.query(
      "SELECT * FROM likes WHERE critique_id = ? AND utilisateur_id = ?",
      [critiqueId, utilisateur_id]
    );

    if (rows.length > 0) {
      return res.status(400).send("Tu as déjà liké cette critique !");
    }

    // se no, inserisco il like
    await pool.query(
      "INSERT INTO likes (critique_id, utilisateur_id) VALUES (?, ?)",
      [critiqueId, utilisateur_id]
    );

    // Incremento il contatore
    await pool.query("UPDATE critiques SET likes = likes + 1 WHERE id = ?", [
      critiqueId,
    ]);

    res.json({ message: "Like ajouté !" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// risposta ad una critica
app.post("/api/critiques/:id/reponse", async (req, res) => {
  const critiqueId = req.params.id;
  const { nom, texte, utilisateur_id } = req.body;

  if (!texte || !nom)
    return res.status(400).send("Nom et texte sont requis");


  // analizzo il testo
  const pos = ["jolie", "merci", "j'aime", "bon", "merveilleux"];
  const neg = ["déteste", "horrible", "nul", "moche", "affreux", "nulle"];

let sentiment = "neutre";
if (pos.some(word => texte.includes(word))) sentiment = "positif";
else if (neg.some(word => texte.includes(word))) sentiment = "negatif";


  try {
    await pool.query(
      "INSERT INTO reponses (critique_id, nom, texte, utilisateur_id, sentiment) VALUES (?, ?, ?, ?, ?)",
      [critiqueId, nom, texte, utilisateur_id || null, sentiment]
    );
    res.status(201).json({ message: "Réponse ajoutée !" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

// recuperare le risposte di una critica
app.get("/api/critiques/:id/reponses", async (req, res) => {
  const critiqueId = req.params.id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reponses WHERE critique_id = ? ORDER BY date_reponse ASC",
      [critiqueId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

app.get("/api/critiques/etat", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT sentiment, COUNT(*) AS total
      FROM critiques
      GROUP BY sentiment
    `);

    // inizializzazione
    let positif = 0;
    let negatif = 0;

    // analizzo i risultati
    rows.forEach(r => {
      if (r.sentiment === "positif") positif = r.total;
      if (r.sentiment === "negatif") negatif = r.total;
    });

    res.json({ positif, negatif });

  } catch (err) {
    console.error("Erreur /api/critiques/etat:", err);
    res.status(500).json({ error: "Erreur lors du calcul des avis" });
  }
});

// --- CITATIONS --- //
app.get("/api/citations", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM citations ORDER BY id");
    res.json(rows);
  } catch (err) {
    console.error("Erreur /api/citations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post("/api/citations/like", isAuthenticated, async (req, res) => {
  const { citation_id } = req.body;
  const userId = req.user.id; 
  if (!citation_id) return res.status(400).json({ error: "citation_id manquant" });

  try {
    // Verifico se user ha già messo un mi piace
    const [exists] = await pool.query(
      "SELECT 1 FROM citation_likes WHERE citation_id = ? AND utilisateur_id = ?",
      [citation_id, userId]
    );
    if (exists.length > 0) {
      return res.status(400).json({ error: "Déjà liké" });
    }

    // salvo il like
    await pool.query(
      "INSERT INTO citation_likes (citation_id, utilisateur_id) VALUES (?, ?)",
      [citation_id, userId]
    );

    // Incremento il contatore nella tabella citations
    await pool.query("UPDATE citations SET likes = likes + 1 WHERE id = ?", [citation_id]);

    // recupero il nuovo totale
    const [[{ likes }]] = await pool.query("SELECT likes FROM citations WHERE id = ?", [citation_id]);

    res.json({ success: true, likes });
  } catch (err) {
    console.error("Erreur POST /api/citations/like:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// recupero la somma dei like per tema
app.get("/api/citations/likes-by-theme", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT theme, SUM(likes) AS total_likes
      FROM citations
      GROUP BY theme
    `);

    res.json(rows.length ? rows : []);
  } catch (err) {
    console.error("Erreur /api/citations/likes-by-theme:", err);
    res.status(500).json({ message: "Erreur serveur lors du calcul des likes par thème" });
  }
});

app.use((req, res) => {
 res.status(404).send('Errore 404 - Risorsa non trovata');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});







