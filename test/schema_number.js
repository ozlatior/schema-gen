const assert = require("assert");

const templates = require("./test-schema.json");
const Schema = require("../src/schema/schema.js");
const SchemaError = require("../src/schema/schema_error.js");

const testUtil = require("./test_util.js");

const template = testUtil.getElementByValue(templates, "id", "/NumberPrimitive"); 

describe("Schema Number", () => {

	describe("constructor normal behavior", () => {

		it("should successfully create a root object", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.getId(), "/NumberPrimitive");
			assert.equal(schema.getType(), "number");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), true);
		});

		it("should successfully create a branch object", () => {
			let schema;
			let t = { type: "number" };
			schema = new Schema(t, "/SomePath", "someKey");
			assert.equal(schema.getId(), "/SomePath/someKey");
			assert.equal(schema.getType(), "number");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

	});

	describe("validation function", () => {

		it("should validate number values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate(0).valid, true);
			assert.equal(schema.validate(-1.3).valid, true);
			assert.equal(schema.validate(42).valid, true);
			assert.equal(schema.validate(42.42e42).valid, true);
		});

		it("should validate number values within range", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { range: [ 1, 10 ] };
			schema = new Schema(t);
			assert.equal(schema.validate(1).valid, true);
			assert.equal(schema.validate(-1).valid, false);
			assert.equal(schema.validate(5.5).valid, true);
			assert.equal(schema.validate(10).valid, true);
			assert.equal(schema.validate(15.2).valid, false);
		});

		it("should validate number values within range, specifically not strict", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { range: [ 1, 10, false, false ] };
			schema = new Schema(t);
			assert.equal(schema.validate(1).valid, true);
			assert.equal(schema.validate(-1).valid, false);
			assert.equal(schema.validate(5.5).valid, true);
			assert.equal(schema.validate(10).valid, true);
			assert.equal(schema.validate(15.2).valid, false);
		});

		it("should validate number values within range, specifically strict", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { range: [ 1, 10, true, true ] };
			schema = new Schema(t);
			assert.equal(schema.validate(1).valid, false);
			assert.equal(schema.validate(-1).valid, false);
			assert.equal(schema.validate(5.5).valid, true);
			assert.equal(schema.validate(10).valid, false);
			assert.equal(schema.validate(15.2).valid, false);
		});

		it("should validate only integer number values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { type: "integer" };
			schema = new Schema(t);
			assert.equal(schema.validate(1).valid, true);
			assert.equal(schema.validate(-1).valid, true);
			assert.equal(schema.validate(5.5).valid, false);
			assert.equal(schema.validate(10).valid, true);
			assert.equal(schema.validate(15.2).valid, false);
		});

		it("should not validate non-number values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate("43").valid, false);
			assert.equal(schema.validate(true).valid, false);
			assert.equal(schema.validate([true]).valid, false);
			assert.equal(schema.validate({ a: 42 }).valid, false);
		});

		it("should not allow null values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ ];
			schema = new Schema(t);
			assert.equal(schema.validate(1).valid, true);
			assert.equal(schema.validate(null).valid, false);
		});

		it("should allow null values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ "null" ];
			schema = new Schema(t);
			assert.equal(schema.validate(-1).valid, true);
			assert.equal(schema.validate(null).valid, true);
		});

		it("should not allow undefined values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ ];
			schema = new Schema(t);
			assert.equal(schema.validate(-4.5e23).valid, true);
			assert.equal(schema.validate(undefined).valid, false);
		});

		it("should allow undefined values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ "optional" ];
			schema = new Schema(t);
			assert.equal(schema.validate(42.2e42).valid, true);
			assert.equal(schema.validate(undefined).valid, true);
		});

	});

});
