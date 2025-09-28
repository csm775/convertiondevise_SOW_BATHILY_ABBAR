
const CLE_API = "45b221ed8ab3aefc7a9739c9";

const inputMontant = document.getElementById("saisie-montant");
const selectSource = document.getElementById("devise-source");
const selectCible = document.getElementById("devise-cible");
const boutonInverser = document.getElementById("inverser");
const zoneAffichage = document.getElementById("affichage");
const ligneTaux = document.getElementById("ligne-taux");
const boutonActualiser = document.getElementById("actualiser");
const zoneEtat = document.getElementById("etat");
const listeHistorique = document.getElementById("liste-historique");
const boutonViderHistorique = document.getElementById("vider-historique");


let tousLesTaux = {};
let deviseDeBase = "EUR";

// démarrage
chargerTaux(deviseDeBase);
afficherHistorique();
inputMontant.value = "100";
calculer();

// les tauxa
async function chargerTaux(devise) {
  zoneEtat.textContent = "Chargement…";

  try {
    const reponse = await fetch("https://v6.exchangerate-api.com/v6/" + CLE_API + "/latest/" + devise);
    const data = await reponse.json();

    if (data && data.result === "success") {
      tousLesTaux = data.conversion_rates;
      deviseDeBase = devise;

      zoneEtat.textContent = "Taux à jour";
      peuplerSelects();
      calculer();

    } else {
      zoneEtat.textContent = "Problème avec l'API";
      zoneAffichage.textContent = "Impossible de lire les taux";
      ligneTaux.textContent = "—";
    }
  } catch (erreur) {
    zoneEtat.textContent = "Erreur réseau";
    zoneAffichage.textContent = "Hors ligne — réessayez";
    ligneTaux.textContent = "—";
  }
}
 // alimente les listes
function peuplerSelects() {
  const devises = Object.keys(tousLesTaux).sort();
  selectSource.innerHTML = "";
  selectCible.innerHTML = "";

  for (let i = 0; i < devises.length; i++) {
    const d = devises[i];
    const opt1 = new Option(d, d);
    const opt2 = new Option(d, d);
    selectSource.add(opt1);
    selectCible.add(opt2);
  }
  selectSource.value = deviseDeBase;

  if (!selectCible.value) {
    selectCible.value = "USD";
  }
}

// calcul de conversion
function calculer() {
  const texte = (inputMontant.value || "").toString().replace(",", ".");
  const montant = parseFloat(texte);

  if (!montant || montant <= 0) {
    zoneAffichage.textContent = "Saisissez un montant";
    ligneTaux.textContent = "—";
    return;
  }

  const source = selectSource.value;
  const cible = selectCible.value;
  if (!tousLesTaux[source] && source !== deviseDeBase) {
    zoneAffichage.textContent = "Taux indisponibles";
    ligneTaux.textContent = "—";
    return;
  }
  if (!tousLesTaux[cible]) {
    zoneAffichage.textContent = "Taux indisponibles";
    ligneTaux.textContent = "—";
    return;
  }
  let taux;
  if (source === deviseDeBase) {
    taux = tousLesTaux[cible];
  } else {
    const tauxSourceVersBase = 1 / tousLesTaux[source];
    const tauxBaseVersCible = tousLesTaux[cible];
    taux = tauxSourceVersBase * tauxBaseVersCible;
  }

  const result = montant * taux;
  zoneAffichage.textContent = montant.toFixed(2) + " " + source + " = " + result.toFixed(2) + " " + cible;
  ligneTaux.textContent = "1 " + source + " = " + taux.toFixed(4) + " " + cible;

  enregistrerDansHistorique(montant, source, result, cible);
}

// historique
function enregistrerDansHistorique(montant, source, result, cible) {
  let histo = JSON.parse(localStorage.getItem("historique") || "[]");
  const maintenant = new Date().toLocaleString("fr-FR");
  const texte = montant.toFixed(2) + " " + source + " → " + result.toFixed(2) + " " + cible;

  const entree = { date: maintenant, texte: texte };
  histo.unshift(entree);

  if (histo.length > 10) {
    histo = histo.slice(0, 10);
  }

  localStorage.setItem("historique", JSON.stringify(histo));
  afficherHistorique();
}


function afficherHistorique() {
  const histo = JSON.parse(localStorage.getItem("historique") || "[]");
  listeHistorique.innerHTML = "";

  for (let i = 0; i < histo.length; i++) {
    const item = histo[i];
    const li = document.createElement("li");
    li.innerHTML = "<time>" + item.date + "</time> — " + item.texte;
    listeHistorique.appendChild(li);
  }
}


inputMontant.addEventListener("input", calculer);


selectSource.addEventListener("change", function () {
  if (selectSource.value !== deviseDeBase) {
    chargerTaux(selectSource.value);
  } else {
    calculer();
  }
});


selectCible.addEventListener("change", calculer);


boutonInverser.addEventListener("click", function () {
  const temp = selectSource.value;
  selectSource.value = selectCible.value;
  selectCible.value = temp;
  calculer();
});


boutonActualiser.addEventListener("click", function () {
  chargerTaux(selectSource.value);
});

boutonViderHistorique.addEventListener("click", function () {
  localStorage.removeItem("historique");
  afficherHistorique();
});
