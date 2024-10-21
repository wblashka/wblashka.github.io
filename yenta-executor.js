import {ConditionNode} from './objects.js'



/* List of cached protocols. 
Must be filenames present inside cached_protocols directory
Github pages limits dynamically accessing files, so this must be manually
updated with new protocols as necessary, but only here in this list as they
are uploaded.
*/
const cachedProtocols = ['Hu Mouse Match Protocol.json']
let CSV_DATA = null;
let conditions = null;


// Function to populate protocol select with cached protocols
function populateProtocolSelect() {
    const protocolSelect = document.getElementById('protocolSelect');

    cachedProtocols.forEach(function(protocolName) {
        const option = document.createElement('option');
        option.value = protocolName;
        option.textContent = protocolName.slice(0,-5);
        protocolSelect.appendChild(option);
    })
}

// Parse CSV File and return data
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

function parseProtocol(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);

        // Check if parsed json is an array
        if(!Array.isArray(parsed)) {
            throw new Error('Invalid Protocol: Must be array of Conditions')
        }
        
        // Convert each object in array to an instance of the ConditionNode object
        const conditions = parsed.map(function(condition) {
            const node = new ConditionNode(condition);
            return node;
        });

        // Validate each condition
        conditions.forEach(function(condition) {
            if(!condition.isValid()) {
                throw new Error("Invalid Protocol: Invalid condition structure detected.")
            }
        });

        return conditions

    } catch (error) {
        console.error('Error parsing protocol: ', error);
        alert(error.message)
        return null;
    }
}

function loadCachedProtocol() {
    const protocolName = document.getElementById('protocolSelect').value;
    fetch('./cached_protocols/' + protocolName)
        .then(function(response) {
            if(!response.ok) {
                throw new Error(`Failed to load ${protocolName}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(function(json) {
            conditions = parseProtocol(json);
            //REMOVE ME
            console.log(conditions);
        })
        .catch(function(error) {
            console.error('Error loading cached protocol:', error);
            alert(`Could not load protocol: ${error.message}`);
        });
}

function evaluateProtocolOnCSV(conditions, csvData) {
    const rows = csvData.split('\n').map(function(line) {
        return line.split(',').map(function(cell) {
            return cell.trim();
        });
    });

    const headers = rows[0]; // Extract headers from first row
    const data = rows.slice(1); // Remaining data after removing headers

    // Define helper function to map column names to values
    function mapRowToObject(row) {
        const obj = {};
        headers.forEach(function(header, index) {
            obj[header] = row[index];
        });
        return obj;
    }

    // Now loop throw all row pairs
    const results = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const row1 = mapRowToObject(data[i]);
            const row2 = mapRowToObject(data[j]);

            // Evaluate protocol conditions
            const allConditionsTrue = conditions.every(function(condition) {
                const isPair = condition.evaluate(row1, row2) || condition.evaluate(row2, row1);
                return isPair;
            });

            // Store the pair if all conditions are true
            if (allConditionsTrue) {
                results.push([row1, row2]);
            }
        }
    }

    return results;
}

/* Add event listeners: */
// Load csv data
document.getElementById('csvFile').addEventListener('change', async function() {CSV_DATA = await loadCSV();});

// Load uploaded protocol
document.getElementById('protocolUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const protocolJson = e.target.result;
            conditions = parseProtocol(protocolJson);
            //REMOVE ME
            console.log(conditions);

        };
        reader.readAsText(file);
    }
});

// Load cached Protocol
document.getElementById('loadCachedProtocol').addEventListener('click', loadCachedProtocol);

// Execute Protocol
document.getElementById('executeButton').addEventListener('click', function() {
    if(!CSV_DATA || !conditions) {
        alert('Please upload both a CSV file and a compatible protocol.')
        return;
    } 
    const matchingPairs = evaluateProtocolOnCSV(conditions, CSV_DATA);

    // REMOVE ME
    console.log(matchingPairs);

    if(matchingPairs.length === 0) {
        alert('No matching row pairs found.');
    }
});

populateProtocolSelect(); // Populate cached protocol options