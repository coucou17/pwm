window.onload = function(){


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
  const currentPage = window.location.pathname.split("/").pop();

  if (!protectedPages.includes(currentPage)) return ;

  const user3 =  getProfile();
  if (!user3) {
    alert("Vous devez être connecté pour accéder à cette page.");
    window.location.href = "connexion.html";
  }


    /* ============================
   script del quiz
============================ */

  const quiz = document.getElementById("quiz-container");
    if (quiz) {

        const questions = [
            {
                question: "Laurie est née en quel mois ?",
                options: ["Février", "Novembre", "Juillet"],
                answer: "Novembre"
            },
            {
                question: "Qui est l'ami le plus proche de Laurie ?",
                options: ["Sophie", "Marni", "Clara"],
                answer: "Clara"
            },
            {
                question: "La famille de laurie est composé de combiem de membre ?",
                options: ["5", "2", "3"],
                answer: "5"
            },
             {
                question: "Comment s'appelle la mère de laurie ?",
                options: ["Marie","Lucie", "Angelle"],
                answer: "Lucie"
            },
            {
                question: "Où s'est déroulé la première rencontre entre sami et laurie ?",
                options: ["Bus","église", "Classe"],
                answer: "Classe"
            },
              {
                question: "Quel est le surnom que laurie et sami ont en commun ?",
                options: ["soleil","mimi", "Coucou"],
                answer: "Coucou"
            },
              {
                question: "Quel est le premier mot que sami adit à laurie lors de leur première conversation ?",
                options: ["Salut","Jolie", "Hey"],
                answer: "Salut"
            },
               {
                question: "Quel est le surnom affectueux que sami donne a laurie ?",
                options: ["Miss indifférente","Mme je sais tout", "Miss parfaire"],
                answer: "Miss indifférente"
            },
               {
                question: "Lors du premier baiser entre laurie et sami, qui à fait le premier pat ?",
                options: ["Laurie","Les deux", "Sami"],
                answer: "Laurie"
            },
              {
                question: "Quand ont t'ils officialiser leur couple ?",
                options: ["17 Novembre","14 Février", "12 Décembre"],
                answer: "12 Décembre"
            }
        ];







        const question2 = [
            {
                question: "Laurie est née en quel mois ?",
                options: ["Février", "Novembre", "Juillet"],
                answer: "Novembre"
            },
              {
                question: "Quand ont t'ils officialiser leur couple ?",
                options: ["17 Novembre","14 Février", "12 Décembre"],
                answer: "12 Décembre"
            }
        ];


        const question3 = [
            {
                question: "Laurie est née en quel mois ?",
                options: ["Février", "Novembre", "Juillet"],
                answer: "Novembre"
            },
             {
                question: "Laurie est née en quel mois ?",
                options: ["Février", "Novembre", "Juillet"],
                answer: "Novembre"
            },
              {
                question: "Quand ont t'ils officialiser leur couple ?",
                options: ["17 Novembre","14 Février", "12 Décembre"],
                answer: "12 Décembre"
            }
        ];


        const question4 = [
            {
                question: "Laurie est née en quel mois ?",
                options: ["Février", "Novembre", "Juillet"],
                answer: "Novembre"
            },
            {
                question: "Qui est l'ami le plus proche de Laurie ?",
                options: ["Sophie", "Marni", "Clara"],
                answer: "Clara"
            },
             {
                question: "Comment s'appelle la mère de laurie ?",
                options: ["Marie","Lucie", "Angelle"],
                answer: "Lucie"
            },
              {
                question: "Quand ont t'ils officialiser leur couple ?",
                options: ["17 Novembre","14 Février", "12 Décembre"],
                answer: "12 Décembre"
            }
        ];






// visualizzare un testo casuale
     ArrayConteniteur = [
      questions,
      question2,
      question3,
      question4
     ];

// ottenere la lunghezza della lista
const longueurArray = ArrayConteniteur.length;

// generare un numero casuale
let Aleatoire = Math.floor(Math.random() * longueurArray);

// selezionare e stampare l'elemento
let questionTest =ArrayConteniteur[Aleatoire];

        let currentQuestion = 0;
        let score = 0;

        const quizContainer = document.getElementById("quiz-container");
        const nextBtn = document.getElementById("next-btn");
        const restartBtn = document.getElementById("restart-btn");
        const result = document.getElementById("result");

        
        function showQuestion() {
            quizContainer.innerHTML = "";
            const q = questionTest[currentQuestion];

            const questionEl = document.createElement("h2");
            questionEl.textContent = q.question;
            quizContainer.appendChild(questionEl);

            q.options.forEach(option => {
                const btn = document.createElement("button");
                btn.textContent = option;
                btn.className = "option-btn";
                btn.onclick = () => checkAnswer(option, btn);
                quizContainer.appendChild(btn);
            });
           // const lunghezza = 
          const step = document.getElementById("step"); 
          step.textContent = `${currentQuestion + 1}/${questionTest.length}`;
         
        }

        function checkAnswer(option, btn) {
            const q = questionTest[currentQuestion];
            if (option === q.answer) {
                score++;
                btn.style.backgroundColor = "#4CAF50";
                btn.style.color= "white";
            } else {
                btn.style.backgroundColor = "red";
                btn.style.color= "white";
            }
            // Impedisce ulteriori clic
            document.querySelectorAll(".option-btn").forEach(b => b.disabled = true);

            nextBtn.style.display = "block";
        }

        nextBtn.addEventListener("click", () => {
            currentQuestion++;
            if (currentQuestion < questionTest.length) {
                showQuestion();
                nextBtn.style.display = "none";
            } else {
                showResult();
            }
        });

        restartBtn.addEventListener("click", () => {
            currentQuestion = 0;
            score = 0;
            restartBtn.style.display = "none";
            step.style.display= "block";
            result.textContent = "";

           // generare un numero casuale
            let Aleatoire = Math.floor(Math.random() * longueurArray);

           // selezionare e stampare l'elemento
            questionTest =ArrayConteniteur[Aleatoire];

            showQuestion();
        });

        function showResult() {
            quizContainer.innerHTML = "";
            result.textContent = `Ton score est ${score}/${questionTest.length}`;
            nextBtn.style.display = "none";
            step.style.display= "none";
            restartBtn.style.display = "block";
        }

        // avvio
        showQuestion();
    }
}