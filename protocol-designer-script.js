let conditions = []; // Array to store conditions
let treeNodes = []; // Array to store tree nodes

function loadCSV() {
    var fileInput = document.getElementById('csvFile');
    var file = fileInput.files[0];
    if (!file) {
        alert("Please select a CSV file to load.");
        return;
    }

    var reader = new FileReader();

    reader.onload = function(event) {
        var csvData = event.target.result;
        processCSVData(csvData);
    };

    reader.onerror = function() {
        alert("Unable to read the CSV file.");
    };

    reader.readAsText(file);
}

function processCSVData(csvData) {
    var lines = csvData.split('\n');
    var columns = lines[0].split(',');

    var columnSelect = document.getElementById('columnSelect');
    columnSelect.innerHTML = ''; // Clear existing options

    columns.forEach(function(column) {
        var option = document.createElement('option');
        option.value = column.trim();
        option.textContent = column.trim();
        columnSelect.appendChild(option);
    });
}

function setDefaultColumn2() {
    var columnSelect1 = document.getElementById('columnSelect1');
    var columnSelect2 = document.getElementById('columnSelect2');
    columnSelect2.value = columnSelect1.value;
}

function addCondition() {
    var columnSelect1 = document.getElementById('columnSelect1');
    var columnSelect2 = document.getElementById('columnSelect2');
    var conditionType = document.getElementById('conditionType');
    var conditionValue = document.getElementById('conditionValue');

    if (!columnSelect.value || !conditionType.value || !conditionValue.value.trim()) {
        alert("Please complete all fields to add a condition.");
        return;
    }

    var newCondition = {
        column1: columnSelect1.value,
        column2: columnSelect2.value
        type: conditionType.value,
        value: conditionValue.value.trim()
    };

    conditions.push(newCondition);
    updateConditionDisplay();
}

function updateConditionDisplay() {
    var conditionList = document.getElementById('conditionTree');
    conditionList.innerHTML = ''; // Clear existing list

    conditions.forEach(function(condition, index) {
        var conditionElement = document.createElement('div');
        conditionElement.textContent = `Condition ${index + 1}: If column "${condition.column}" is "${condition.type}" to "${condition.value}"`;
        conditionList.appendChild(conditionElement);
    });
}

function addTreeNode(type) {
    // Create a new tree node of type 'AND' or 'OR'
    // Add it to the treeNodes array
    // Update the conditionTree display
}

function saveProtocol() {
    // Logic to save the constructed protocol
    // This could involve converting the treeNodes array into a JSON object
}

// Additional functions for tree manipulation and UI updates
