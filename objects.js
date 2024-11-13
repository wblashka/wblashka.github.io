export class ConditionNode {
    constructor({
        name,
        type,
        children = [],
        column1,
        column2,
        value = null,
        invert = false,
        ID,
    }) {
        this.name = name
        this.type = type
        this.children = children.map(function (child) {
            return new ConditionNode(child)
        })
        this.column1 = column1
        this.column2 = column2
        this.value = value
        this.parent = null
        this.ID = ID
        this.invert = invert
    }

    addChild(child) {
        this.children.push(child)
        child.parent = this
    }

    addParent(parent) {
        if (parent != null) {
            parent.addChild(this)
            this.parent = parent
        }
    }

    removeParent() {
        this.parent = null
    }

    checkIfIsChild(otherNode) {
        if (this.children.includes(otherNode)) {
            return true
        } else if (this.children.length > 0) {
            for (const child of this.children) {
                child.checkIfIsChild(otherNode)
            }
        } else {
            return false
        }
    }

    isValid() {
        // Check if condition is valid (for importing protocols)
        return (
            typeof this.name === 'string' &&
            typeof this.type === 'string' &&
            typeof this.column1 === 'string' &&
            typeof this.column2 === 'string' &&
            Array.isArray(this.children)
        )
    }

    evaluate(row1, row2) {
        let result

        switch (this.type) {
            case 'and':
                // All children must evaluate to true
                result = this.children.every(function (child) {
                    return child.evaluate(row1, row2)
                })
                break

            case 'or':
                // At least one child must evaluate to true
                result = this.children.some(function (child) {
                    return child.evaluate(row1, row2)
                })
                break

            case 'match':
                // Values in the two specified columns must match
                result = row1[this.column1] === row2[this.column2]
                break

            case 'mismatch':
                // Values in the two specified columns must not match
                result = row1[this.column1] !== row2[this.column2]
                break

            case 'oneContains':
                // Ensure non-empty values are used in the contains check
                result =
                    (row1[this.column1] &&
                        row1[this.column1].includes(this.value)) ||
                    (row2[this.column1] &&
                        row2[this.column1].includes(this.value))
                break

            case 'equals':
                // Value in column1 of row1 and row2 must exactly match the specified value
                result =
                    row1[this.column1] === this.value &&
                    row2[this.column1] === this.value
                break

            default:
                throw new Error(`Unknown condition type: ${this.type}`)
        }

        // Apply inversion if needed
        let final_result = this.invert ? !result : result

        return final_result
    }
}
