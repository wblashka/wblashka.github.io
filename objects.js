export class ConditionNode {
    constructor({name, type, children = [],column1,column2,value=null}) {
        this.name = name;
        this.type = type;
        this.children = children;
        this.column1 = column1;
        this.column2 = column2;
        this.value = value;
    }
    
    addChild(child) {
        this.children.push(child);
    }

    addParent(parent) {
        if (parent != null) {
            parent.addChild(this);
        }
    }

    evaluatethis(){
        //Add code later
    }
}
