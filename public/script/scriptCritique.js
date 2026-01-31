document.addEventListener("DOMContentLoaded", async () => {

  const paroleVietate = ["dégueulasse", "imbécile", "stupide"];
  const BASE_URL = "https://pwm-o9t9.onrender.com"; // Ton URL Render

  /* ============================
     Mise à jour du menu
  ============================ */

  async function getProfile() {
    try {
      // Ajout de BASE_URL et "include" pour les cookies
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

  /*********** chart *************/

  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(async () => {
    if (!document.getElementById("chart_div")) return;

    try {
      const res = await fetch(`${BASE_URL}/api/critiques/etat`);
      const etat = await res.json();
      let positif = etat.positif;
      let negatif = etat.negatif;

      let intermediaire = 2 + (Math.floor(Math.random() * negatif));
      let excellent = (Math.floor(Math.random() * positif)) + 1;
      let bien = 5 + (positif + negatif);

      const data = google.visualization.arrayToDataTable([
        ["étoile", "avis"],
        ["5★", excellent],
        ["4★", bien],
        ["3★", intermediaire],
        ["2★", positif],
        ["1★", negatif]
      ]);

      const options = {
        title: "CRITIQUES, ANALYSES ET AVIS",
        chartArea: { width: "50%" },
        hAxis: { title: "Total avis", minValue: 0 },
        vAxis: { title: "Catégories" }
      };

      const chart = new google.visualization.BarChart(document.getElementById("chart_div"));
      chart.draw(data, options);
    } catch (error) {
      console.error("Erreur drawMultSeries:", error);
    }
  });

  /**************** critique ********************/

  const critiquesContainer = document.getElementById("critiques-container");
  const addCritiqueBtn = document.getElementById("add-critique");
  const critiqueText = document.getElementById("critique-text");

  if (!critiquesContainer || !addCritiqueBtn || !critiqueText) return;

  const user = await getProfile();
  if (!user) return; // Déjà géré par la redirection plus haut

  async function fetchCritiques() {
    const res = await fetch(`${BASE_URL}/api/critiques`);
    return await res.json();
  }

  async function fetchReponses(critiqueId) {
    const res = await fetch(`${BASE_URL}/api/critiques/${critiqueId}/reponses`);
    return await res.json();
  }

  async function renderCritiques() {
    const critiques = await fetchCritiques();
    critiquesContainer.innerHTML = "";

    for (const critique of critiques) {
      const div = document.createElement("div");
      div.className = "critique";
      div.innerHTML = `
        <div class="critique-header">
          <span><b>${critique.nom}</b></span>
          <span>${new Date(critique.date_publication).toLocaleString()}</span>
        </div>
        <div class="critique-text">${critique.texte}</div>
        <div class="actions">
          <button class="like-btn" data-id="${critique.id}">👍 ${critique.likes}</button>
          <button class="reply-btn" data-id="${critique.id}">💬 Répondre</button>
        </div>
        <div class="reponses" id="reponses-${critique.id}"></div>
      `;
      critiquesContainer.appendChild(div);

      const reponses = await fetchReponses(critique.id);
      const reponsesDiv = div.querySelector(`#reponses-${critique.id}`);
      reponses.forEach(rep => {
        const repDiv = document.createElement("div");
        repDiv.innerHTML = `<b>${rep.nom}</b> (${new Date(rep.date_reponse).toLocaleTimeString()}) : ${rep.texte}`;
        reponsesDiv.appendChild(repDiv);
      });

      const likeBtn = div.querySelector(".like-btn");
      likeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`${BASE_URL}/api/critiques/${critique.id}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ utilisateur_id: user.id }),
            credentials: "include"
          });
          if (res.ok) await renderCritiques();
          else alert(await res.text());
        } catch (err) {
          console.error(err);
        }
      });

      const replyBtn = div.querySelector(".reply-btn");
      replyBtn.addEventListener("click", () => {
        const replyBox = document.createElement("textarea");
        const sendBtn = document.createElement("button");
        sendBtn.textContent = "Envoyer";
        const replyContainer = div.querySelector(".reponses");
        replyContainer.appendChild(replyBox);
        replyContainer.appendChild(sendBtn);

        sendBtn.addEventListener("click", async () => {
          const texte = replyBox.value.trim();
          if (!texte) return alert("Écris une réponse !");
          if (paroleVietate.some(p => texte.includes(p))) return alert("Mot interdit !");

          try {
            const res = await fetch(`${BASE_URL}/api/critiques/${critique.id}/reponse`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nom: user.nome, texte, utilisateur_id: user.id }),
              credentials: "include"
            });
            if (res.ok) {
              alert("Réponse ajoutée ✅");
              await renderCritiques();
            }
          } catch (err) { console.error(err); }
        });
      });
    }
  }

  addCritiqueBtn.addEventListener("click", async () => {
    const txt = critiqueText.value.trim();
    if (!txt) return alert("Écris quelque chose !");
    if (paroleVietate.some(p => txt.includes(p))) return alert("Mot interdit !");

    try {
      const res = await fetch(`${BASE_URL}/api/critiques`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: user.nome, texte: txt, utilisateur_id: user.id }),
        credentials: "include"
      });
      if (res.ok) {
        alert("Critique ajoutée ✅");
        await renderCritiques();
      }
    } catch (err) { console.error(err); }
  });

  await renderCritiques();
});

