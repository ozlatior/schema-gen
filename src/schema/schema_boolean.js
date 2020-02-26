const SchemaEntity = require("./schema_entity.js");

const SchemaError = require("./schema_error.js");

class SchemaBoolean extends SchemaEntity {

	constructor(schema, optional, path) {
		super(schema, optional, path);

		// check for unallowed fields in schema
		this.assertNoExtraSchemaFields(schema);
	}

}

SchemaEntity.addExtended("boolean", SchemaBoolean);

module.exports = SchemaBoolean;
