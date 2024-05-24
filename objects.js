export class ConditionNode {
    constructor({name, type, children = [],column1,column2,value=null, uniqueIDs}) {
        this.name = name;
        this.type = type;
        this.children = children;
        this.column1 = column1;
        this.column2 = column2;
        this.value = value;
        this.parent = null;
        this.ID = uniqueIDs.length;
        uniqueIDs.push(this.ID)
    }
    
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    addParent(parent) {
        if (parent != null) {
            parent.addChild(this);
            this.parent = parent;
        }
    }

    removeParent() {
        this.parent = null;
    }

    checkIfIsChild(otherNode){
        if (this.children.includes(otherNode)){
            return true;
        } else if (this.children.length > 0) {
            for (const child of this.children) {
                child.checkIfIsChild(otherNode);
            }
        } else {
            return false;
        }
    }
    
    evaluatethis(){
        //Add code later
    }
}
