window.onload = async function() { // Ajout de async
  
  const BASE_URL = "https://pwm-o9t9.onrender.com"; // Ton URL Render

  // --- Logique du Livre (Statique) ---
  const pages = [
    "style/immagini/libro/1.jpg",
    "style/immagini/libro/2.jpg",
    "style/immagini/libro/3.jpg",
    "style/immagini/libro/4.jpg",
    "style/immagini/libro/5.jpg",
    "style/immagini/libro/6.jpg",
    "style/immagini/libro/7.jpg",
    "style/immagini/libro/8.jpg",
    "style/immagini/libro/9.jpg",
    "style/immagini/libro/10.jpg",
    "style/immagini/libro/11.jpg"
  ];

  let currentPage = 0;
  const pageImage = document.getElementById("pageImage");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  if (pageImage && prevBtn && nextBtn) {
      function updatePage() {
        pageImage.src = pages[currentPage];
        prevBtn.disabled = currentPage === 0;
        nextBtn.disabled = currentPage === pages.length - 1;
      }

      prevBtn.addEventListener("click", () => {
        if (currentPage > 0) {
          currentPage--;
          updatePage();
        }
      });

      nextBtn.addEventListener("click", () => {
        if (currentPage < pages.length - 1) {
          currentPage++;
          updatePage();
        }
      });
      updatePage();
  }

  /* ============================
     Mise à jour du menu (Cloud)
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

  // CRUCIAL : Ajout de await
  const user2 = await getProfile();

  if (user2) {
    if (linkConnexion) linkConnexion.style.display = "none";
    if (btnLogout) {
      btnLogout.style.display = "inline-block";
      btnLogout.onclick = async () => {
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
  const currentPagePath = window.location.pathname.split("/").pop();

  if (protectedPages.includes(currentPagePath)) {
    const user3 = await getProfile();
    if (!user3) {
      alert("Vous devez être connecté pour accéder à cette page.");
      window.location.href = "connexion.html";
    }
  }
};
