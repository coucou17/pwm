const BASE_URL = "https://pwm-o9t9.onrender.com"; // Ton URL Render officielle

document.addEventListener("DOMContentLoaded", async () => {
  // On attend chaque fonction pour éviter les bugs d'affichage
  await getProfile();
  await initAuthMenu();
  await checkProtectedPage();
  await initCitations();
  await initCharts();
});

/* ============================
   Mise à jour du menu
============================ */
async function getProfile() {
  try {
    // Changement de l'URL et ajout de credentials: "include"
    const resp = await fetch(`${BASE_URL}/api/profile`, { credentials: "include" });
    if (!resp.ok) return null;
    const body = await resp.json();
    return body.user || null;
  } catch (e) {
    console.error("Erreur getProfile:", e);
    return null;
  }
}

async function initAuthMenu() {
  const linkConnexion = document.getElementById("link-connexion");
  const btnLogout = document.getElementById("logout-link");

  const user = await getProfile();
  if (user) {
    if (linkConnexion) linkConnexion.style.display = "none";
    if (btnLogout) {
      btnLogout.style.display = "inline-block";
      btnLogout.onclick = async () => {
        // Logout vers Render
        await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" });
        window.location.reload();
      };
    }
    console.log("Connecté en tant que:", user.nome);
  } else {
    if (btnLogout) btnLogout.style.display = "none";
    if (linkConnexion) linkConnexion.style.display = "inline";
  }
}

async function checkProtectedPage() {
  const protectedPages = ["Quiz.html", "formulaire-citation.html", "critiques.html"];
  const currentPage = window.location.pathname.split("/").pop();

  if (!protectedPages.includes(currentPage)) return;

  const user = await getProfile();
  if (!user) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "connexion.html";
  }
}

async function initCitations() {
  const container = document.getElementById("citationsContainer");
  const themesBar = document.getElementById("citations-themes");
  if (!container) return;

  // Récupération des citations sur Render
  const resp = await fetch(`${BASE_URL}/api/citations`);
  const citations = await resp.json();

  const citationAleatoire = citations.map(c => c.texte);
  const nombreAleatoire = Math.floor(Math.random() * citationAleatoire.length);
  const elementAleatoire = document.getElementById("elementAleatoire");
  if (elementAleatoire) {
    elementAleatoire.textContent = citationAleatoire[nombreAleatoire];
  }

  let user = await getProfile();
  const userId = user?.id || null;

  const themes = ["Tous", ...Array.from(new Set(citations.map(c => c.theme)))];
  themesBar.innerHTML = "";
  themes.forEach((t, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = t;
    btn.dataset.theme = t === "Tous" ? "all" : t;
    if (i === 0) btn.classList.add("active");
    btn.addEventListener("click", () => {
      themesBar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCitations(btn.dataset.theme);
    });
    themesBar.appendChild(btn);
  });

  async function renderCitations(filterTheme = "all") {
    container.innerHTML = "";
    const filtered = citations.filter(c => filterTheme === "all" || c.theme === filterTheme);

    for (const c of filtered) {
      const card = document.createElement("article");
      card.className = "citation-card";
      const quote = document.createElement("p");
      quote.className = "quote";
      quote.textContent = c.texte;
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = "Thème : " + c.theme;
      const actions = document.createElement("div");
      actions.className = "actions";

      const likeBtn = document.createElement("button");
      likeBtn.className = "like-btn";
      likeBtn.innerHTML = `👍 <span class="count">${c.likes}</span>`;

      likeBtn.addEventListener("click", async () => {
        if (!userId) return alert("Connecte-toi pour liker !");
        try {
          const res = await fetch(`${BASE_URL}/api/citations/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ citation_id: c.id }),
            credentials: "include"
          });
          const data = await res.json();
          if (data.success) {
            likeBtn.querySelector(".count").textContent = data.likes;
            renderTopCitations();
            // Pour le graphique, on recharge la page ou on rappelle initCharts
          } else {
            alert(data.error || "Erreur");
          }
        } catch (e) { console.error(e); }
      });

      actions.appendChild(likeBtn);
      card.appendChild(quote);
      card.appendChild(meta);
      card.appendChild(actions);
      container.appendChild(card);
    }
  }

  async function renderTopCitations() {
    const tableBody = document.querySelector("#topCitationsTable tbody");
    if (!tableBody) return;
    const resp = await fetch(`${BASE_URL}/api/citations`);
    const data = await resp.json();
    data.sort((a, b) => b.likes - a.likes);
    tableBody.innerHTML = "";
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${item.theme}</td><td>${item.texte}</td><td>${item.likes}</td>`;
      tableBody.appendChild(row);
    });
  }

  renderCitations("all");
  renderTopCitations();
}

async function getLikesByTheme() {
  try {
    const res = await fetch(`${BASE_URL}/api/citations/likes-by-theme`);
    const rows = await res.json();
    const themes = {};
    rows.forEach(row => { themes[row.theme] = Number(row.total_likes) || 0; });
    return themes;
  } catch (err) {
    console.error("Erreur getLikesByTheme:", err);
    return {};
  }
}

async function initCharts() {
  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(async () => {
    const piechart = document.getElementById("piechart");
    if (!piechart) return;

    const themes = await getLikesByTheme();
    const dataArray = [["Thème", "Likes"]];
    // On ajoute dynamiquement les thèmes reçus de la DB
    Object.keys(themes).forEach(t => {
      dataArray.push([t, themes[t]]);
    });

    const data = google.visualization.arrayToDataTable(dataArray);
    const chart = new google.visualization.PieChart(piechart);
    chart.draw(data, { title: "Répartition des Thèmes Préférés", pieHole: 0.2 });
  });
}
