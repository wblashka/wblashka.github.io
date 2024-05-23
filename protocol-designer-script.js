import {ConditionNode} from './objects.js'

let conditions = []; // Array to store conditions
let selectedConditionIndex = null; //Stores selected condition
let uniqueIDs = []; //Array of used conidition IDs

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
        uniqueIDs: uniqueIDs
    });
    conditions.push(newCondition);
    updateConditionDisplay();
}

export function updateConditionDisplay() {
    const conditionList = document.getElementById('conditionTree');
    conditionList.innerHTML = ''; // Clear existing list

    function createConditionElement(condition, depth) {
        const conditionElement = document.createElement('div');
        conditionElement.textContent = `${condition.name}: Type: ${condition.type} ${condition.value} in ${condition.column1} and ${condition.column2}`;
        conditionElement.classList.add('conditionElement');
        conditionElement.dataset.conditionID = condition.ID;
        console.log(condition.ID);
        //TEMPORARY FOR DEBUGGING:
        conditionElement.style.border = '2px solid red'

        // Add indentation based on depth
        conditionElement.style.marginLeft = `${depth * 20}px`;

        // Add click event listener
        conditionElement.addEventListener('click', function(event) {
            // Remove highlighting from all conditionElements
            document.querySelectorAll('.conditionElement').forEach(element => {
                element.classList.remove('highlighted');
            });
        
            // Check if the target of the click event is the same as the conditionElement or its descendants
            if (event.target === conditionElement || conditionElement.contains(event.target)) {
                // Highlight the clicked conditionElement
                conditionElement.classList.add('highlighted');
        
                conditionElement.setAttribute('draggable', true);
        
                // Store the index of the clicked conditionNode
                selectedConditionIndex = conditions.indexOf(condition);
        
                // Prevent event propagation
                event.stopPropagation();
            }
        });


        // Add dragstart event listener
        conditionElement.addEventListener('dragstart', function(event) {
            // Set the data being dragged (in this case, the index of the condition)
            event.dataTransfer.setData('text/plain', conditions.indexOf(condition));
            // Add a class to visually indicate the dragging
            conditionElement.classList.add('dragging');
        });

        // Add dragend event listener
        conditionElement.addEventListener('dragend', function() {
            // Remove the class added during dragging
            conditionElement.classList.remove('dragging');
        });

        return conditionElement;
    }

    function appendChildElements(parentElement, condition, depth) {
        condition.children.forEach(child => {
            const childElement = createConditionElement(child, depth);
            parentElement.appendChild(childElement);
            if (child.children.length > 0) {
                appendChildElements(childElement, child, depth + 1);
            }
        });
    }

    conditions.forEach(condition => {
        const conditionElement = createConditionElement(condition, 0);
        conditionList.appendChild(conditionElement);
        if (condition.children.length > 0) {
            appendChildElements(conditionElement, condition, 1);
        }
    });
}

// Function to recursively find a ConditionNode by its unique identifier
export function findConditionNodeByUniqueId(nodes, uniqueIdentifier) {
    for (const node of nodes) {
        if (node.ID === uniqueIdentifier) {
            console.log(`Node ID: ${node.ID}`)
            console.log(`Unique ID: ${uniqueIdentifier}`)
            return node;
        }
        // If the node has children, recursively search through them
        if (node.children.length > 0) {
            const foundNode = findConditionNodeByUniqueId(node.children, uniqueIdentifier);
            if (foundNode) {
                return foundNode;
            }
        }
    }
    return null; // Return null if the node is not found
}

export function addNode(nodeType) {
    var newCondition = new ConditionNode({
        name:nodeType,
        type:"and",
        column1: null,
        column2: null,
        value: null,
        uniqueIDs: uniqueIDs
    });
    conditions.push(newCondition);
    updateConditionDisplay();
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
document.getElementById('addAndButton').addEventListener('click',function(){addNode("AND");});
document.getElementById('addOrButton').addEventListener('click',function(){addNode("OR");});

// Add event listener for dragover to allow dropping
document.addEventListener('dragover', function(event) {
    event.preventDefault(); // Prevent default behavior to allow dropping
});

// Add event listener for drop to handle dropping
document.addEventListener('drop', function(event) {
    event.preventDefault(); // Prevent default behavior to avoid navigating away

    // Get the index of the dragged conditionElement from the dataTransfer
    const draggedIndex = event.dataTransfer.getData('text/plain');

    // Find the conditionNode corresponding to the dropped conditionElement
    const droppedOnElement = event.target.closest('.conditionElement');
    
    // Check if the dropped element has the 'conditionElement' class
    if (!droppedOnElement || !droppedOnElement.classList.contains('conditionElement')) {
        // If not, return early and do not proceed with the drop operation
        return;
    }
    // Find the unique identifier of the dropped conditionElement
    const uniqueIdentifier = droppedOnElement.dataset.conditionID;
    console.log(conditions)
    // Find the corresponding ConditionNode object in the conditions list hierarchy
    const droppedOnConditionNode = findConditionNodeByUniqueId(conditions, uniqueIdentifier);

    // Add dragged condition node as child of droppedConditionNode
    droppedOnConditionNode.addChild(conditions[draggedIndex]);

    // Remove dragged element from list
    conditions.splice(draggedIndex, 1);

    // Update the display
    updateConditionDisplay();
});
