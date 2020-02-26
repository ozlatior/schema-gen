const SchemaEntity = require("./schema_entity.js");

const SchemaError = require("./schema_error.js");

const schemaUtil = require("./schema_util.js");

class SchemaString extends SchemaEntity {

	constructor(schema, optional, path) {
		super(schema, optional, path);

		// check for unallowed fields in schema
		this.addAllowedFields([ "valid" ]);
		this.assertNoExtraSchemaFields(schema);

		// Specific checks for string schema valid field
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
					case "regexp":
						if (typeof(this.valid[i]) !== "string")
							throw new SchemaError("Bad value type for valid.regexp in " + path);
						try {
							this.valid[i] = new RegExp(this.valid[i], "g");
						}
						catch {
							throw new SchemaError("Bad value for valid.regexp in " + path);
						}
						break;
					case "equals":
						if (typeof(this.valid[i]) !== "string")
							throw new SchemaError("Bad value type for valid.regexp in " + path);
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
		if (typeof(value) !== "string")
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
	 * Check that string matches regexp specified in schema, if any
	 * value: any type, value to check
	 */
	validateRegexp(value) {
		if (typeof(value) !== "string")
			return false;
		if (this.valid === undefined || this.valid.regexp === undefined)
			return true;
		if (value.match(this.valid.regexp) === null)
			return false;
		return true;
	}

	/*
	 * Check that string matches regexp specified in schema, if any
	 * value: any type, value to check
	 */
	validateEquals(value) {
		if (typeof(value) !== "string")
			return false;
		if (this.valid === undefined || this.valid.equals === undefined)
			return true;
		if (value === this.valid.equals)
			return true;
		return false;
	}

	/*
	 * Validation function - do the required validation for string fields
	 * value: any type, value to check
	 */
	validate(value) {
		let ret = super.validate(value);
		// if preliminary validation failed, we can return it right away
		if (ret.valid === false)
			return ret;
		// if we are here and value is null or undefined, we already checked that
		// this is allowed and we can return right away
		if (value === null || value === undefined)
			return schemaUtil.getResult(this.results.OK);
		// String specific validations
		if (!this.validateLength(value)) {
			if (typeof(this.valid.length) === "number") {
				let expected = this.valid.length;
				return schemaUtil.getResult(this.results.STRING_LENGTH_INVALID, this.path, expected, value.length);
			}
			else {
				let expected = schemaUtil.formatRange(this.valid.length);
				return schemaUtil.getResult(this.results.STRING_LENGTH_OUT_OF_RANGE, this.path, expected, value.length);
			}
		}
		if (!this.validateRegexp(value))
			return schemaUtil.getResult(this.results.STRING_DOES_NOT_MATCH_REGEXP, this.path, this.valid.regexp, value);
		if (!this.validateEquals(value))
			return schemaUtil.getResult(this.results.STRING_UNEXPECTED_VALUE, this.path, this.valid.equals, value);
		return schemaUtil.getResult(this.results.OK);
	}

}

SchemaEntity.addExtended("string", SchemaString);

module.exports = SchemaString;
