class Table {
    constructor(tagId = '#table') {
        this.__tableInstance = $(tagId);
        this.__tableInstance.bootstrapTable();
    }

    createColumns(columns, checkExistColumn=true) {
        let columnsExisting = [];
        let columnsCreated = [];

        columns.forEach(column => {
            for (const key in column) {
                if (column.hasOwnProperty(key)) {
                    if (checkExistColumn && columnsExisting.includes(key)) {
                        continue;
                    }

                    columnsExisting.push(key);
                    columnsCreated.push(this.__createColumn(key));
                }
            }
        });

        columnsCreated.unshift({
            checkbox: true
        });

        return columnsCreated;
    }

    insertRows(data) {
        this.__tableInstance.bootstrapTable('append', data);
    }

    createTable(columns, data, uniqueId='COD') {
        this.__tableInstance.bootstrapTable('refreshOptions', {
            'search': true,
            'searchAccentNeutralise': true,
            'showColumns': true,
            'singleSelect': true,
            'clickToSelect': true,
            'showColumnsSearch': true,
            'showFullscreen': true,
            'uniqueId': uniqueId,
            'pagination': true,
            'columns': columns,
            'data': data
        });
    }

    createFakeTable() {
        let fakeData = [];
        let fakeColumns = [];

        for (let i = 1; i < 11; i++) {
            fakeColumns.push(this.__createColumn(`-`));
        }

        this.createTable(fakeColumns, fakeData);
    }

    startLoad() {
        $('.th-inner, .no-records-found').addClass('loading');
    }

    stopLoad() {
        $('.loading').removeClass('loading');
    }

    getSelections() {
        return this.__tableInstance.bootstrapTable('getSelections');
    }

    getById(id){
        return this.__tableInstance.bootstrapTable('getRowByUniqueId', id);
    }

    getAll() {
        return this.__tableInstance.bootstrapTable('getData');
    }

    removeData(ids, field='COD') {
        if (Array.isArray(ids) && ids.length) {
            return this.__tableInstance.bootstrapTable('remove', {
                'field': field,
                'values': ids
            });
        }
    }

    getOptions(getValueKey=null) {
        let options = this.__tableInstance.bootstrapTable('getOptions');
        if (getValueKey && options.hasOwnProperty(getValueKey)) {
            options = options[getValueKey];
        }

        return options;
    }

    __createColumn(key) {
        let column = {
            'title': key,
            'field': key
        }

        return column;
    }
}