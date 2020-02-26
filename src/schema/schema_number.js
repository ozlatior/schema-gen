const SchemaEntity = require("./schema_entity.js");

const SchemaError = require("./schema_error.js");

const schemaUtil = require("./schema_util.js");

class SchemaNumber extends SchemaEntity {

	constructor(schema, optional, path) {
		super(schema, optional, path);

		// check for unallowed fields in schema
		this.addAllowedFields([ "valid" ]);
		this.assertNoExtraSchemaFields(schema);

		// Specific checks for number schema valid field
		if (this.valid !== undefined)
			for (let i in this.valid) {
				switch (i) {
					case "range":
						if (!(this.valid[i] instanceof Array))
							throw new SchemaError("Bad type for valid.range, expected array in " + path);
						if (this.valid[i].length !== 2 && this.valid[i].length !== 4)
							throw new SchemaError("Bad length of valid.range array, expected 2 or 4 in " + path);
						break;
					case "type":
						if (this.valid[i] !== "integer")
							throw new SchemaError("Bad value for valid.type in " + path);
						break;
					default:
						throw new SchemaError("Bad field " + i + " in valid in " + path);
				}
			}
	}

	/*
	 * Check that value is within range specified in schema, if any
	 * value: any type, value to check
	 */
	validateRange(value) {
		if (typeof(value) !== "number")
			return false;
		if (this.valid === undefined || this.valid.range === undefined)
			return true;
		let strictLo = this.valid.range[2];
		let strictHi = this.valid.range[3];
		if (strictLo && value <= this.valid.range[0])
			return false;
		if (!strictLo && value < this.valid.range[0])
			return false;
		if (strictHi && value >= this.valid.range[1])
			return false;
		if (!strictHi && value > this.valid.range[1])
			return false;
		return true;
	}

	/*
	 * Check that value is of (sub)type specified in schema, if any
	 * value: any type, value to check
	 */
	validateType(value) {
		if (typeof(value) !== "number")
			return false;
		if (this.valid === undefined || this.valid.type === undefined)
			return true;
		if (this.valid.type === "integer" && Math.floor(value) !== value)
			return false;
		return true;
	}

	/*
	 * Validation function - do the required validation for number fields
	 * value: any type, value to check
	 */
	validate(value) {
		let ret = super.validate(value);
		// if preliminary validation has failed, we have enough reason to return the result
		if (ret.valid === false)
			return ret;
		// if we are here and value is null or undefined, we already checked that
		// this is allowed and we can return right away
		if (value === null || value === undefined)
			return schemaUtil.getResult(this.results.OK);
		// Number specific validations
		if (!this.validateRange(value)) {
			let range = schemaUtil.formatRange(this.valid.range);
			return schemaUtil.getResult(this.results.NUMBER_OUT_OF_RANGE, this.path, range, value);
		}
		if (!this.validateType(value))
			return schemaUtil.getResult(this.results.NUMBER_WRONG_TYPE, this.path, this.valid.type, value);
		// everything ok
		return schemaUtil.getResult(this.results.OK);
	}

}

SchemaEntity.addExtended("number", SchemaNumber);

module.exports = SchemaNumber;
