
document.addEventListener("DOMContentLoaded", async () => {

const paroleVietate= ["dégueulasse", "imbécile", "stupide"];


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

  const user2 = await getProfile();
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
  const currentPage = window.location.pathname.split("/").pop();

  if (!protectedPages.includes(currentPage)) return ;

  const user3 = await getProfile();
  if (!user3) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "connexion.html";
  }




/*********** chart *************/

  google.charts.load("current", { packages: ["corechart"] });
  google.charts.setOnLoadCallback(async () => {
 
  if (!document.getElementById("chart_div")) return;

  try {
    const res = await fetch('https://pwm-o9t9.onrender.com');
    const etat = await res.json();
    let positif = etat.positif;
    let negatif = etat.negatif;

    // scelta personnale
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
  if (!user) {
    window.location.href = "connexion.html";
    return;
  }

  console.log("Utilisateur connecté :", user); //  verifico che user.id esiste

  // recupero i critici da MySQL
  async function fetchCritiques() {
    const res = await fetch('https://pwm-o9t9.onrender.com');
    const data = await res.json();
    return data;
  }

  // recupero le risposte di una critica
  async function fetchReponses(critiqueId) {
    const res = await fetch(`https://pwm-o9t9.onrender.com{critiqueId}/reponses`);
    return await res.json();
  }

  // stampare la critica
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

      //  Bouton Like
      const likeBtn = div.querySelector(".like-btn");
      likeBtn.addEventListener("click", async () => {
        try {
          const res = await fetch(`https://pwm-o9t9.onrender.com{critique.id}/like`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ utilisateur_id: user.id })
          });

          if (res.ok) {
            await renderCritiques();
          } else {
            const msg = await res.text();
            alert(msg);
          }
        } catch (err) {
          console.error(err);
          alert("Erreur lors du like");
        }
      });

      // Bouton Répondre
      const replyBtn = div.querySelector(".reply-btn");
      replyBtn.addEventListener("click", () => {
        const replyBox = document.createElement("textarea");
        replyBox.placeholder = "Écrire une réponse...";
        const sendBtn = document.createElement("button");
        sendBtn.textContent = "Envoyer";

        const replyContainer = div.querySelector(".reponses");
        replyContainer.appendChild(replyBox);
        replyContainer.appendChild(sendBtn);

        sendBtn.addEventListener("click", async () => {
          const texte = replyBox.value.trim();
          if (!texte) return alert("Écris une réponse !");

        for (let parola of paroleVietate) {
            if(texte.includes(parola)) {
                 return alert("Le texte contient un mot interdit. Veuillez le supprimez.");
            } 
         }
   try {
            const res = await fetch(`https://pwm-o9t9.onrender.com{critique.id}/reponse`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                nom: user.nome,
                texte,
                utilisateur_id: user.id
              })
            });

            if (res.ok) {
              alert("Réponse ajoutée ✅");
              await renderCritiques();
            } else {
              alert("Erreur lors de l’ajout de la réponse");
            }
          } catch (err) {
            console.error(err);
          }
        });
      });
    }
  }

  // --- aggiungere una critica
  addCritiqueBtn.addEventListener("click", async () => {
    const txt = critiqueText.value.trim();
    if (!txt) return alert("Écris quelque chose !");

        for (let parola of paroleVietate) {
            if(txt.includes(parola)) {
                alert("Le texte contient un mot interdit. Veuillez le supprimez.");
                return;
            }
        }
  try {
      const res = await fetch('https://pwm-o9t9.onrender.com', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: user.nome,
          texte: txt,
          utilisateur_id: user.id
        })
      });

      if (res.ok) {
        alert("Critique ajoutée ✅");
        await renderCritiques();
      } else {
        alert("Erreur lors de l’ajout");
      }

    } catch (err) {
      console.error(err);
    }
  });

  // stampare
  await renderCritiques();
});
