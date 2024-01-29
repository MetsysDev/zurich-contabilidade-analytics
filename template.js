class CardTemplate {
    constructor(ctxName='myChart'){
        this.__ctxNameTemplate = ctxName;
        this.__isAnimated = ctxName == 'myChart';
        let ctx = null;
        let chartJsInstance = null;
    }

    mount(data) {
        let style = this.getStyle();
        let dataCard = this.mountDataCard(data);
        let emitionDate = new Date().toLocaleDateString('pt');

        return `
            ${style}
            <div class="template-container">
                <div class="template-header">
                    <img src="logo_zurich.jpg" alt="logo-zurich-contabil">
                </div>
                <div class="template-body">
                    <div class="grid-template-areas-company">
                        <span class="description-company">Cliente: ${dataCard.cliente}</span>
                        <span class="cnpj">CNPJ: ${dataCard.cnpj}</span>
                    </div>
                    <div class="grid-template-areas-graphics">
                        <canvas id="myChart" alt="grafico-zurich-contabil"></canvas>
                        <table>
                            <tr>
                                <th></th>
                                <th>Faturamento</th>
                                <th>Folha</th>
                                <th>Compras</th>
                            </tr>
                            <tr>
                                <td>Total:</td>
                                <td>${dataCard.total_billing.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                                <td>${dataCard.total_payroll.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                                <td>${dataCard.total_shopping.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="grid-template-areas-business">
                        <span>Diagnóstico:</span>
                        <ul>
                            ${dataCard.analysis}
                        </ul>
                    </div>
                    <div class="grid-template-areas-observation">
                        <p class="report-observation">
                           Observação: Caso conste débitos fiscais ou trabalhistas, pedimos para contatar o escritório para maiores informações.
                           Esta consulta esta sujeita a alterações.
                        </p>
                    </div>
                </div>

            </div>

            <script>
            ctx = document.getElementById('${this.__ctxNameTemplate}');

            chartJsInstance = new Chart(ctx, {
                type: 'line',
                data: {},
                options: {
                    responsive: true,
                    animation: ${this.__isAnimated},
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: false,
                            text: 'Chart.js Line Chart'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            </script>
        `;
    }

    generateGrapihics(data) {
        let gr = this.mountDataCard(data);
        chartJsInstance.data = gr.graphics;
        chartJsInstance.update();
    }

    mountDataCard(tableData) {
        let table = {};
        let analysis = [];
        let dataGraphics = [];
        let valuesGraphics = [];
        let labelsGraphics = [];
        let totalPayroll = 0;
        let totalBilling = 0;
        let totalShopping = 0;
        let clientName = '';
        let cnpj = '';
        let haveTaxDebit = false;
        let haveLaborDebts = false;


        for (const tableKey in tableData) {
            if (!Object.hasOwnProperty.call(tableData, tableKey)) {
                continue;
            }

            valuesGraphics = [];
            table = tableData[tableKey];

            for (const key in table) {
                if (
                    !table.hasOwnProperty(key) ||
                    key.indexOf('EMPTY') != -1 ||
                    key == 0
                ) {
                    continue;
                }

                if (key.toLocaleLowerCase() == 'total de folha') {
                    totalPayroll = this.__formatValue(table[key]);
                }

                if (key.toLocaleLowerCase() == 'total de compras') {
                    totalShopping = this.__formatValue(table[key]);
                }

                if (key.toLocaleLowerCase() == 'total de faturamento') {
                    totalBilling = this.__formatValue(table[key]);
                }

                if (key.toLocaleLowerCase() == 'debitos trabalhistas') {
                    haveLaborDebts = (table[key].toLocaleLowerCase() == 'sim');
                }

                if (key.toLocaleLowerCase() == 'debitos fiscais') {
                    haveTaxDebit = (table[key].toLocaleLowerCase() == 'sim');
                }

                if (this.isClient(key)) {
                    clientName = table[key];
                }

                if (this.isCnpj(key)) {
                    cnpj = table[key];
                }

                if (this.isTypeCompany(key)) {
                    continue;
                }

                if (!labelsGraphics.includes(key)) {
                    labelsGraphics.push(key);
                }

                valuesGraphics.push(this.__formatValue(table[key]));
            }

            if (tableKey == 'table_payroll' && valuesGraphics.length > 1) {
                if (valuesGraphics[0] > valuesGraphics[1]) {
                    analysis.push('SEUS CUSTOS DE FOLHA AUMENTARAM, FIQUE DE OLHO');
                } else if (valuesGraphics[0] < valuesGraphics[1]) {
                    analysis.push('SEUS CUSTOS DE FOLHA DIMINUIRAM, CORTAR CUSTOS É UMA BOA ESTRATÉGIA');
                }
            }

            if (tableKey == 'table_shopping' && valuesGraphics.length > 1) {
                if (valuesGraphics[0] > valuesGraphics[1]) {
                    analysis.push('SUAS COMPRAS AUMENTRAM ESTE MÊS, GERENCIAR ESTOQUES É ESSENCIAL PARA GERAR CAIXA');
                }
            }
            
            if (tableKey == 'table_billing' && valuesGraphics.length > 1) {
                if (valuesGraphics[0] > valuesGraphics[1]) {
                    analysis.push('SUAS RECEITAS ESTÃO AUMENTANDO, PARABÉNS CONTINUE CRESCENDO');
                } else if (valuesGraphics[0] < valuesGraphics[1]) {
                    analysis.push('SUAS RECEITAS CAIRAM REFERENTE AO MÊS PASSADO, FIQUE ATENTO');
                }
            }

            dataGraphics.push({
                'label': this.nameTable(tableKey),
                'data': valuesGraphics.reverse()
            });
        }

        if (totalBilling < (totalPayroll + totalShopping)) {
            analysis.push('SUA EMPRESA ESTÁ COM PROBLEMAS DE CAIXA, AS RECEITAS PRECISAM AUMENTAR');
        }

        if (haveLaborDebts) {
            analysis.push('VOCÊ POSSUI DEBITOS TRABALHISTAS');
        } else {
            analysis.push('VOCÊ NÃO POSSUI DEBITOS TRABALHISTAS');
        }

        if (haveTaxDebit) {
            analysis.push('VOCÊ POSSUI DEBITOS FISCAIS');
        } else {
            analysis.push('VOCÊ NÃO POSSUI DEBITOS FISCAIS');
        }

        analysis = analysis.map((value) => `<li>${value}</li>`);

        let spans = {
            'cnpj': cnpj,
            'cliente': clientName,
            'analysis': analysis.join(''),
            'total_billing': totalBilling,
            'total_payroll': totalPayroll,
            'total_shopping': totalShopping,
            'graphics': {
                'labels': labelsGraphics.reverse(),
                'datasets': dataGraphics
            }
        };

        return spans;
    }

    __formatValue(value) {
        return parseFloat(value.replaceAll('R$', '').replaceAll(' ', '').replaceAll(',', ''));
    }

    nameTable(key) {
        switch (key) {
            case 'table_payroll':
                return 'Folha';

            case 'table_shopping':
                return 'Compras';

            case 'table_billing':
                return 'Faturamento';

            default:
                return '-';

        }
    }

    isClient(key) {
        key = key.toLocaleLowerCase();
        return key == 'clientes' || key == 'cliente';
    }

    isCnpj(key) {
        key = key.toLocaleLowerCase();
        return key == 'cnpj';
    }

    isTypeCompany(key) {
        let typesCompany = ['cnpj', 'clientes', 'cliente', 'cod', 'total de faturamento', 'debitos fiscais', 'total de compras', 'total de folha', 'debitos trabalhistas'];

        return typesCompany.includes(key.toLocaleLowerCase());
    }

    applyClassValue(value) {
        if (this.isNumeric(value)) {
            if (value < 0) {
                return 'text-danger'
            }
        }

        return 'text-dark';
    }

    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    getStyle() {
        return `
        <style>
            :root {
                --danger-color: #f44336;
                --border-width-template: 5px;
                --border-color-template:#005e66;
            }

            .template-container {
                margin: 5px;
                width: fit-content;
                width: 47rem;
                height: auto;
                min-height: 550px;
                border: solid var(--border-width-template) var(--border-color-template);
            }

            .template-header {
                position: relative;
            }

            .template-container .template-header img {
                width: 44rem;
                height: 10rem;
            }

            .template-container .template-header .title-report {
                position: absolute;
                left: 31%;
                font-size: 1.9rem;
                color: white;
                font-weight: bold;
            }

            .report-observation {
                font-weight: bold;
            }

            .template-container .template-header {
                text-align: center;
                border-bottom: solid var(--border-width-template) var(--border-color-template);
                background-color: #005e66;
            }

            .template-container 
            .template-body .grid-template-areas-company, .grid-template-areas-business, .grid-template-areas-title-report, .grid-template-areas-graphics {
                padding: 0 5px;
            }

            .template-container .template-body img {
                width: 46rem;
                height: 23rem;
            }

            .template-container .template-body .description-company {
                grid-area: description-company;
            }

            .template-container .template-body .cnpj {
                grid-area: cnpj;
            }

            .template-container .template-body .emission-date {
                grid-area: emission-date;
            }

            .template-container .template-body .grid-template-areas-company {
                grid-template-areas:
                    "description-company description-company"
                    "cnpj emission-date"
                ;
            }

            .template-container .template-body .grid-template-areas-business {
                grid-template-columns: 1fr 1fr;
            }

            .grid-template-areas-company, .grid-template-areas-title-report, .grid-template-areas-graphics, .grid-template-areas-business {
                border-bottom: solid 5px #005e66;
            }

            .grid-template-areas-business {
                display: block !important;
            }

            .grid-template-areas-title-report span {
                grid-column-start: 2;
            }
        </style>
        `;
    }
}
