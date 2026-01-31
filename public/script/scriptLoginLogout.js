document.addEventListener("DOMContentLoaded", async () => {
    const connexionButton = document.getElementById("connexion-button");
    const registerForm = document.getElementById("register-form");
    const BASE_URL = "https://pwm-o9t9.onrender.com"; // URL de ton serveur Render

    if (connexionButton) {
        connexionButton.addEventListener("click", async function () {
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;

            try {
                // AJOUT DU CHEMIN /login ET DES CREDENTIALS
                const response = await fetch(`${BASE_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, email }),
                    credentials: "include" // Permet d'accepter le cookie JWT
                });

                const data = await response.json();

                if (data.authenticated) {
                    alert("Connecté !");
                    window.location.href = "index.html"; 
                } else {
                    alert(data.message);
                    window.location.href = "connexion.html";
                }

            } catch (err) {
                console.error("Erreur fetch login:", err);
                alert("Impossible de communiquer avec le serveur");
            }
        });
    }

    if (registerForm) {
        const button = document.getElementById("register-button");
        button.addEventListener("click", async function() {
            const email = document.getElementById("register-email").value;
            const nome = document.getElementById("register-nome").value;

            try {
                // AJOUT DU CHEMIN /register
                const response = await fetch(`${BASE_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, email })
                });

                const data = await response.json();

                if (data.registered) {
                    alert(data.message);
                    window.location.href = "connexion.html";
                } else {
                    alert(data.message);
                    window.location.href = "inscription.html";
                }
            } catch (err) {
                console.error("Erreur fetch register:", err);
                alert("Impossible de communiquer avec le serveur (register)");
            }
        });
    }
});
