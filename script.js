document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('uploadButton').addEventListener('click', function() {
        var fileInput = document.getElementById('csvFile');
        var file = fileInput.files[0];
        var reader = new FileReader();

        reader.onload = function(e) {
            var text = e.target.result;
            var data = parseCSV(text);
            displayTable(data);
        };

        reader.readAsText(file);
    });

    function parseCSV(text) {
        var rows = text.split('\n');
        return rows.map(function(row) {
            return row.split(',');
        });
    }

    function displayTable(data) {
        var tableContainer = document.getElementById('tableContainer');
        tableContainer.innerHTML = ""; // Clear previous table
        var table = document.createElement('table');
        
        // Populate the table with data
        data.forEach(function(rowData, index) {
            if (rowData.length === 1 && rowData[0].trim() === '') return; // Skip empty rows
            var row = document.createElement('tr');
            rowData.forEach(function(cellData) {
                var cell = document.createElement(index === 0 ? 'th' : 'td');
                cell.appendChild(document.createTextNode(cellData.trim()));
                row.appendChild(cell);
            });
            table.appendChild(row);
        });

        tableContainer.appendChild(table);
    }
});