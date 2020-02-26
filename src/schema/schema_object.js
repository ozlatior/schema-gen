const SchemaEntity = require("./schema_entity.js");
const SchemaError = require("./schema_error.js");

const schemaUtil = require("./schema_util.js");

class SchemaObject extends SchemaEntity {

	constructor(schema, optional, path) {
		super(schema, optional, path);

		// check for unallowed fields in schema
		this.addAllowedFields([ "properties", "required" ]);
		this.assertNoExtraSchemaFields(schema);

		// Check the required field
		if (schema.required !== undefined && !(schema.required instanceof Array))
			throw new SchemaError("Bad type for required field in " + path);

		// Process the properties field and generate Schema Entities for it as well
		if (schema.properties === undefined || schema.properties === null || typeof(schema.properties) !== "object")
			throw new SchemaError("Bad type for properties field or field missing in " + path);
		this.properties = {};
		for (let i in schema.properties) {
			let optionalField;
			// no special handling
			if (schema.required === undefined)
				optionalField = null;
			else {
				// specific handling of properties
				if (schema.required.indexOf(i) === -1)
					optionalField = true;
				else
					optionalField = false;
			}
			let EntityConstructor = SchemaEntity.getExtended(schema.properties[i].type);
			if (EntityConstructor === undefined)
				throw new SchemaError("Could not get entity constructor for type " + schema.properties[i].type + " in " + path);
			this.properties[i] = new EntityConstructor(schema.properties[i], optionalField, path + "/" + i);
		}

	}

	/*
	 * Validation function - do the required validation for object fields
	 * value: any type, value to check
	 */
	validate(value) {
		let ret = super.validate(value);
		// preliminary check failed, so we can return it right away
		if (ret.valid === false)
			return ret;
		// if we are here and value is null or undefined, we already checked that
		// this is allowed and we can return right away
		if (value === null || value === undefined)
			return schemaUtil.getResult(this.results.OK);

		// Now validate all elements in the object against all items schemas
		for (let i in this.properties) {
			let res = this.properties[i].validate(value[i]);
			if (res.valid === false)
				return res;
		}

		// Now check for properties which shouldn't be there, unless we allow partial validation,
		// in which case we don't care
		if (this.attributes.allowPartial !== true)
			for (let i in value) {
				if (this.properties[i] === undefined)
					return schemaUtil.getResult(this.results.OBJECT_UNEXPECTED_FIELD, this.path, null, i);
			}

		return schemaUtil.getResult(this.results.OK);
	}

}

SchemaEntity.addExtended("object", SchemaObject);

module.exports = SchemaObject;
