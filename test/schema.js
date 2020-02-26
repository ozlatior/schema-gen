const assert = require("assert");

const SchemaEntity = require("../src/schema/schema_entity.js");
const SchemaError = require("../src/schema/schema_error.js");

describe("Schema Entity", () => {

	describe("constructor normal behavior", () => {

		it("should create entity object with correct properties", () => {
			var e;
			e = new SchemaEntity({ id: "/Test", type: "boolean" }, null, "/Test");
			assert.equal(e.getType(), "boolean");
			assert.equal(e.getPath(), "/Test");
			assert.equal(e.isOptional(), false);
			assert.equal(e.allowNull(), false);
		});

		it("should create entity object with correct properties, optional", () => {
			var e;
			e = new SchemaEntity({ id: "/Test", type: "boolean", attributes: [ "optional" ]  }, null, "/Test");
			assert.equal(e.getType(), "boolean");
			assert.equal(e.getPath(), "/Test");
			assert.equal(e.isOptional(), true);
			assert.equal(e.allowNull(), false);
		});

		it("should create entity object with correct properties, null", () => {
			var e;
			e = new SchemaEntity({ id: "/Test", type: "boolean", attributes: [ "null" ] }, null, "/Test");
			assert.equal(e.getType(), "boolean");
			assert.equal(e.getPath(), "/Test");
			assert.equal(e.isOptional(), false);
			assert.equal(e.allowNull(), true);
		});

		it("should create entity object with correct properties, optional, null", () => {
			var e;
			e = new SchemaEntity({ id: "/Test", type: "boolean", attributes: [ "optional", "null" ] }, null, "/Test");
			assert.equal(e.getType(), "boolean");
			assert.equal(e.getPath(), "/Test");
			assert.equal(e.isOptional(), true);
			assert.equal(e.allowNull(), true);
		});

		it("should create entity object with correct properties, optional, null, override", () => {
			var e;
			e = new SchemaEntity({ id: "/Test", type: "boolean", attributes: [ "optional", "null" ] }, false, "/Test");
			assert.equal(e.getType(), "boolean");
			assert.equal(e.getPath(), "/Test");
			assert.equal(e.isOptional(), false);
			assert.equal(e.allowNull(), true);
		});

	});

	describe("constructor exceptions", () => {

		it("throws on missing schema or bad type", () => {
			var e;
			assert.throws(() => { e = new SchemaEntity(); }, new SchemaError("Missing schema or bad type"));
			assert.throws(() => { e = new SchemaEntity("bla"); }, new SchemaError("Missing schema or bad type"));
		});

		it("throws on missing or bad type for type value", () => {
			var e;
			assert.throws(() => { e = new SchemaEntity({}); }, new SchemaError("Bad type attribute or undefined"));
			assert.throws(() => { e = new SchemaEntity({ type: 42 }); }, new SchemaError("Bad type attribute or undefined"));
		});

		it("throws on bad type for valid field", () => {
			var e;
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", valid: 22 }); },
				new SchemaError("Bad type for valid field"));
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", valid: [ 1, 2, 3 ] }); },
				new SchemaError("Bad type for valid field"));
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", valid: null }); },
				new SchemaError("Bad type for valid field"));
		});

		it("throws on bad type for attributes field", () => {
			var e;
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", attributes: null }); },
				new SchemaError("Bad type for schema attributes, expected array"));
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", attributes: { a: 12 } }); },
				new SchemaError("Bad type for schema attributes, expected array"));
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", attributes: 42 }); },
				new SchemaError("Bad type for schema attributes, expected array"));
		});

		it("throws on bad values for attributes field", () => {
			var e;
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", attributes: [ "something" ] }); },
				new SchemaError("Unknown attribute something"));
			assert.throws(() => { e = new SchemaEntity({ type: "boolean", attributes: [ "optional", "null", "something" ] }); },
				new SchemaError("Unknown attribute something"));
		});

		it("throws on bad value for optional argument", () => {
			var e;
			assert.throws(() => { e = new SchemaEntity({ type: "boolean" }, 1); },
				new SchemaError("'optional' argument must be either true or false"));
			assert.throws(() => { e = new SchemaEntity({ type: "boolean" }, "true"); },
				new SchemaError("'optional' argument must be either true or false"));
		});

	});

});
