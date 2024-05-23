export class ConditionNode {
    constructor(name, type, children = [],column1,column2,value=null) {
        self.name = name;
        self.type = type;
        self.children = children;
        self.column1 = column1;
        self.column2 = column2;
        self.value = value;
    }
    
    addChild(child) {
        self.children.push(child);
    }

    addParent(parent) {
        if (parent != null) {
            parent.addChild(self);
        }
    }

    evaluateSelf(){
        //Add code later
    }
}