const LIMITE = 2;
const BLOQUEIO_10 = 10 * 60 * 1000;
const input = document.getElementById("mensagem");
const avisoCaracteres = document.getElementById("avisoCaracteres");
const botao = document.getElementById('microfone');
const textarea = document.getElementById('mensagem');
const botaoEnviar = document.querySelector(".botão-envio");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let gravando = false;
let recognition;

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

  if (recentes.length >= LIMITE) {
    const espera = Math.ceil((BLOQUEIO_10 - (agora - recentes[recentes.length - 1])) / 60000);
    mostrarPopup(`⏳ Aguarde ${espera}, para mandar novamente.`, "error");
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
      mostrarPopup("✅ Mensagem enviada!", "success");
      input.value = '';
      recentes.push(agora);
      localStorage.setItem('tentativas', JSON.stringify(recentes));
    } else {
      mostrarPopup(`❌ Erro: ${data.error || 'Desconhecido'}`, "error");
    }
  } catch (error) {
    mostrarPopup("❌ Erro no Servidor ou Internet", "error");
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

function atualizarBotoes() {
  if (textarea.value.trim() !== "") {
    botaoEnviar.style.display = 'inline-block';
    botao.style.display = 'none';
  } else {
    botaoEnviar.style.display = 'none';
    botao.style.display = 'inline-block';
  }
}

textarea.addEventListener('input', atualizarBotoes);

if (!SpeechRecognition) {
  botao.disabled = true;
} else {
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const resultado = event.results[0][0].transcript;
    textarea.value = resultado;
    atualizarBotoes();
  };

  recognition.onend = () => {
    gravando = false;
    atualizarBotoes();
    botao.textContent = "🎙️ Falar";
  };

  botao.onclick = () => {
    if (textarea.value.trim() !== "") {
      enviarMensagem();
      textarea.value = "";
      atualizarBotoes();
    } else {
      if (!gravando && recognition) {
        recognition.start();
        gravando = true;
        botao.textContent = "⏹️ Parar";
      } else if (recognition) {
        recognition.stop();
      }
    }
  };
}
