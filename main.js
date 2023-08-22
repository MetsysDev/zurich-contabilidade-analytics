$(function (event) {
    let tablePayroll = new Table('#table_payroll');
    tablePayroll.createFakeTable();

    let tableShopping = new Table('#table_shopping');
    tableShopping.createFakeTable();

    let tableBilling = new Table('#table_billing');
    tableBilling.createFakeTable();

    let tablesGenerated = {
        'table_billing': tableBilling,
        'table_payroll': tablePayroll,
        'table_shopping': tableShopping
    };

    $('.formFile').on('change', function (ev) {
        let nameTable = $(this).attr('data-table-name');
        let table = tablesGenerated[nameTable];
        let chosenFile = this.files[0];

        if (chosenFile) {
            table.startLoad();
            readFile(chosenFile, table);
        }
    });

    $('.button-remove').on('click', function (ev) {
        let nameTable = $(this).attr('data-table-name');
        let table = tablesGenerated[nameTable];
        let keyDefaultUniqueId = 'COD'
        let selections = table.getSelections();
        let ids = selections.map(selected => {
            if (
                selected && typeof(selected) == 'object'
                && selected.hasOwnProperty(keyDefaultUniqueId)
            ) {
                return selected[keyDefaultUniqueId];
            }

            return null;
        });

        table.removeData(ids, keyDefaultUniqueId);
    });

    $('.button-importar').on('click', function (ev) {
        let nameTable = $(this).attr('data-table-name');
        $('#formFile_' + nameTable).click();
        let table = tablesGenerated[nameTable];
        table.startLoad();
    });

    $('.button-exportar').on('click', function (ev) {
        let nameTable = $(this).attr('data-table-name');
        let table = tablesGenerated[nameTable];
        let data = table.getSelections();
        if (!validArray(data)) {
            data = table.getAll();
        }

        if (!validArray(data)) {
            Mensagen.error('Adicione algum arquivo Excel!');
            return;
        }

        data.forEach((row) => {
            row = getDataToGenerateReport(row);
    
            $('.view-card').empty();
            let card = new CardTemplate('myChartToExport');
            let cardMonted = card.mount(row);
            row = card.mountDataCard(row);
            ExportationReport.pdf(cardMonted, row);
        })
    });

    $('.button-visualization').on('click', function (ev) {
        let nameTable = $(this).attr('data-table-name');
        let table = tablesGenerated[nameTable];
        let data = table.getSelections();

        if (!validArray(data)) {
            Mensagen.error('Selcione uma linha para exportar!');
            return;
        }

        if (!validArray(data)) {
            Mensagen.error('Adicione algum arquivo Excel!');
            return;
        }

        data = getDataToGenerateReport(data[0]);

        $('#visualization-exportation').modal('show');
        let card = new CardTemplate();
        let cardMonted = card.mount(data);
        ExportationReport.visualization(cardMonted);
        card.generateGrapihics(data);
    });

    function validArray(data) {
        return Array.isArray(data) && data.length;
    }

    function readFile(file, table) {
        let reader = new FileReader();
        reader.onload = (ev) => {
            let converted = parseXlsxToJson(ev.target.result);
            let data = converted[0];
            let columns = table.createColumns(data);
            table.createTable(columns, data);
            table.stopLoad();
        };

        reader.onerror = (error) => {
            console.error('falha ao importar:', error);
            Mensagen.error('Falha ao adicionar seu arquivo tente novamente por favor!');
        }

        reader.readAsBinaryString(file);
    }

    function parseXlsxToJson(data) {
        let sheetData = null;
        let dataConverted = [];
        let xlsxRead = XLSX.read(data, {type: 'binary'});
        let options = {
            raw: false,
            defval: '-'
        };

        xlsxRead.SheetNames.forEach(name => {
            let pageDoc = xlsxRead.Sheets[name];
            sheetData = XLSX.utils.sheet_to_row_object_array(pageDoc, options);
            if (sheetData.length) dataConverted.push(sheetData);
        });

        return dataConverted;
    }

    function getDataToGenerateReport(data) {
        let results = {};
        let id = data['COD'];

        for (const key in tablesGenerated) {
            if (Object.hasOwnProperty.call(tablesGenerated, key)) {
                let table = tablesGenerated[key];
                let result = table.getById(id);
                if (result) {
                    results[`${key}`] = result;
                }
            }
        }

        return results;
    }
});
