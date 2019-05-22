class TypedValue {
    constructor(id, type, value, description) {
        this.id = id;
        this.type = type;
        this.value = value;
        this.description = description;
    }

    static fromJson(data) {
        return new TypedValue(data.id, data.type, data.value, data.description);
    }

}

module.exports = TypedValue;
