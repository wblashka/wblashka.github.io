import { ConditionNode } from './objects.js'

/* List of cached protocols. 
Must be filenames present inside cached_protocols directory
Github pages limits dynamically accessing files, so this must be manually
updated with new protocols as necessary, but only here in this list as they
are uploaded.
*/
const cachedProtocols = [
    'Hu Mouse Match Protocol.json',
    'Updated Test Protocol.json',
]
let CSV_DATA = null
let conditions = null
let PROTOCOL_LOADED


// Function to update element that shows protocol is loaded
function toggleLoadedProtocol() {
    let loaded_indicator = document.getElementById('loadedIndicator')
    loaded_indicator.style.display = PROTOCOL_LOADED ? "inline" : "none"
}

// Function to populate protocol select with cached protocols
function populateProtocolSelect() {
    const protocolSelect = document.getElementById('protocolSelect')

    cachedProtocols.forEach(function (protocolName) {
        const option = document.createElement('option')
        option.value = protocolName
        option.textContent = protocolName.slice(0, -5)
        protocolSelect.appendChild(option)
    })
}

// Parse CSV File and return data
export function loadCSV() {
    return new Promise((resolve, reject) => {
        var fileInput = document.getElementById('csvFile')
        var file = fileInput.files[0]
        if (!file) {
            alert('Please select a CSV file to load.')
            reject('No file selected')
        }

        var reader = new FileReader()

        reader.onload = function (event) {
            var csvData = event.target.result
            resolve(csvData)
        }

        reader.onerror = function () {
            alert('Unable to read the CSV file.')
            reject('Error reading file')
        }

        reader.readAsText(file)
    })
}

function parseCSV(csvData) {
    const rows = []
    let inQuotes = false
    let row = []
    let cell = ''

    for (let i = 0; i < csvData.length; i++) {
        const char = csvData[i]

        if (char === '"' && (i === 0 || csvData[i - 1] !== '\\')) {
            inQuotes = !inQuotes // Toggle the inQuotes flag
        } else if (char === ',' && !inQuotes) {
            row.push(cell.trim())
            cell = ''
        } else if (char === '\n' && !inQuotes) {
            row.push(cell.trim())
            rows.push(row)
            row = []
            cell = ''
        } else {
            cell += char // Append character to the current cell
        }
    }

    if (cell) row.push(cell.trim()) // Add the last cell
    if (row.length) rows.push(row) // Add the last row if not empty

    return rows
}

function parseProtocol(jsonString) {
    try {
        const parsed = JSON.parse(jsonString)

        // Check if parsed json is an array
        if (!Array.isArray(parsed)) {
            throw new Error('Invalid Protocol: Must be array of Conditions')
        }

        // Convert each object in array to an instance of the ConditionNode object
        const uploaded_conditions = parsed.map(function (condition) {
            const node = new ConditionNode(condition)
            return node
        })

        // Validate each condition
        uploaded_conditions.forEach(function (condition) {
            if (!condition.isValid()) {
                throw new Error(
                    'Invalid Protocol: Invalid condition structure detected.'
                )
            }
        })

        PROTOCOL_LOADED = true
        toggleLoadedProtocol()
        return uploaded_conditions
    } catch (error) {
        console.error('Error parsing protocol: ', error)
        alert(error.message)
        PROTOCOL_LOADED = false
        toggleLoadedProtocol()
        return null
    }
}

function loadCachedProtocol() {
    const protocolName = document.getElementById('protocolSelect').value
    fetch('./cached_protocols/' + protocolName)
        .then(function (response) {
            if (!response.ok) {
                throw new Error(
                    `Failed to load ${protocolName}: ${response.statusText}`
                )
            }
            return response.text()
        })
        .then(function (json) {
            conditions = parseProtocol(json)
        })
        .catch(function (error) {
            console.error('Error loading cached protocol:', error)
            PROTOCOL_LOADED = false
            alert(`Could not load protocol: ${error.message}`)
        })
}

