import Condition from './objects.js'

let conditions = []; // Array to store conditions

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
        return csvData;
    };

    reader.onerror = function() {
        alert("Unable to read the CSV file.");
    };

    reader.readAsText(file);
}

function getCsvColumns(csvData) {
    var lines = csvData.split('\n');
    var columns = lines[0].split(',');
    return(columns)
}

function updateColumnSelects() {
    var csvData = loadCSV();
    var csvColumns = getCsvColumns(csvData);

    var columnSelect1 = document.getElementById('columnSelect1');
    var columnSelect2 = document.getElementById('columnSelect2');
    columnSelect1.innerHTML = ''; // Clear existing options
    columnSelect2.innerHTML = ''; // Clear existing options
    csvColumns.forEach(function(column) {
        var option1 = document.createElement('option');
        option1.value = column.trim();
        option1.textContent = column.trim();
        columnSelect1.appendChild(option1);

        var option2 = document.createElement('option');
        option2.value = column.trim();
        option2.textContent = column.trim();
        columnSelect1.appendChild(option2);
        columnSelect2.appendChild(option2);
    });
}

function toggleValueField() {
    var valueField = document.getElementById('conditionValue');
    var conditionType = document.getElementById('conditionType');

    if (conditionType.value === 'equals'| conditionType.value === 'contains') {
        valueField.style.display = 'block';
    } else {
        valueField.style.display = 'none';
    }
}

function setDefaultColumn2() {
    var columnSelect1 = document.getElementById('columnSelect1');
    var columnSelect2 = document.getElementById('columnSelect2');
    columnSelect2.value = columnSelect1.value;
}

function addCondition() {
    var conditionName = document.getElementById('conditionName');
    var columnSelect1 = document.getElementById('columnSelect1');
    var columnSelect2 = document.getElementById('columnSelect2');
    var conditionType = document.getElementById('conditionType');
    var conditionValue = document.getElementById('conditionValue');
    if (conditionType.value != "contains" && conditionType.value != "equals"){
        conditionValue.value = null;
    };

    if (!columnSelect1.value || !columnSelect2.value || !conditionType.value) {
        alert("Please complete all fields to add a condition.");
        return;
    }

    var newCondition = new Condition({
        name: conditionName.value,
        type: conditionType.value,
        column1: columnSelect1.value,
        column2: columnSelect2.value,
        value: conditionValue.value,
    });

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

function saveProtocol() {
    // Logic to save the constructed protocol
    // This could involve converting the treeNodes array into a JSON object
}

// Additional functions for tree manipulation and UI updates

// Attach functions to window object
window.toggleValueField = toggleValueField;
window.updateColumnSelects = updateColumnSelects;
window.setDefaultColumn2 = setDefaultColumn2;
window.addCondition = addCondition;
window.saveProtocol = saveProtocol;
