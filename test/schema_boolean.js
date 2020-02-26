const assert = require("assert");

const templates = require("./test-schema.json");
const Schema = require("../src/schema/schema.js");

const testUtil = require("./test_util.js");

const template = testUtil.getElementByValue(templates, "id", "/BooleanPrimitive"); 

describe("Schema Boolean", () => {

	describe("constructor normal behavior", () => {

		it("should successfully create a root object", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.getId(), "/BooleanPrimitive");
			assert.equal(schema.getType(), "boolean");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), true);
		});

		it("should successfully create a branch object", () => {
			let schema;
			let t = { type: "boolean" };
			schema = new Schema(t, "/SomePath", "someKey");
			assert.equal(schema.getId(), "/SomePath/someKey");
			assert.equal(schema.getType(), "boolean");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

	});

	describe("validation function", () => {

		it("should validate boolean values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.validate(true).valid, true);
			assert.equal(schema.validate(false).valid, true);
		});

		it("should not validate non-boolean values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.validate("true").valid, false);
			assert.equal(schema.validate(1).valid, false);
			assert.equal(schema.validate(0).valid, false);
			assert.equal(schema.validate([true]).valid, false);
			assert.equal(schema.validate({ a: 42 }).valid, false);
		});

		it("should not allow null values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.attributes = [ ];
			schema = new Schema(t);
			assert.equal(schema.validate(true).valid, true);
			assert.equal(schema.validate(false).valid, true);
			assert.equal(schema.validate(null).valid, false);
		});

		it("should allow null values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.attributes = [ "null" ];
			schema = new Schema(t);
			assert.equal(schema.validate(true).valid, true);
			assert.equal(schema.validate(false).valid, true);
			assert.equal(schema.validate(null).valid, true);
		});

		it("should not allow undefined values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.attributes = [ ];
			schema = new Schema(t);
			assert.equal(schema.validate(true).valid, true);
			assert.equal(schema.validate(false).valid, true);
			assert.equal(schema.validate(undefined).valid, false);
		});

		it("should allow undefined values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.attributes = [ "optional" ];
			schema = new Schema(t);
			assert.equal(schema.validate(true).valid, true);
			assert.equal(schema.validate(false).valid, true);
			assert.equal(schema.validate(undefined).valid, true);
		});

	});

});
