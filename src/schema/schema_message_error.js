class SchemaMessageError extends Error {

	constructor(res) {
		let message = res.short + " (" + res.code + "): " + res.reason; 
		super(message);
		this.name = "SchemaMessageError";
		this.code = res.code;
		this.short = res.short;
		this.reason = res.reason;
	}

}

module.exports = SchemaMessageError;
