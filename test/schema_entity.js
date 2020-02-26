const assert = require("assert");

const Schema = require("../src/schema/schema.js");
const SchemaError = require("../src/schema/schema_error.js");

describe("Schema", () => {

	describe("constructor normal behavior", () => {
	
		it("should not throw on missing id in case id given as arg", () => {
			let schema = new Schema({ type: "boolean" }, "/Test");
			assert.equal(schema.getId(), "/Test");
			assert.equal(schema.getType(), "boolean");
		});

		it("should take id from arg rather than schema", () => {
			let schema = new Schema({ id: "/NotGood", type: "boolean" }, "/Test");
			assert.equal(schema.getId(), "/Test");
			assert.equal(schema.getType(), "boolean");
		});
	
		it("should merge key into id from schema", () => {
			let schema = new Schema({ id: "/Test", type: "boolean" }, null, "property");
			assert.equal(schema.getId(), "/Test/property");
			assert.equal(schema.getType(), "boolean");
		});
	
		it("should merge key into id from arg rather than schema", () => {
			let schema = new Schema({ id: "/NotGood", type: "boolean" }, "/Test", "property");
			assert.equal(schema.getId(), "/Test/property");
			assert.equal(schema.getType(), "boolean");
		});
	
	});

	describe("constructor exceptions", () => {

		it("should throw in case of missing schema or bad type", () => {
			let schema;
			assert.throws(() => { schema = new Schema(); }, new SchemaError("Missing schema argument or bad type"));
			assert.throws(() => { schema = new Schema([]); }, new SchemaError("Missing schema argument or bad type"));
			assert.throws(() => { schema = new Schema("bla"); }, new SchemaError("Missing schema argument or bad type"));
		});

		it("should throw in case of missing id", () => {
			let schema;
			assert.throws(() => { schema = new Schema({}); }, new SchemaError("Missing id in schema"));
		});

		it("should throw in case of bad type", () => {
			let schema;
			let t = {
				id: "/Test",
				type: "somethingBad"
			};
			assert.throws(() => { schema = new Schema(t); }, new SchemaError("Bad type somethingBad in schema /Test"));
		});

	});

});
