const SchemaEntity = require("./schema_entity.js");
const SchemaBoolean = require("./schema_boolean.js");
const SchemaNumber = require("./schema_number.js");
const SchemaString = require("./schema_string.js");
const SchemaArray = require("./schema_array.js");
const SchemaObject = require("./schema_object.js");

const SchemaError = require("./schema_error.js");
const SchemaMessageError = require("./schema_message_error.js");

const schemaUtil = require("./schema_util.js");

class Schema {

	/*
	 * schema: object, schema object to use as template
	 * id: specific id (to use in case it's not specified in the schema)
	 * key: current key (used to build the path in nested objects)
	 * optional: true if this schema element is optional (useful for nested values)
	 */
	constructor(schema, id, key, optional) {
		if (typeof(schema) !== "object" || schema instanceof Array || !schema)
			throw new SchemaError("Missing schema argument or bad type");

		if (id === undefined || id === null)
			this.id = schema.id;
		else
			this.id = id;

		if (this.id === undefined)
			throw new SchemaError("Missing id in schema");
		if (key !== undefined && key !== null)
			this.id += "/" + key;

		this.type = schema.type;
		let EntityConstructor = SchemaEntity.getExtended(this.type);
		if (EntityConstructor === undefined)
			throw new SchemaError("Bad type " + this.type + " in schema " + this.id);
		
		this.entity = new EntityConstructor(schema, optional, this.id);
	}

	getId() {
		return this.id;
	}

	getType() {
		return this.type;
	}

	isOptional() {
		return this.entity.isOptional();
	}

	allowNull() {
		return this.entity.allowNull();
	}

	/*
	 * validation function - the call is forwarded to the entity inside this Schema object
	 * value: any type, value to validate
	 */
	validate(value) {
		return this.entity.validate(value);
	}

	/*
	 * assertion function - this throws a SchemaMessageError in case the message does not match
	 */
	assertValid(value) {
		let res = this.entity.validate(value);
		if (res.valid !== true)
			throw new SchemaMessageError(res);
		return true;
	}

}

Schema.SchemaEntity = SchemaEntity;
Schema.SchemaBoolean = SchemaBoolean;
Schema.SchemaNumber = SchemaNumber;
Schema.SchemaString = SchemaString;
Schema.SchemaArray = SchemaArray;
Schema.SchemaObject = SchemaObject;
Schema.SchemaError = SchemaError;
Schema.SchemaMessageError = SchemaMessageError;

module.exports = Schema;
