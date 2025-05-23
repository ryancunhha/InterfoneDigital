async function atualizarCasas() {
  try {
    const response = await fetch('status.json');
    if (!response.ok) throw new Error('Erro ao carregar status.json');

    const status = await response.json();
    const casasDisponiveis = status.casas_disponiveis;

    const botoes = document.querySelectorAll('.Tudo-Casas button');

    botoes.forEach(botao => {
      const idCasa = parseInt(botao.id.replace('casa-', ''));
      if (casasDisponiveis.includes(idCasa)) {
        botao.style.opacity = '1';
        botao.disabled = false;
      } else {
        botao.style.opacity = '0';
        botao.disabled = true;
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar casas:', error);
  }
}

window.addEventListener('load', atualizarCasas);
