
document.addEventListener("DOMContentLoaded", async () => {
   const connexionButton = document.getElementById("connexion-button");
 const registerForm = document.getElementById("register-form");
 

    


if (connexionButton) {
    connexionButton.addEventListener("click", async function () {
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;

        try {
            const response = await fetch('https://pwm-o9t9.onrender.com', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email })
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
            console.error("Erreur fetch:", err);
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
            const response = await fetch('https://pwm-o9t9.onrender.com', {
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





