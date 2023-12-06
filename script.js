let dados;

function exibirEntradas() {
  const listaEntradas = document.getElementById("entrada-list");
  listaEntradas.innerHTML = "";
  dados.entradas.forEach((entrada) => {
    const item = document.createElement("li");
    item.textContent = `${entrada.nome}: R$ ${entrada.valor.toFixed(2)}`;

    // Adiciona o botão de visualizar histórico
    const btnHistorico = document.createElement("button");
    btnHistorico.innerHTML = ` <button
    class="middle none center ml-3 mb-3 mr-4 h-8 max-h-[32px] w-8 max-w-[32px] rounded-lg bg-pink-500 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
    data-ripple-light="true"
  >
  <i class="fad fa-history fa-lg"></i>
  </button>`;
    btnHistorico.addEventListener("click", () => exibirHistorico(entrada.nome));
    item.appendChild(btnHistorico);

    listaEntradas.appendChild(item);
  });
}

function exibirSaidas() {
  const listaSaidas = document.getElementById("saida-list");
  listaSaidas.innerHTML = "";
  dados.saidas.forEach((saida) => {
    const item = document.createElement("li");
    item.textContent = `${saida.nome}: R$ ${saida.valor.toFixed(2)}`;

    // Adiciona o botão de visualizar histórico
    const btnHistorico = document.createElement("button");
    btnHistorico.innerHTML = ` <button
    class="middle none center ml-3 mb-3 mr-4 h-8 max-h-[32px] w-8 max-w-[32px] rounded-lg bg-pink-500 font-sans text-xs font-bold uppercase text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/40 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
    data-ripple-light="true"
  >
  <i class="fad fa-history fa-lg"></i>
  </button>`;
    btnHistorico.addEventListener("click", () => exibirHistorico(saida.nome));
    item.appendChild(btnHistorico);

    listaSaidas.appendChild(item);
  });
}

function calcularBalanço() {
  const totalEntradas = dados.entradas.reduce(
    (acc, entrada) => acc + entrada.valor,
    0
  );
  const totalSaidas = dados.saidas.reduce((acc, saida) => acc + saida.valor, 0);
  const balanco = totalEntradas - totalSaidas;
  document.getElementById("balanco").textContent = `Saldo: R$ ${balanco.toFixed(
    2
  )}`;
}

function exibirHistorico(nome) {
  const historicoModal = document.getElementById("historico-modal");
  const historicoModalContent = document.getElementById(
    "historico-modal-content"
  );

  historicoModalContent.innerHTML = "";

  const titulo = document.createElement("h2");
  titulo.textContent = `Histórico de ${nome}`;
  historicoModalContent.appendChild(titulo);

  const historico = dados.entradas
    .concat(dados.saidas)
    .filter((item) => item.nome.toLowerCase() === nome.toLowerCase())
    .flatMap((item) => item.historico);

  let saldoAtual = 0;

  historico.forEach((item, index) => {
    const linha = document.createElement("p");
    linha.textContent = item;

    // Atualiza o saldo atual com base no item do histórico
    const regex = /([+-]?\d+(\.\d+)?)\s*$/; // Regex para extrair o valor numérico do histórico
    const match = item.match(regex);

    if (match) {
      const valor = parseFloat(match[1]);

      // Verifica se é uma entrada ou saída e atualiza o saldo
      if (item.includes("Adicionou") || item.includes("Entrada")) {
        saldoAtual += valor;
      } else if (item.includes("Retirou") || item.includes("Saída")) {
        saldoAtual -= valor;
      }
    }

    // Adiciona o saldo atual apenas na última linha do histórico
    if (index === historico.length - 1) {
      const saldoLinha = document.createElement("p");
      saldoLinha.textContent = `Saldo Atual: R$ ${saldoAtual.toFixed(2)}`;
      historicoModalContent.appendChild(saldoLinha);
    }

    historicoModalContent.appendChild(linha);
  });

  historicoModal.classList.remove("hidden");
}

function fecharHistorico() {
  const historicoModal = document.getElementById("historico-modal");
  historicoModal.classList.add("hidden");
}

document
  .getElementById("fechar-historico")
  .addEventListener("click", fecharHistorico);

function carregarDados() {
  // Carrega os dados do arquivo JSON utilizando PHP
  fetch("dados.json")
    .then((response) => response.json())
    .then((jsonData) => {
      dados = jsonData;
      exibirEntradas();
      exibirSaidas();
      calcularBalanço();
    })
    .catch((error) => {
      console.error("Erro ao carregar dados:", error);
      dados = { entradas: [], saidas: [] };
      exibirEntradas();
      exibirSaidas();
      calcularBalanço();
    });
}

function salvarDados() {
  // Salva os dados utilizando PHP
  fetch("salvar_dados.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tipo: "atualizacao", dados }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao salvar dados");
      }
      return response.json(); // Retorna os dados atualizados
    })
    .then((jsonData) => {
      dados = jsonData;
      exibirEntradas();
      exibirSaidas();
      calcularBalanço();
    })
    .catch((error) => console.error("Erro ao salvar dados:", error));
}

// Carrega os dados ao iniciar a página
window.onload = function () {
  carregarDados();
};

function adicionarEntrada() {
  const nome = document.getElementById("entrada-nome").value;
  const valor = parseFloat(document.getElementById("entrada-valor").value);

  if (!isNaN(valor)) {
    const historico = [`Adicionou ${valor.toFixed(2)}`];
    dados.entradas.push({ nome, valor, historico });
    exibirEntradas();
    calcularBalanço();
    salvarDados();
  }
}

function adicionarSaida() {
  const nome = document.getElementById("saida-nome").value;
  const valor = parseFloat(document.getElementById("saida-valor").value);

  if (!isNaN(valor)) {
    const historico = [`Retirou ${valor.toFixed(2)}`];
    dados.saidas.push({ nome, valor, historico });
    exibirSaidas();
    calcularBalanço();
    salvarDados();
  }
}
