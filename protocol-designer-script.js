import {ConditionNode} from './objects.js'

let conditions = []; // Array to store conditions

export function loadCSV() {
    return new Promise((resolve, reject) => {
        var fileInput = document.getElementById('csvFile');
        var file = fileInput.files[0];
        if (!file) {
            alert("Please select a CSV file to load.");
            reject("No file selected");
        }

        var reader = new FileReader();

        reader.onload = function(event) {
            var csvData = event.target.result;
            resolve(csvData);
        };

        reader.onerror = function() {
            alert("Unable to read the CSV file.");
            reject("Error reading file");
        };

        reader.readAsText(file);
    });
}

export function getCsvColumns(csvData) {
    var lines = csvData.split('\n');
    var columns = lines[0].split(',');
    return(columns)
}

export async function updateColumnSelects() {
    var csvData = await loadCSV();
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

export function toggleValueField() {
    var valueField = document.getElementById('conditionValue');
    var conditionType = document.getElementById('conditionType');

    if (conditionType.value === 'equals'| conditionType.value === 'contains') {
        valueField.style.display = 'inline-block';
    } else {
        valueField.style.display = 'none';
        valueField.value = '';
    }
}

export function setDefaultColumn2() {
    var columnSelect1 = document.getElementById('columnSelect1');
    var columnSelect2 = document.getElementById('columnSelect2');
    columnSelect2.value = columnSelect1.value;
}

export function addCondition() {
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
    
    var newCondition = new ConditionNode({
        name: conditionName.value,
        type: conditionType.value,
        column1: columnSelect1.value,
        column2: columnSelect2.value,
        value: conditionValue.value,
    });

    conditions.push(newCondition);
    updateConditionDisplay();
}

export function updateConditionDisplay() {
    var conditionList = document.getElementById('conditionTree');
    conditionList.innerHTML = ''; // Clear existing list
    conditions.forEach(function(condition, index) {
        var conditionElement = document.createElement('div');
        conditionElement.classList.add('conditionElement');
        conditionElement.textContent = `${condition.name}: Type: ${condition.type} ${condition.value} in ${condition.column1} and ${condition.column2}`;
        conditionElement.addEventListener('click',function(){
            // Remove highlighting from all conditionElements
            document.querySelectorAll('.conditionElement').forEach(element => {
                element.classList.remove('highlighted');
            });
            // Highlight the clicked conditionElement
            conditionElement.classList.add('highlighted');

            // Store the index of the clicked conditionNode
            selectedConditionIndex = index;
        });
        conditionList.appendChild(conditionElement);
    });
}

export function saveProtocol() {
    // Logic to save the constructed protocol
    // This could involve converting the treeNodes array into a JSON object
}

// Additional functions for tree manipulation and UI updates

// Add listeners
document.getElementById('conditionType').addEventListener('change', toggleValueField);

document.getElementById('loadFileButton').addEventListener('click', updateColumnSelects);

document.getElementById('columnSelect1').addEventListener('change', setDefaultColumn2);

document.getElementById('columnSelect1').addEventListener('change', setDefaultColumn2);

document.getElementById('addConditionButton').addEventListener('click', addCondition);
