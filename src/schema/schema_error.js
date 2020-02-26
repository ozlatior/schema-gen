class SchemaError extends Error {

	constructor(message) {
		super(message);
		this.name = "SchemaError";
	}

}

module.exports = SchemaError;
