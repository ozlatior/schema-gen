const assert = require("assert");

const templates = require("./test-schema.json");
const Schema = require("../src/schema/schema.js");
const SchemaError = require("../src/schema/schema_error.js");

const testUtil = require("./test_util.js");

const template = {
	id: "/SimpleObject",
	type: "object",
	properties: {
		field1: {
			type: "number"
		},
		field2: {
			type: "string"
		},
		field3: {
			type: "boolean"
		}
	}
};

describe("Schema Object", () => {

	describe("constructor normal behavior", () => {

		it("should successfully create a root object", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.getId(), "/SimpleObject");
			assert.equal(schema.getType(), "object");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

		it("should successfully create a branch object", () => {
			let schema;
			let t = { type: "object", properties: { field1: { type: "number" } } };
			schema = new Schema(t, "/SomePath", "someKey");
			assert.equal(schema.getId(), "/SomePath/someKey");
			assert.equal(schema.getType(), "object");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

	});

	describe("validation function", () => {

		it("should validate object values", () => {
			let schema;
			schema = new Schema(template);
			assert.equal(schema.validate({ field1: 42, field2: "foo", field3: true }).valid, true);
			assert.equal(schema.validate({ field1: 0, field2: "", field3: false }).valid, true);
		});

		it("should not validate if missing properties", () => {
			let schema;
			schema = new Schema(template);
			assert.equal(schema.validate({ }).valid, false);
			assert.equal(schema.validate({ field1: 42, field2: "foo" }).valid, false);
			assert.equal(schema.validate({ field2: "", field3: false }).valid, false);
		});

		it("should not validate if extra properties", () => {
			let schema;
			schema = new Schema(template);
			assert.equal(schema.validate({ a: 0, field1: 42, field2: "foo", field3: true }).valid, false);
			assert.equal(schema.validate({ a: null, field1: 0, field2: "", field3: false }).valid, false);
		});

		it("should not validate non-object values", () => {
			let schema;
			schema = new Schema(template);
			assert.equal(schema.validate(43).valid, false);
			assert.equal(schema.validate(true).valid, false);
			assert.equal(schema.validate("true").valid, false);
			assert.equal(schema.validate("{ a: 42 }").valid, false);
		});

		it("should not allow null values if not specified", () => {
			let schema;
			schema = new Schema(template);
			assert.equal(schema.validate({ field1: null, field2: "foo", field3: true }).valid, false);
			assert.equal(schema.validate({ field1: 0, field2: null, field3: false }).valid, false);
		});

		it("should allow null values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.properties.field1.attributes = [ "null" ];
			t.properties.field2.attributes = [ "null" ];
			schema = new Schema(t);
			assert.equal(schema.validate({ field1: null, field2: "foo", field3: true }).valid, true);
			assert.equal(schema.validate({ field1: 0, field2: null, field3: false }).valid, true);
		});

		it("should not allow undefined values if not specified", () => {
			let schema;
			schema = new Schema(template);
			assert.equal(schema.validate({ field1: undefined, field2: "foo", field3: true }).valid, false);
			assert.equal(schema.validate({ field1: 0, field2: undefined, field3: false }).valid, false);
		});

		it("should allow undefined values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.properties.field1.attributes = [ "optional" ];
			t.properties.field2.attributes = [ "optional" ];
			schema = new Schema(t);
			assert.equal(schema.validate({ field1: undefined, field2: "foo", field3: true }).valid, true);
			assert.equal(schema.validate({ field1: 0, field2: undefined, field3: false }).valid, true);
		});

		it("should allow optional values trough the required field", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.required = [ "field1" ];
			schema = new Schema(t);
			assert.equal(schema.validate({ field1: 42, field2: "foo", field3: true }).valid, true);
			assert.equal(schema.validate({ field1: 42, field2: "foo" }).valid, true);
			assert.equal(schema.validate({ field1: 42, field3: true }).valid, true);
			assert.equal(schema.validate({ field1: 42, }).valid, true);
			assert.equal(schema.validate({ field2: "foo", field3: true }).valid, false);
		});

		it("should not validate if required values missing", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.required = [ "field1", "field2" ];
			schema = new Schema(t);
			assert.equal(schema.validate({ field1: 42, field2: "foo", field3: true }).valid, true);
			assert.equal(schema.validate({ field2: "foo", field3: true }).valid, false);
			assert.equal(schema.validate({ field1: 42, field3: true }).valid, false);
			assert.equal(schema.validate({ field3: true }).valid, false);
		});

		it("should consider required field over optional attribute", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.required = [ "field1", "field2" ];
			t.properties.field1.attributes = [ "optional" ];
			t.properties.field2.attributes = [ "optional" ];
			schema = new Schema(t);
			assert.equal(schema.validate({ field1: 42, field2: "foo", field3: true }).valid, true);
			assert.equal(schema.validate({ field2: "foo", field3: true }).valid, false);
			assert.equal(schema.validate({ field1: 42, field3: true }).valid, false);
			assert.equal(schema.validate({ field3: true }).valid, false);
		});

		it("should validate nested objects", () => {
			let schema;
			let t = {
				id: "/NestedObject",
				type: "object",
				properties: {
					f1: {
						type: "object",
						properties: {
							f11: {
								type: "number"
							},
							f12: {
								type: "number"
							}
						}
					},
					f2: {
						type: "object",
						properties: {
							f21: {
								type: "string"
							},
							f22: {
								type: "array",
								items: {
									type: "number"
								}
							}
						}
					}
				}
			};
			schema = new Schema(t);
			assert.equal(schema.validate({ f1: { f11: 42, f12: -1 }, f2: { f21: "bla", f22: [1,2,3] } }).valid, true);
			assert.equal(schema.validate({ f1: { f11: 42, f12: -1 }, f2: { f21: "bla", f22: 123 } }).valid, false);
			assert.equal(schema.validate({ f1: { f11: 42, f12: -1 }, f2: { f21: 22, f22: [1,2,3] } }).valid, false);
			assert.equal(schema.validate({ f1: { f11: 42, f12: false }, f2: { f21: "bla", f22: [1,2,3] } }).valid, false);
			assert.equal(schema.validate({ f1: { f12: -1 }, f2: { f21: "bla", f22: [1,2,3] } }).valid, false);
		});

	});

});
