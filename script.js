$(document).ready(function () {
    const estadoSelect = $('#estado');
    const cidadeSelect = $('#cidade');
    const enderecoInput = $('#endereco');
    const bairroInput = $('#bairro');
    const cepInput = $('#cep');
    const resultadoModal = $('#resultadoModal');
    const closeModal = $('#closeModal');
    const resultadoDiv = $('#resultado');
    const cadastroForm = $('#endereco-form');

    // Função para carregar os estados
    $.ajax({
        url: "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
        dataType: "json",
        success: function (data) {
            data.sort((a, b) => a.sigla.localeCompare(b.sigla));
            estadoSelect.empty().append($('<option>', { value: "", text: "Selecione o Estado" }));
            data.forEach(val => estadoSelect.append($('<option>', { value: val.sigla, text: val.sigla })));
        },
        error: function () {
            alert("Erro ao carregar os estados.");
        }
    });

    // Carregar as cidades ao selecionar um estado
    estadoSelect.on('change', function () {
        const uf = $(this).val();
        cidadeSelect.empty().append($('<option>', { value: "", text: "Selecione a Cidade" }));
        if (uf) {
            $.ajax({
                url: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
                dataType: "json",
                success: function (data) {
                    data.forEach(val => cidadeSelect.append($('<option>', { value: val.nome, text: val.nome })));
                },
                error: function () {
                    alert("Erro ao carregar as cidades.");
                }
            });
        }
    });

    // Validar e formatar CEP
    function formatarCEP(cep) {
        return cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    cepInput.on('input', function () {
        $(this).val(formatarCEP($(this).val()));
    });

    // Formatar endereço
    function formatarEndereco(endereco, bairro, cidade, estado, cep) {
        return `${endereco.toUpperCase()}, ${bairro.toUpperCase()} - ${cidade.toUpperCase()}, ${estado.toUpperCase()} - ${cep}`;
    }

    // Enviar o formulário e exibir o modal com o resultado
    cadastroForm.on('submit', function (event) {
        event.preventDefault();

        const estado = estadoSelect.val();
        const cidade = cidadeSelect.val();
        const endereco = enderecoInput.val().trim();
        const bairro = bairroInput.val().trim();
        const cep = cepInput.val().trim();

        // Verificar campos obrigatórios
        if (!estado || !cidade || !endereco || !bairro || !cep) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        // Validar formato do CEP
        const cepRegex = /^\d{5}-\d{3}$/;
        if (!cepRegex.test(cep)) {
            alert("Formato do CEP inválido. Use o formato 12345-678.");
            return;
        }

        // Gerar endereço padronizado
        const resultadoTexto = formatarEndereco(endereco, bairro, cidade, estado, cep);

        // Exibir no modal
        resultadoDiv.text(resultadoTexto);
        resultadoModal.addClass('show'); // Exibe o modal
    });

    // Fechar o modal ao clicar no botão de fechar
    closeModal.on('click', function () {
        resultadoModal.removeClass('show');
    });

    // Fechar o modal ao clicar fora dele
    $(window).on('click', function (event) {
        if ($(event.target).is(resultadoModal)) {
            resultadoModal.removeClass('show');
        }
    });

    // Fechar o modal ao pressionar "Escape"
    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && resultadoModal.hasClass('show')) {
            resultadoModal.removeClass('show');
        }
    });

    // Copiar endereço para a área de transferência
    $('#copiar-endereco').on('click', function () {
        const enderecoParaCopiar = resultadoDiv.text();
        navigator.clipboard.writeText(enderecoParaCopiar)
            .then(() => alert('Endereço copiado para a área de transferência!'))
            .catch(() => alert('Não foi possível copiar o endereço.'));
    });
});