function evaluateProtocolOnCSV(conditions, csvData) {
    const rows = parseCSV(csvData)

    const headers = rows[0] // Extract headers from first row
    const data = rows.slice(1) // Remaining data after removing headers

    // Define helper function to map column names to values
    function mapRowToObject(row) {
        const obj = {}
        headers.forEach(function (header, index) {
            obj[header] = row[index]
        })
        return obj
    }

    // Now loop throw all row pairs
    const results = []
    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const row1 = mapRowToObject(data[i])
            const row2 = mapRowToObject(data[j])

            // Evaluate protocol conditions
            const allConditionsTrue = conditions.every(function (condition) {
                const isPair =
                    condition.evaluate(row1, row2) ||
                    condition.evaluate(row2, row1)
                return isPair
            })

            // Store the pair if all conditions are true
            if (allConditionsTrue) {
                results.push([row1, row2])
            }
        }
    }

    return results
}

function updateDisplayFieldChoices(matches) {
    const displaySelect = document.getElementById('primaryDisplaySelect')
    const separatorSelect = document.getElementById('separatorSelect')

    // Generate table headers based on first row keys.
    const headers = Object.keys(matches[0][0]) // First row, first item keys
    headers.forEach(function(header) {
        const display_option = document.createElement('option')
        display_option.value = header
        display_option.textContent = header
        displaySelect.appendChild(display_option)
    })

    separatorCandidates = findDifferingFields(matches)
    separatorCandidates.forEach(function(separator) {
        const display_option = document.createElement('option')
        display_option.value = separator
        display_option.textContent = separator
        separatorSelect.appendChild(display_option)
    })
}

function findDifferingFields(matches) {
    const differingFields = new Set();

    matches.forEach(function(pair) {
        const row1 = pair[0];
        const row2 = pair[1];

        Object.keys(row1).forEach(function(field) {
            if (row1[field] !== row2[field]) {
                differingFields.add(field);
            }
        });
    });

    return Array.from(differingFields);
}

function displayMatches(matches) {
    const tableHeaderRow = document.getElementById('tableHeaderRow')
    const tableBody = document.getElementById('tableBody')

    updateDisplayFieldChoices(matches)
    displayField = 

    // Clear existing content:
    tableHeaderRow.innerHTML = ''
    tableBody.innerHTML = ''

    if (matches.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="100%">No Matches Found</td></tr>'
        return
    }

    // Add table headers:


    // Group matches by the separatorField
    const groupedMatches = {};
    matches.forEach(function(pair) {
        const separatorValue = pair[0][separatorField] || 'No Value';
        if (!groupedMatches[separatorValue]) {
            groupedMatches[separatorValue] = [];
        }
        groupedMatches[separatorValue].push(pair);
    });

    // Render each group of matches in the table
    Object.keys(groupedMatches).forEach(function(group) {
        const groupRow = document.createElement('tr');
        const groupCell = document.createElement('td');
        groupCell.colSpan = 2;
        groupCell.style.fontWeight = 'bold';
        groupCell.textContent = `Group: ${group}`;
        groupRow.appendChild(groupCell);
        tableBody.appendChild(groupRow);

        groupedMatches[group].forEach(function(pair) {
            const row = document.createElement('tr');

            const cell1 = document.createElement('td');
            cell1.textContent = pair[0][displayField] || 'No Value';
            row.appendChild(cell1);

            const cell2 = document.createElement('td');
            cell2.textContent = pair[1][displayField] || 'No Value';
            row.appendChild(cell2);

            tableBody.appendChild(row);
        });
    });

}

/* Add event listeners: */
// Load csv data
document
    .getElementById('csvFile')
    .addEventListener('change', async function () {
        CSV_DATA = await loadCSV()
    })

// Load uploaded protocol
document
    .getElementById('protocolUpload')
    .addEventListener('change', function (event) {
        const file = event.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = function (e) {
                const protocolJson = e.target.result
                conditions = parseProtocol(protocolJson)
                //REMOVE ME
                console.log(conditions)
            }
            reader.readAsText(file)
        }
    })

// Load cached Protocol
document
    .getElementById('loadCachedProtocol')
    .addEventListener('click', loadCachedProtocol)

// Execute Protocol
document.getElementById('executeButton').addEventListener('click', function () {
    if (!CSV_DATA || !conditions) {
        alert('Please upload both a CSV file and a compatible protocol.')
        return
    }
    const matchingPairs = evaluateProtocolOnCSV(conditions, CSV_DATA)

    // REMOVE ME
    console.log(matchingPairs)

    if (matchingPairs.length === 0) {
        alert('No matching row pairs found.')
    }
})

populateProtocolSelect() // Populate cached protocol options
