document.addEventListener("DOMContentLoaded", async () => {

  /* ============================
   Aggionamento del menu
============================ */

async function getProfile() {
  try {
    const resp = await fetch("/api/profile", { credentials: "same-origin" });
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
        await fetch("/logout", { method: "POST" });
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

  if (!protectedPages.includes(currentPage)) return ;

  const user3 = await getProfile();
  if (!user3) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "connexion.html";
  }




/* ============================
   1. script
============================ */


const send = document.getElementById("citationForm")
send.addEventListener("submit", async function(e) {
  e.preventDefault();

  const data = {
    nom: document.getElementById("nom").value,
    citation: document.getElementById("citation-plus").value,
    auteur: document.getElementById("auteur").value,
    theme: document.getElementById("theme").value
  };

  try {
    const res = await fetch("/send-citation", {
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
  
});




