const schemaUtil = require("./schema_util.js");

const invalid = require("./invalid.js");

const SchemaError = require("./schema_error.js");

ALLOWED_ATTRIBUTES = [ "null", "optional", "partial" ];

/*
 * SchemaEntity base class, this is extended for all entity types
 */
class SchemaEntity {

	/*
	 * schema: object, schema to validate against
	 * optional: boolean, wether this value is optional or not
	 * path: string, the path in the schema object
	 */
	constructor(schema, optional, path) {
		let errorPath = "";
		if (path !== undefined)
			errorPath = " in " + path;
		if (!schema || typeof(schema) !== "object")
			throw new SchemaError("Missing schema or bad type" + errorPath);

		this.type = schema.type;
		this.valid = schema.valid;
		this.path = path;

		// allowed fields in schema definition
		this.allowedSchemaFields = [];

		// General checks on the schema object fields
		if (this.type === undefined || typeof(this.type) !== "string")
			throw new SchemaError("Bad type attribute or undefined" + errorPath);
		if (this.valid !== undefined && (typeof(this.valid) !== "object" || this.valid === null || this.valid instanceof Array))
			throw new SchemaError("Bad type for valid field" + errorPath);

		this.attributes = {
			optional: false,
			allowNull: false,
			allowPartial: false
		};

		// Expand invalid definitions and include in SchemaEntity
		this.results = schemaUtil.expandInvalidDefinitions(invalid);

		// Check if optional is specified in the attributes list and overwrite if so
		// Check if this value allows null or partial objects
		if (schema.attributes !== undefined) {
			if (!(schema.attributes instanceof Array))
				throw new SchemaError("Bad type for schema attributes, expected array" + errorPath);
			for (let i=0; i<schema.attributes.length; i++)
				if (ALLOWED_ATTRIBUTES.indexOf(schema.attributes[i]) === -1)
					throw new SchemaError("Unknown attribute " + schema.attributes[i] + errorPath);
			if (schema.attributes.indexOf("optional") !== -1)
				this.attributes.optional = true;
			if (schema.attributes.indexOf("null") !== -1)
				this.attributes.allowNull = true;
			if (schema.attributes.indexOf("partial") !== -1)
				this.attributes.allowPartial = true;
		}

		// Check if optional is specified as an argument
		if (optional !== undefined && optional !== null) {
			if (optional !== true && optional !== false)
				throw new SchemaError("'optional' argument must be either true or false" + errorPath);
			this.attributes.optional = optional;
		}

		// add all generic allowed fields
		this.addAllowedFields([ "id", "type", "attributes" ]);
	}

	/*
	 * Add allowed fields to schema definition
	 */
	addAllowedFields(fields) {
		for (let i=0; i<fields.length; i++)
			this.allowedSchemaFields.push(fields[i]);
	}

	/*
	 * Check that the schema contains only the allowed fields
	 */
	assertNoExtraSchemaFields(schema) {
		for (let i in schema)
			if (this.allowedSchemaFields.indexOf(i) === -1)
				throw new SchemaError("Unknown field " + i + " in " + this.path);
	}

	getType() {
		return this.type;
	}

	getPath() {
		return this.path;
	}

	isOptional() {
		return this.attributes.optional;
	}

	allowNull() {
		return this.attributes.allowNull;
	}

	/*
	 * Validation function - do some preliminary checks on the value
	 * value: any type, value to check
	 */
	validate(value) {
		// check special values and see if they are allowed
		if (value === null)
			if (this.allowNull())
				return schemaUtil.getResult(this.results.OK);
			else
				return schemaUtil.getResult(this.results.NULL_NOT_ALLOWED, this.path);

		if (value === undefined)
			if (this.isOptional())
				return schemaUtil.getResult(this.results.OK);
			else
				return schemaUtil.getResult(this.results.NOT_OPTIONAL, this.path);

		// check value type
		let type = typeof(value);
		if (value instanceof Array)
			type = "array";
		switch (this.type) {

			case "boolean":
				if (type === "boolean")
					return schemaUtil.getResult(this.results.OK);
				else
					return schemaUtil.getResult(this.results.INVALID_TYPE, this.path, "boolean", type);

			case "number":
				if (type === "number")
					return schemaUtil.getResult(this.results.OK);
				else
					return schemaUtil.getResult(this.results.INVALID_TYPE, this.path, "number", type);

			case "string":
				if (type === "string")
					return schemaUtil.getResult(this.results.OK);
				else
					return schemaUtil.getResult(this.results.INVALID_TYPE, this.path, "string", type);

			case "object":
				if (type === "object")
					return schemaUtil.getResult(this.results.OK);
				else
					return schemaUtil.getResult(this.results.INVALID_TYPE, this.path, "object", type);

			case "array":
				if (type === "array")
					return schemaUtil.getResult(this.results.OK);
				else
					return schemaUtil.getResult(this.results.INVALID_TYPE, this.path, "array", type);
		}

	}

}

/* Static methods - these will be called upon extension of each class from SchemaEntity, so
 * they are dynamically loaded here and thus avoid circular includes */

/* stores all extended classes */
SchemaEntity.extended = {};

SchemaEntity.addExtended = (type, constructor) => {
	SchemaEntity.extended[type] = constructor;
}

SchemaEntity.getExtended = (type) => {
	return SchemaEntity.extended[type];
}

module.exports = SchemaEntity;
