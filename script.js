const LIMITE = 2;
const BLOQUEIO_10 = 10 * 60 * 1000;
const input = document.getElementById("mensagem");
const avisoCaracteres = document.getElementById("avisoCaracteres");

function mostrarPopup(texto, tipo = "success") {
  const popup = document.getElementById('popup');
  popup.textContent = texto;
  popup.className = tipo === "success" ? "popup-success" : "popup-error";
  popup.style.display = 'block';

  setTimeout(() => {
    popup.style.display = 'none';
  }, 2000);
}

input.addEventListener("input", () => {
  if (input.value.length >= 35) {
    avisoCaracteres.style.display = "block";
  } else {
    avisoCaracteres.style.display = "none";
  }

  if (input.value.length > 40) {
    input.value = input.value.slice(0, 40);
  }
});

const palavrasProibidas = [
  "merda", "porra", "caralho", "fdp", "foda-se",
  "filho da puta", "cu", "bosta", "spam", "CV", "cv",
];

function detectarPalavrao(texto) {
  const textoMinusculo = texto.toLowerCase();
  for (const palavra of palavrasProibidas) {
    if (textoMinusculo.includes(palavra)) {
      return palavra;
    }
  }
  return null;
}

async function enviarMensagem() {
  const agora = Date.now();
  const tentativas = JSON.parse(localStorage.getItem('tentativas') || "[]");
  const recentes = tentativas.filter(t => agora - t < BLOQUEIO_10);
  const msg = document.getElementById('mensagem').value.trim();

  if (!msg) {
    mostrarPopup("⚠️ Digite uma mensagem!", "error");
    return;
  }

  const palavraErrada = detectarPalavrao(msg);
  if (palavraErrada) {
    mostrarPopup(`🚫 Corrija a "${palavraErrada}".`, "error");
    return;
  }

  if (recentes.length >= LIMITE) {
    const espera = Math.ceil((BLOQUEIO_10 - (agora - recentes[recentes.length - 1])) / 60000);
    mostrarPopup(`⏳ Aguarde ${espera} minuto(s) para tentar novamente.`, "error");
    return;
  }

  const input = document.getElementById('mensagem');
  const mensagem = input.value.trim();

  if (!mensagem) {
    mostrarPopup("⚠️ Digite uma mensagem!", "error");
    return;
  }

  try {
    const response = await fetch('/api/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem })
    });
    const data = await response.json();

    if (data.success) {
      mostrarPopup("✅ Mensagem enviada! Não insista.", "success");
      input.value = '';
      recentes.push(agora);
      localStorage.setItem('tentativas', JSON.stringify(recentes));
    } else {
      mostrarPopup(`❌ Erro: ${data.error || 'Desconhecido'}`, "error");
    }
  } catch (error) {
    mostrarPopup("❌ Erro na internet!", "error");
  }
}

document.getElementById('mensagem').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    enviarMensagem();
  }
});

function opções() {
  const chamando = document.querySelector("#mostraropções");
  chamando.style.display = "block";
}

function fechar() {
  const chamando = document.querySelector("#mostraropções");
  chamando.style.display = "none";
}