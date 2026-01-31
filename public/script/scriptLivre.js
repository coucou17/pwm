window.onload = function(){
  
  // Lista delle pagine del libro
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

  // Inizializzo la stampa
  updatePage();







  /* ============================
   Aggionamento del menu
============================ */
  async function getProfile() {
  try {
    const resp = await fetch('https://pwm-o9t9.onrender.com', { credentials: "same-origin" });
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

  const user2 =  getProfile();
  if (user2) {
    if (linkConnexion) linkConnexion.style.display = "none";
    if (btnLogout) {
      btnLogout.style.display = "inline-block";
      btnLogout.onclick = async () => {
        await fetch('https://pwm-o9t9.onrender.com', { method: "POST" });
        window.location.reload();
      };
    }
    console.log("Connecté en tant que:", user2.nome);
  } else {
    if (btnLogout) btnLogout.style.display = "none";
    if (linkConnexion) linkConnexion.style.display = "inline";
  }


  const protectedPages = ["Quiz.html", "formulaire-citation.html", "critiques.html"];
  const currentPage2 = window.location.pathname.split("/").pop();

  if (!protectedPages.includes(currentPage2)) return ;

  const user3 =  getProfile();
  if (!user3) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "connexion.html";
  }
 };