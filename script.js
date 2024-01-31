document.getElementById('uploadButton').addEventListener('click', function() {
    var fileInput = document.getElementById('excelFile');
    var file = fileInput.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var workbook = XLSX.read(e.target.result, {
            type: 'binary'
        });
        var firstSheetName = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[firstSheetName];
        var data = XLSX.utils.sheet_to_json(worksheet, {header:1});
        displayTable(data);
    };

    reader.readAsBinaryString(file);
});

function displayTable(data) {
    var tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ""; // Clear previous table
    var table = document.createElement('table');
    
    // Populate the table with data
    data.forEach(function(rowData) {
        var row = document.createElement('tr');
        rowData.forEach(function(cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}
