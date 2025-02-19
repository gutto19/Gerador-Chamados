$(document).ready(function () {
    const estadoSelect = $('#estado');
    const cidadeSelect = $('#cidade');
    const enderecoInput = $('#endereco');
    const bairroInput = $('#bairro');
    const cepInput = $('#cep');
    const projetoSelect = $('#projeto');
    const resultadoModal = $('#resultadoModal');
    const closeModal = $('#closeModal');
    const resultadoDiv = $('#resultadoEndereco');
    const resultadoTicket2 = $('#resultadoTicket2');
    const resultadoCampoLivre = $('#resultadoCampoLivre');
    const cadastroForm = $('#chamado-form');
    const projetoSelecionadoInput = $('#projetoSelecionado');
    const ticket2Input = $('#ticket2');
    const enderecoFinalInput = $('#enderecoFinal');
    const progressBar = $('#progress');

    //------------Botões---------------
    // Navegação entre etapas
    $('#btn-next-step-2').on('click', function () {
        nextStep(2);
    });
    
    $('#btn-next-step-3').on('click', function () {
        nextStep(3);
    });
    
    $('#btn-prev-step-1').on('click', function () {
        prevStep(1);
    });
    
    $('#btn-prev-step-2').on('click', function () {
        prevStep(2);
    });
    
    window.nextStep = function (step) {
        if (step === 2 && !validarEtapa1()) return;
        if (step === 3 && !validarEtapa2()) return;
    
        $('.form-step').hide();
        $(`#step-${step}`).show();
        updateProgressBar(step);
    };
    
    window.prevStep = function (step) {
        $('.form-step').hide();
        $(`#step-${step}`).show();
        updateProgressBar(step);
    };

    //-------------Etapa 1------------- 
    function validarEtapa1() {
        const projeto = projetoSelect.val();
        if (!projeto) {
            alert("Por favor, selecione um projeto antes de avançar.");
            return false;
        }
        return true;
    }

    //-------------Etapa 2------------- 
    function carregarEstados() {
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
    }

    function carregarCidades(uf) {
        cidadeSelect.empty().append($('<option>', { value: "", text: "Selecione a Cidade" }));
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

    carregarEstados();

    estadoSelect.on('change', function () {
        const uf = $(this).val();
        if (uf) carregarCidades(uf);
    });

    function formatarCEP(cep) {
        return cep.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    cepInput.on('input', function () {
        $(this).val(formatarCEP($(this).val()));
    });

    function validarEtapa2() {
        const estado = estadoSelect.val();
        const cidade = cidadeSelect.val();
        const endereco = enderecoInput.val().trim();
        const bairro = bairroInput.val().trim();
        const cep = cepInput.val().trim();

        if (!estado || !cidade || !endereco || !bairro || !cep) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return false;
        }

        const cepRegex = /^\d{5}-\d{3}$/;
        if (!cepRegex.test(cep)) {
            alert("Formato do CEP inválido. Use o formato 12345-678.");
            return false;
        }

        return true;
    }

    //-------------Etapa 3------------- 
    const projetosMap = {
		"01.01": { ticket2: "01.01", nome: "01.01.DIEBOLD NIXDORFMOTO: ITAÚ | LOTERIAS_CAIXA"},
		"02.01": { ticket2: "02.01", nome: "02.01.SPECTO: TOTENS_BNB | BANRISUL | CLIN_CASSIS"},
		"03.01": { ticket2: "03.01", nome: "03.01.STELLANTIS: FIAT | PAINÉIS_DIGITAIS"},
		"04.01": { ticket2: "04.01", nome: "04.01.TOSHIBA: PDV | FRENTE_DE_CAIXA | RIACHUELO"},
		"05.01": { ticket2: "05.01", nome: "05.01.GENIALTEC: SELF_CHECKOUT | TOTENS"},
		"06.01": { ticket2: "06.01", nome: "06.01.LAURENTI: SELF_CHECKOUT | TOTENS"},
		"07.01": { ticket2: "07.01", nome: "07.01.NCR: ITAÚ_FRENTE_DE_CAIXA | PERIFÉRICOS"},
		"08.01": { ticket2: "08.01", nome: "08.01.POSITIVO: BODY_SHOP"},
		"08.02": { ticket2: "08.02", nome: "08.02.POSITIVO: BOTICÁRIO_INCIDENTE"},
		"08.03": { ticket2: "08.03", nome: "08.03.POSITIVO: BOTICÁRIO_TV'S | INSTALAÇÃO"},
		"08.04": { ticket2: "08.04", nome: "08.04.POSITIVO: FILIAL_MT"},
		"08.05": { ticket2: "08.05", nome: "08.05.POSITIVO: IMC_INCIDENTE"},
		"08.06": { ticket2: "08.06", nome: "08.06.POSITIVO: DIÁRIA_TÉCNICA | PLANTÃO_AVULSO"},
		"08.07": { ticket2: "08.07", nome: "08.07.POSITIVO: IMC_TV'S | INSTALAÇÃO | ROLLOUT"},
		"08.08": { ticket2: "08.08", nome: "08.08.POSITIVO: ITAÚ_BLINDAGEM | ROLLOUT"},
		"08.09": { ticket2: "08.09", nome: "08.09.POSITIVO: ITAÚ_SURVEY | INVENTÁRIO"},
		"08.10": { ticket2: "08.10", nome: "08.10.POSITIVO: MPA | MPP | AVULSO"},
		"08.11": { ticket2: "08.11", nome: "08.11.POSITIVO: PRODESP_ESCOLA"},
		"08.12": { ticket2: "08.12", nome: "08.12.POSITIVO: PRODESP_TOTEM_ARIS"},
		"08.13": { ticket2: "08.13", nome: "08.13.POSITIVO: TCC_BANCO_DO_BRASIL"},
		"08.14": { ticket2: "08.14", nome: "08.14.POSITIVO: TDS_BANCO_DO_BRASIL"},
		"08.15": { ticket2: "08.15", nome: "08.15.POSITIVO: TRADE-IN_BANCO_DO_BRASIL"},
		"08.16": { ticket2: "08.16", nome: "08.16.POSITIVO: TSE_UE"},
		"09.01": { ticket2: "09.01", nome: "09.01.RICOH: PDV | FRENTE.CX_ATACD | ZARA | RIACH"},
		"10.01": { ticket2: "10.01", nome: "10.01.SAMSUNG: HELPDESK | TABLETS_HOSPITAIS"},
		"11.01": { ticket2: "11.05", nome: "11.05.SANTANDER: BITLOCKER | VULNERABILIDADE"},
		"11.02": { ticket2: "11.04", nome: "11.04.SANTANDER: SERVIDORES"},
		"11.03": { ticket2: "11.03", nome: "11.03.1.SANTANDER: REQUISIÇÃO"},
		"11.04": { ticket2: "11.02", nome: "11.02.1.SANTANDER: INCIDENTE"},
		"11.05": { ticket2: "11.01", nome: "11.01.SANTANDER: URA | SCREENING"},
		"11.06": { ticket2: "11.06", nome: "11.06.SANTANDER: TROCA_DE_MEMÓRIAS"},
		"11.07": { ticket2: "11.07", nome: "11.07.SANTANDER: TROCA_DE_NETTOP_OBSOLETO"},
		"12.01": { ticket2: "12.01", nome: "12.01.SCHALTER: SELF_CHECKOUT | TOTENS_AMERICANAS"}
    };

    projetoSelect.on('change', function () {
        const projetoSelecionado = $(this).val();
        const projetoData = projetosMap[projetoSelecionado];
        if (projetoData) {
            ticket2Input.val(projetoData.ticket2);
            projetoSelecionadoInput.val(projetoData.nome);
        } else {
            ticket2Input.val('');
            projetoSelecionadoInput.val('');
        }
    });

    $(document).ready(function() {
        $('#possuiChamado').change(function() {
            if ($(this).is(':checked')) {
                $('#chamadoSN').prop('disabled', false);
            } else {
                $('#chamadoSN').prop('disabled', true);
                $('#chamadoSN').val(''); // Opcional: Limpar o campo ao desabilitar
            }
        });
    });

    $('#chamado').on('input', function () {
        const valor = $(this).val().toUpperCase();
        if (valor.length > 15) {
            $(this).val(valor.substring(0, 15));
        } else {
            $(this).val(valor);
        }
    });

    $('#chamadoSN').on('input', function () {
        const valor = $(this).val().toUpperCase();
        if (valor.length > 15) {
            $(this).val(valor.substring(0, 15));
        } else {
            $(this).val(valor);
        }
    });
    
    // Função para atualizar enderecoFinal e modal
    function atualizarEndereco() {
        // 1. Obter o endereço formatado
        const endereco = enderecoInput.val() ? enderecoInput.val().toUpperCase() : '';
        const bairro = bairroInput.val() ? bairroInput.val().toUpperCase() : '';
        const cidade = cidadeSelect.val() ? cidadeSelect.val().toUpperCase() : '';
        const estado = estadoSelect.val() ? estadoSelect.val().toUpperCase() : '';
        const cep = cepInput.val();

        const enderecoFormatado = `${endereco}, ${bairro} - ${cidade} , ${estado} - ${cep}`;

        // 2. Atualizar enderecoFinal
        $('#enderecoFinal').val(enderecoFormatado);

        // 3. Atualizar o modal
        const resultadoTexto = `Endereço: ${enderecoFormatado}`;

        resultadoDiv.text(resultadoTexto);
    }

    // Chamar a função atualizarEndereco() após a criação da constante
    atualizarEndereco();

    // Eventos para atualizar o endereço quando os campos mudarem
    enderecoInput.on('change', atualizarEndereco);
    bairroInput.on('change', atualizarEndereco);
    cidadeSelect.on('change', atualizarEndereco);
    estadoSelect.on('change', atualizarEndereco);
    cepInput.on('change', atualizarEndereco);

    // Ajuste da hora e periodo
    $('#agendamentoHoraRadio').on('click', function () {
        $('#agendamentoHora').prop('disabled', false);
        $('#agendamentoPeriodo').prop('disabled', true);
    });

    $('#agendamentoPeriodoRadio').on('click', function () {
        $('#agendamentoHora').prop('disabled', true);
        $('#agendamentoPeriodo').prop('disabled', false);
    });

    // Inicialização: Desabilitar o campo de período se a hora estiver selecionada
    if ($('#agendamentoHoraRadio').is(':checked')) {
        $('#agendamentoPeriodo').prop('disabled', true);
    }

    $('#nomeLoja').on('input', function () {
        $(this).val($(this).val().toUpperCase());
    });

    $('#responsavelLocal').on('input', function () {
        $(this).val($(this).val().toUpperCase());
    });

    $('#pontosAtencao').on('input', function () {
        $(this).val($(this).val().toUpperCase());
    });

    //-------------Geral------------- 
    // Navegação entre etapas
    window.nextStep = function (step) {
        if (step === 2 && !validarEtapa1()) return;
        if (step === 3 && !validarEtapa2()) return;

        $('.form-step').hide();
        $(`#step-${step}`).show();
        updateProgressBar(step);
    };

    window.prevStep = function (step) {
        $('.form-step').hide();
        $(`#step-${step}`).show();
        updateProgressBar(step);
    };

    function updateProgressBar(step) {
        const progress = (step / 3) * 100;
        progressBar.css('width', `${progress}%`);
    }

    // Validar e enviar o formulário
    cadastroForm.on('submit', function (event) {
        event.preventDefault();

        const endereco = enderecoInput.val() ? enderecoInput.val().toUpperCase() : '';
        const bairro = bairroInput.val() ? bairroInput.val().toUpperCase() : '';
        const cidade = cidadeSelect.val() ? cidadeSelect.val().toUpperCase() : '';
        const estado = estadoSelect.val() ? estadoSelect.val().toUpperCase() : '';
        const cep = cepInput.val();
        const ticket2 = ticket2Input.val();

        // Obtenção dos dados do formulário
        const projetoSelecionado = projetoSelect.find('option:selected').text();
        const chamado = $('#chamado').val();
        const chamadoSN = $('#chamadoSN').val();
        const escopo = $('#escopo').val();
        const dataAcionamento = $('#dataAcionamento').val();
        const sla = $('#sla').val();
        const prioridade = $('#prioridade').val();
        const nomeLoja = $('#nomeLoja').val();
        const responsavelLocal = $('#responsavelLocal').val();
        const horarioInicio = $('#horarioInicio').val();
        const horarioFim = $('#horarioFim').val();
        const agendamentoData = $('#agendamentoData').val();
        const agendamentoHora = $('#agendamentoHora').val();
        const agendamentoPeriodo = $('#agendamentoPeriodo').val();
        const pontosAtencao = $('#pontosAtencao').val();

        const resultadoEnderecoTexto = `${endereco}, ${bairro} - ${cidade} , ${estado} - ${cep}`;
        const resultadoTicket2Texto = `${ticket2}`;

        // Formatação das datas
        const dataAcionamentoFormatada = dataAcionamento ? new Date(dataAcionamento).toLocaleString('pt-BR') : '';
        const slaFormatada = sla ? new Date(sla).toLocaleString('pt-BR') : '';
                
        // Formatação do horário de funcionamento
        const horarioFuncionamento = horarioInicio && horarioFim ? `${horarioInicio} - ${horarioFim}` : '';
                
        // Formatação do agendamento
        const agendamentoDataFormatada = agendamentoData ? new Date(agendamentoData).toLocaleDateString('pt-BR') : '';
        const agendamento = agendamentoDataFormatada ? `${agendamentoDataFormatada} ${agendamentoHora || agendamentoPeriodo || ''}` : '';

        const textoFormatado =
                    `#PROJETO: ${projetoSelecionado}\n` +
                    `#TICKET2: ${ticket2}\n` +
                    `#CHAMADO: ${chamado}\n` +
                    `#CHAMADO SN: ${chamadoSN}\n` +
                    `#ENDEREÇO: ${endereco}\n` +
                    `#ESCOPO: ${escopo}\n` +
                    `#DATA ACIONAMENTO: ${dataAcionamentoFormatada}\n` +
                    `#SLA: ${slaFormatada}\n` +
                    `#PRIORIDADE: ${prioridade}\n` +
                    `#NOME DA LOJA: ${nomeLoja}\n` +
                    `#RESPONSÁVEL DO LOCAL: ${responsavelLocal}\n` +
                    `#HORÁRIO DE FUNCIONAMENTO: ${horarioFuncionamento}\n` +
                    `#AGENDAMENTO: ${agendamento}\n` +
                    `#PONTOS DE ATENÇÃO: ${pontosAtencao}\n`;

        $('#resultadoEndereco').text(resultadoEnderecoTexto);
        $('#resultadoTicket2').text(resultadoTicket2Texto);
        $('#resultadoCampoLivre').text(textoFormatado);                       

        resultadoModal.addClass('show');
    });

    // Fechar o modal
    closeModal.on('click', function () {
        resultadoModal.removeClass('show');
    });

    $(window).on('click', function (event) {
        if ($(event.target).is(resultadoModal)) {
            resultadoModal.removeClass('show');
        }
    });

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

    // Copiar Ticket2 para a área de transferência
    $('#copiar-ticket2').on('click', function () {
        const ticket2ParaCopiar = $('#resultadoTicket2').text();
        navigator.clipboard.writeText(ticket2ParaCopiar)
            .then(() => alert('Ticket2 copiado para a área de transferência!'))
            .catch(() => alert('Não foi possível copiar o Ticket2.'));
    });
    
    // Copiar Campo Livre para a área de transferência
    $('#copiar-campo-livre').on('click', function () {
        const campoLivreParaCopiar = $('#resultadoCampoLivre').text();
        navigator.clipboard.writeText(campoLivreParaCopiar)
            .then(() => alert('Campo Livre copiado para a área de transferência!'))
            .catch(() => alert('Não foi possível copiar o Campo Livre.'));
    });
});