const assert = require("assert");

const templates = require("./test-schema.json");
const Schema = require("../src/schema/schema.js");
const SchemaError = require("../src/schema/schema_error.js");

const testUtil = require("./test_util.js");

const template = testUtil.getElementByValue(templates, "id", "/StringPrimitive"); 

describe("Schema String", () => {

	describe("constructor normal behavior", () => {

		it("should successfully create a root object", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.getId(), "/StringPrimitive");
			assert.equal(schema.getType(), "string");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), true);
		});

		it("should successfully create a branch object", () => {
			let schema;
			let t = { type: "string" };
			schema = new Schema(t, "/SomePath", "someKey");
			assert.equal(schema.getId(), "/SomePath/someKey");
			assert.equal(schema.getType(), "string");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

	});

	describe("validation function", () => {

		it("should validate string values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate("abcdef").valid, true);
			assert.equal(schema.validate("").valid, true);
			assert.equal(schema.validate("some longer string").valid, true);
			assert.equal(schema.validate("123456").valid, true);
		});

		it("should validate string values within length range", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { length: [ 3, 6 ] };
			schema = new Schema(t);
			assert.equal(schema.validate("123").valid, true);
			assert.equal(schema.validate("12").valid, false);
			assert.equal(schema.validate("1234").valid, true);
			assert.equal(schema.validate("123456").valid, true);
			assert.equal(schema.validate("123456789").valid, false);
		});

		it("should validate string values of specific length", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { length: 6 };
			schema = new Schema(t);
			assert.equal(schema.validate("123456").valid, true);
			assert.equal(schema.validate("123").valid, false);
			assert.equal(schema.validate("").valid, false);
			assert.equal(schema.validate("abcdef").valid, true);
			assert.equal(schema.validate("1234567").valid, false);
		});

		it("should validate string values based on regexp", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { regexp: "^[0-9a-f]*$" };
			schema = new Schema(t);
			assert.equal(schema.validate("").valid, true);
			assert.equal(schema.validate("12345").valid, true);
			assert.equal(schema.validate("abcdefg").valid, false);
			assert.equal(schema.validate("80aaff").valid, true);
			assert.equal(schema.validate("aa-33-99").valid, false);
		});

		it("should validate string values based on regexp and length", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { regexp: "^[0-9a-f]*$", length: 8 };
			schema = new Schema(t);
			assert.equal(schema.validate("").valid, false);
			assert.equal(schema.validate("12345678").valid, true);
			assert.equal(schema.validate("abcdeffg").valid, false);
			assert.equal(schema.validate("80aaff11").valid, true);
			assert.equal(schema.validate("aa-33-99").valid, false);
		});

		it("should not validate non-string values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate(43).valid, false);
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
			assert.equal(schema.validate("bla").valid, true);
			assert.equal(schema.validate(null).valid, false);
		});

		it("should allow null values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ "null" ];
			schema = new Schema(t);
			assert.equal(schema.validate("foo").valid, true);
			assert.equal(schema.validate(null).valid, true);
		});

		it("should not allow undefined values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ ];
			schema = new Schema(t);
			assert.equal(schema.validate("foobar").valid, true);
			assert.equal(schema.validate(undefined).valid, false);
		});

		it("should allow undefined values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.attributes = [ "optional" ];
			schema = new Schema(t);
			assert.equal(schema.validate("foo").valid, true);
			assert.equal(schema.validate(undefined).valid, true);
		});

	});

});
