import {ConditionNode} from './objects.js'

const conditionTypeOptions = [
    {value: 'match', label: 'Match'},
    {value: 'mismatch', label: 'Mismatch'},
    {value: 'equals', label: 'Equals'},
    {value: 'bothContains', label: 'Both Contain'},
    {value: 'oneContains', label: 'One Contains'},
];

let conditions = []; // Array to store conditions
let uniqueIDs = []; //Array of used condition IDs
let clickedConditionElement = null; //For right-click context menu
let selectedCondition = null; //Store selected condition

// Helper function to populate form options:
export function populateSelectOptions(selectElement, options) {
    selectElement.innerHTML = ''; // clear existing options

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option.value;
        opt.textContent = option.label;
        selectElement.appendChild(opt);
    });
}

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
    const columnSelectElements = [
        document.getElementById('columnSelect1'),
        document.getElementById('columnSelect2'),
        document.getElementById('editColumn1'),
        document.getElementById('editColumn2')
    ]
    columnSelectElements.forEach(function(element) {
        element.innerHTML = '' // Clear existing options
        csvColumns.forEach(function(column) {
            var option = document.createElement('option');
            option.value = column.trim();
            option.textContent = column.trim();
            element.appendChild(option);
        });
    });
}

export function toggleValueField() {
    var valueField = document.getElementById('conditionValue');
    var conditionType = document.getElementById('conditionType');
    const column1select = document.getElementById('columnSelect1');
    const column2select = document.getElementById('columnSelect2');

    if (conditionType.value === 'equals'| conditionType.value === 'bothContains' | conditionType.value === 'oneContains') {
        valueField.style.display = 'inline-block';
        column2select.style.display = 'none';
        column2select.value = column1select.value;
    } else {
        valueField.style.display = 'none';
        column2select.style.display = 'inline-block';
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
    var conditionInverted = document.getElementById('conditionInverted');
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
        invert: conditionInverted.checked,
        ID: uniqueIDs.length
    });
    uniqueIDs.push(uniqueIDs.length) // Ensures that all conditions have Unique ID
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
        conditionElement.id = condition.ID;
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
        
                // // Store the index of the clicked conditionNode
                // selectedConditionIndex = conditions.indexOf(condition);
        
                // Prevent event propagation
                event.stopPropagation();
            }
        });


        // Add dragstart event listener
        conditionElement.addEventListener('dragstart', function(event) {
            if (conditionElement.classList.contains('highlighted')) {
                const tempElement = document.createElement('div');
            tempElement.textContent = 'Drop here to move to outside';
            tempElement.id = 'temporaryConditionRoot';
            tempElement.classList.add('conditionElement','tempElement');
            document.getElementById('conditionTree').appendChild(tempElement);
            }
            
            // Set the data being dragged (in this case, the index of the condition)
            event.dataTransfer.setData('text/plain', event.target.id);
            // Add a class to visually indicate the dragging
            conditionElement.classList.add('dragging');
        });

        // Add dragend event listener
        conditionElement.addEventListener('dragend', function() {
            // Remove the class added during dragging
            conditionElement.classList.remove('dragging');
            document.querySelectorAll('.tempElement').forEach((element) => {element.remove();});
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

export function getElementIndices(element, indices = []) {
    // Recursive function to get the indices of the an element in the conditions array
    
    const parentElement = element.parentElement;

    // Check if the parent element exists and is a conditionElement
    if (parentElement && (parentElement.classList.contains('conditionElement') || parentElement.id === ('conditionTree'))) {
        // Get the index of the dropped element with respect to its parent
        const index = Array.from(parentElement.children).indexOf(element);
        // Add the index to the list of indices
        indices.unshift(index);
        // Recursively call the function with the parent element
        return getElementIndices(parentElement, indices);
    } else {
        // Return the collected indices when reaching the root
        return indices;
    }
}

export function getConditionNodeByIndices(conditionList, indices) {
    /* This function uses an array of indices, as generated by getElementIndices, in order 
        to return a condition inside the conditions array
    */
    var condition = conditionList[indices.shift()]
    if (indices.length === 0) {
        return condition;
    }
    
    for (const index of indices) {
        condition = condition.children[index];
    }
    return condition;
}

export function addNode(nodeType) {
    var newCondition = new ConditionNode({
        name:nodeType,
        type:nodeType.toLowerCase(),
        column1: null,
        column2: null,
        value: null,
        ID: uniqueIDs.length
    });
    uniqueIDs.push(uniqueIDs.length) // Ensures that all conditions have Unique ID
    conditions.push(newCondition);
    updateConditionDisplay();
}

export function saveProtocol() {
    // Remove circular references from conditions object (i.e. parent)
    const cleanedConditions = prepareConditionsForExport(conditions);

    // Convert conditions array to JSON string
    const jsonString = JSON.stringify(cleanedConditions, null, 2); //Print for legibility

    // create Blob for download using the string
    const blob = new Blob([jsonString], {type:'application/json'});

    // Create a temporary <a> element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'protocol.json'; // Set the default filename

    // Trigger download by clicking the link
    link.click();

    // Clean up the object URL after the download
    URL.revokeObjectURL(link.href);
}

/* Start Context Menu Code: */
export function showContextMenu(event) {
    // Function for showing right click context menu
    event.preventDefault(); // prevent the default right click menu
    const contextMenu = document.getElementById('rightClickContextMenu');
    contextMenu.style.top = `${event.clientY}px`;
    contextMenu.style.left = `${event.clientX}px`;
    contextMenu.style.display = 'block';
}

export function hideContextMenu() {
    // Function that hides the right click context menu
    const contextMenu = document.getElementById('rightClickContextMenu');
    contextMenu.style.display = 'none';
}
/* End context menu function code*/

export function openEditPopup(condition) {
    selectedCondition = condition;

    // Pre fill edit form with current values
    document.getElementById('showEditConditionID').textContent = 'ID: ' + condition.ID;
    document.getElementById('editConditionName').value = condition.name;
    document.getElementById('editConditionType').value = condition.type;
    document.getElementById('editColumn1').value = condition.column1;
    document.getElementById('editColumn2').value = condition.column2;
    document.getElementById('editConditionValue').value = condition.value || '';

    // Show the popup
    document.getElementById('editConditionPopup').style.display = 'block';
}

export function closeEditPopup() {
    document.getElementById('editConditionPopup').style.display = 'none';
    selectedCondition = null;
}

export function stripCircularReferences(condition) {
    const { parent, ...rest } = condition; // This removes the parent property and leaves everything else in 'rest'
    const cleanedChildren = condition.children.map(stripCircularReferences); // Recursively correct all children
    return {...rest, children:cleanedChildren };
}

export function prepareConditionsForExport(conditions) {
    return conditions.map(stripCircularReferences); //Clean all conditions under root node
}

// Populate option lists using helper function and predefined list
const createConditionTypeSelect = document.getElementById('conditionType');
populateSelectOptions(createConditionTypeSelect, conditionTypeOptions);
const editConditionTypeSelect = document.getElementById('editConditionType');
populateSelectOptions(editConditionTypeSelect, [...conditionTypeOptions,...[{value:"and",label:"And"},{value:"or",label:"Or"}]]);

// Add listeners
document.getElementById('conditionType').addEventListener('change', toggleValueField);
document.getElementById('loadFileButton').addEventListener('click', updateColumnSelects);
document.getElementById('columnSelect1').addEventListener('change', setDefaultColumn2);
document.getElementById('columnSelect1').addEventListener('change', setDefaultColumn2);
document.getElementById('addConditionButton').addEventListener('click', addCondition);
document.getElementById('addAndButton').addEventListener('click',function(){addNode("AND");});
document.getElementById('addOrButton').addEventListener('click',function(){addNode("OR");});
document.getElementById('saveProtocolButton').addEventListener('click',saveProtocol);

// Add event listener for dragover to allow dropping
document.addEventListener('dragover', function(event) {
    event.preventDefault(); // Prevent default behavior to allow dropping
});

// Add event listener for drop to handle dropping
document.addEventListener('drop', function(event) {
    event.preventDefault(); // Prevent default behavior to avoid navigating away

    // Find the conditionElement corresponding to the dropped conditionElement
    const droppedOnElement = event.target.closest('.conditionElement');

    // Check if the dropped element has the 'conditionElement' class
    if (!droppedOnElement || !(droppedOnElement.classList.contains('conditionElement') || droppedOnElement.id === 'conditionTree')) {
        // If not, return early and do not proceed with the drop operation
        return;
    }

    // Get the dropped on condition
    const droppedOnCondition = getConditionNodeByIndices(conditions, getElementIndices(droppedOnElement));


    // Get the dragged condition
    const draggedElementId = event.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedElementId);
    const draggedCondition = getConditionNodeByIndices(conditions, getElementIndices(draggedElement));

    // Check if they are the same
    if (droppedOnCondition === draggedCondition || draggedCondition.checkIfIsChild(droppedOnCondition)) {
        return;
    }

    
    // Get dragged child's index w.r.t old parent
    const oldParent = draggedCondition.parent;
    
    // Add dragged condition as child of droppedOnCondition
    if (droppedOnElement.id === 'temporaryConditionRoot') {
        conditions.push(draggedCondition);
        draggedCondition.removeParent();
    } else{
        droppedOnCondition.addChild(draggedCondition);
    }
    
    // Remove dragged element from list
    if (oldParent) {
            const childIndex = oldParent.children.indexOf(draggedCondition);
            oldParent.children.splice(childIndex, 1);
    } else {
        conditions.splice(conditions.indexOf(draggedCondition),1);
    }
    
    

    // Update the display
    updateConditionDisplay();
});

/* Event listeners for context menu code: */
// Add event listener for right clicking of conditionElement
document.addEventListener('contextmenu', function (event) {
    const target = event.target.closest('.conditionElement');
    if (target) {
        clickedConditionElement = target; // store the clicked condition element.
        showContextMenu(event);
    } else {
        hideContextMenu(); // Hide the menu if clicked elsewhere
        clickedConditionElement = null; // Reset cached condition
    }
});

// Add event listener for clicking delete in the context menu
document.getElementById('deleteCondition').addEventListener('click', function () {
    if (clickedConditionElement) {
        const indices = getElementIndices(clickedConditionElement); // get the path to the selected element
        const parent = getConditionNodeByIndices(conditions, indices.slice(0,-1)); // get the path to just the parent (removes last index)
        const childIndex = indices[indices.length - 1]; // Gets the index of the condition clicked rel. to parent
    
        // Remove child from parent or from root
        if (parent) {
            parent.children.splice(childIndex, 1); // Remove clicked node from parent
        } else {
            conditions.splice(childIndex, 1); // Otherwise remove condition from node
        }

        updateConditionDisplay(); // Refresh the display
        hideContextMenu(); // Hide the context menu
    }
});

// Add event listener for "Edit" in the context menu
document.getElementById('editCondition').addEventListener('click', function () {
    if (clickedConditionElement) {
        const indices = getElementIndices(clickedConditionElement);
        const condition = getConditionNodeByIndices(conditions, indices);
        openEditPopup(condition); // Open the popup with the selected condition
        hideContextMenu(); // Hide the context menu
    }
});

// Save the changes to the condition
document.getElementById('saveConditionChanges').addEventListener('click', function () {
    if (selectedCondition) {
        // Update the condition with the new values from the form
        selectedCondition.name = document.getElementById('editConditionName').value;
        selectedCondition.type = document.getElementById('editConditionType').value;
        selectedCondition.column1 = document.getElementById('editColumn1').value;
        selectedCondition.column2 = document.getElementById('editColumn2').value;
        selectedCondition.value = document.getElementById('editConditionValue').value;

        updateConditionDisplay(); // Refresh the display
        closeEditPopup(); // Close the popup
    }
});

// Cancel editing and close the popup
document.getElementById('cancelEditCondition').addEventListener('click', closeEditPopup);