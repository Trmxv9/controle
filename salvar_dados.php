<?php

// Função para carregar os dados do arquivo JSON
function carregarDados() {
    $jsonData = file_get_contents('dados.json');
    return json_decode($jsonData, true) ?: ['entradas' => [], 'saidas' => []];
}

// Função para salvar os dados no arquivo JSON
function salvarDados($dados) {
    file_put_contents('dados.json', json_encode($dados, JSON_PRETTY_PRINT));
}

// Adiciona entrada ou saída ao histórico
function adicionarHistorico(&$pessoa, $acao, $valor) {
    $mensagem = $acao . ' ' . number_format($valor, 2, '.', '');
    $pessoa['historico'][] = $mensagem;
}

// Carrega os dados
$dados = carregarDados();

// Adiciona nova entrada ou saída
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $requestData = json_decode(file_get_contents('php://input'), true);

    if ($requestData['tipo'] === 'atualizacao') {
        $dados = $requestData['dados'];
    } elseif ($requestData['tipo'] === 'entrada') {
        $nome = $requestData['dados']['nome'];
        $valor = $requestData['dados']['valor'];
        $entrada = ['nome' => $nome, 'valor' => $valor, 'historico' => []];
        adicionarHistorico($entrada, 'Adicionou', $valor);
        $dados['entradas'][] = $entrada;
    } elseif ($requestData['tipo'] === 'saida') {
        $nome = $requestData['dados']['nome'];
        $valor = $requestData['dados']['valor'];
        $saida = ['nome' => $nome, 'valor' => $valor, 'historico' => []];
        adicionarHistorico($saida, 'Retirou', $valor);
        $dados['saidas'][] = $saida;
    }

    // Salva os dados no arquivo JSON
    salvarDados($dados);
}

// Retorna os dados como JSON
header('Content-Type: application/json');
echo json_encode($dados, JSON_PRETTY_PRINT);

?>
