document.addEventListener("DOMContentLoaded", async () => {

  const BASE_URL = "https://pwm-o9t9.onrender.com"; // Ton URL Render

  /* ============================
     Mise à jour du menu
  ============================ */

  async function getProfile() {
    try {
      // Correction de l'URL et passage en credentials: "include"
      const resp = await fetch(`${BASE_URL}/api/profile`, { credentials: "include" });
      if (!resp.ok) return null;
      const body = await resp.json();
      return body.user || null;
    } catch (e) {
      console.error("Erreur getProfile:", e);
      return null;
    }
  }

  const linkConnexion = document.getElementById("link-connexion");
  const btnLogout = document.getElementById("logout-link");

  const user2 = await getProfile();
  if (user2) {
    if (linkConnexion) linkConnexion.style.display = "none";
    if (btnLogout) {
      btnLogout.style.display = "inline-block";
      btnLogout.onclick = async () => {
        // Ajout du chemin /logout
        await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" });
        window.location.reload();
      };
    }
    console.log("Connecté en tant que:", user2.nome);
  } else {
    if (btnLogout) btnLogout.style.display = "none";
    if (linkConnexion) linkConnexion.style.display = "inline";
  }

  const protectedPages = ["Quiz.html", "formulaire-citation.html", "critiques.html"];
  const currentPage = window.location.pathname.split("/").pop();

  if (protectedPages.includes(currentPage)) {
    const user3 = await getProfile();
    if (!user3) {
      alert("Vous devez être connecté pour accéder à cette page.");
      window.location.href = "connexion.html";
      return;
    }
  }

  /* ============================
     Envoi de la citation
  ============================ */

  const send = document.getElementById("citationForm");
  if (send) {
    send.addEventListener("submit", async function(e) {
      e.preventDefault();

      const data = {
        nom: document.getElementById("nom").value,
        citation: document.getElementById("citation-plus").value,
        auteur: document.getElementById("auteur").value,
        theme: document.getElementById("theme").value
      };

      try {
        // Ajout du chemin /send-citation correspondant à ton server.js
        const res = await fetch(`${BASE_URL}/send-citation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        alert(result.message);

        this.style.display = "none";
        document.getElementById("confirmation").classList.remove("hidden");
      } catch (err) {
        alert("Erreur lors de l’envoi de la citation 😢");
        console.error(err);
      }
    });
  }
});





