const SchemaEntity = require("./schema_entity.js");
const SchemaError = require("./schema_error.js");

const schemaUtil = require("./schema_util.js");

class SchemaArray extends SchemaEntity {

	constructor(schema, optional, path) {
		super(schema, optional, path);

		// check for unallowed fields in schema
		this.addAllowedFields([ "valid", "items" ]);
		this.assertNoExtraSchemaFields(schema);

		// Process the items field and generate Schemas for it as well
		if (schema.items === undefined || schema.items === null || typeof(schema.items) !== "object")
			throw new SchemaError("Bad type for items field or field missing in " + path);
		this.items = [];
		if (schema.items instanceof Array) {
			for (let i=0; i<schema.items.length; i++) {
				let EntityConstructor = SchemaEntity.getExtended(schema.items[i].type);
				if (EntityConstructor === undefined)
					throw new SchemaError("Could not get entity constructor for type " + schema.properties[i].type + " in " + path);
				this.items.push(new EntityConstructor(schema.items[i], null, path + "/items/" + i));
			}
		}
		else {
			let EntityConstructor = SchemaEntity.getExtended(schema.items.type);
			if (EntityConstructor === undefined)
				throw new SchemaError("Could not get entity constructor for type " + schema.properties[i].type + " in " + path);
			this.items.push(new EntityConstructor(schema.items, null, path + "/items/0"));
		}

		// Specific checks for array schema valid field
		if (this.valid !== undefined)
			for (let i in this.valid) {
				switch (i) {
					case "length":
						if (this.valid[i] instanceof Array) {
							if (this.valid[i].length !== 2)
								throw new SchemaError("Bad length of valid.length array, expected 2 in " + path);
						}
						else if (typeof(this.valid[i]) !== "number")
							throw new SchemaError("Bad type for valid.length, expected number or array in " + path);
						break;
					default:
						throw new SchemaError("Bad field " + i + " in valid in " + path);
				}
			}
	}

	/*
	 * Check that length is within range specified in schema, if any
	 * value: any type, value to check
	 */
	validateLength(value) {
		if (!(value instanceof Array))
			return false;
		if (this.valid === undefined || this.valid.length === undefined)
			return true;
		// single value
		if (typeof(this.valid.length) === "number")
			return value.length === this.valid.length;
		// range
		if (value.length < this.valid.length[0])
			return false;
		if (value.length > this.valid.length[1])
			return false;
		return true;
	}

	/*
	 * Validation function - do the required validation for array fields
	 * value: any type, value to check
	 */
	validate(value) {
		let ret = super.validate(value);
		// preliminary validation failed so we can return right away
		if (ret.valid === false)
			return ret;
		// if we are here and value is null or undefined, we already checked that
		// this is allowed and we can return right away
		if (value === null || value === undefined)
			return schemaUtil.getResult(this.results.OK);
		// Array specific validations
		if (!this.validateLength(value))
			if (typeof(this.valid.length) === "number") {
				let expected = this.valid.length;
				return schemaUtil.getResult(this.results.ARRAY_LENGTH_INVALID, this.path, expected, value.length);
			}
			else {
				let expected = schemaUtil.formatRange(this.valid.length);
				return schemaUtil.getResult(this.results.ARRAY_LENGTH_OUT_OF_RANGE, this.path, expected, value.length);
			}
		// Now validate all elements in the array against all items schemas
		let acceptedTypes = [];
		for (let i=0; i<this.items.length; i++)
			acceptedTypes.push(this.items[i].type);
		acceptedTypes = acceptedTypes.join(", ");
		for (let i=0; i<value.length; i++) {
			let validated = false;
			// keep reason with most specific (highest) code here - this is just a way of getting an idea of the
			// issue, since arrays are complex objects and we can't guess what the user really intended to do
			// we start by reporting none of the element types matched, this will be our least specific message
			let reason = schemaUtil.getResult(this.results.ARRAY_UNEXPECTED_TYPE, this.path, acceptedTypes, value[i]);
			for (let j=0; j<this.items.length; j++) {
				let v = this.items[j].validate(value[i]);
				if (v.valid) {
					validated = true;
					break;
				}
				// more specific message, so we take this one instead
				if (v.code > reason.code)
					reason = v;
			}
			// nothing matched so we have an invalid element
			if (validated === false)
				return reason;
		}
		return schemaUtil.getResult(this.results.OK);
	}

}

SchemaEntity.addExtended("array", SchemaArray);

module.exports = SchemaArray;
