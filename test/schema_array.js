const assert = require("assert");

const templates = require("./test-schema.json");
const Schema = require("../src/schema/schema.js");
const SchemaError = require("../src/schema/schema_error.js");

const testUtil = require("./test_util.js");

const template = testUtil.getElementByValue(templates, "id", "/MixedArray"); 

describe("Schema Array", () => {

	describe("constructor normal behavior", () => {

		it("should successfully create a root object", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			schema = new Schema(t);
			assert.equal(schema.getId(), "/MixedArray");
			assert.equal(schema.getType(), "array");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

		it("should successfully create a branch object", () => {
			let schema;
			let t = { type: "array", items: { type: "number" } };
			schema = new Schema(t, "/SomePath", "someKey");
			assert.equal(schema.getId(), "/SomePath/someKey");
			assert.equal(schema.getType(), "array");
			assert.equal(schema.isOptional(), false);
			assert.equal(schema.allowNull(), false);
		});

	});

	describe("validation function", () => {

		it("should validate array values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate([1]).valid, true);
			assert.equal(schema.validate([]).valid, true);
			assert.equal(schema.validate([1, 2, 3, 4, 5]).valid, true);
			assert.equal(schema.validate(["foo", "bar", 1, 2, false]).valid, true);
		});

		it("should validate array values within length range", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { length: [ 3, 6 ] };
			schema = new Schema(t);
			assert.equal(schema.validate([1,2,3]).valid, true);
			assert.equal(schema.validate([1,2]).valid, false);
			assert.equal(schema.validate([1,2,3,4]).valid, true);
			assert.equal(schema.validate([1,2,3,4,5,6]).valid, true);
			assert.equal(schema.validate([1,2,3,4,5,6,7,8,9]).valid, false);
		});

		it("should validate array values of specific length", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { length: 6 };
			schema = new Schema(t);
			assert.equal(schema.validate([1,2,3,4,5,6]).valid, true);
			assert.equal(schema.validate([1,2,3]).valid, false);
			assert.equal(schema.validate([]).valid, false);
			assert.equal(schema.validate(["a","b","c","d","e","f"]).valid, true);
			assert.equal(schema.validate([1,2,3,4,5,6,7]).valid, false);
		});

		it("should validate mixed array values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = {};
			schema = new Schema(t);
			assert.equal(schema.validate([]).valid, true);
			assert.equal(schema.validate([1,2,"3","4",null,true]).valid, true);
			assert.equal(schema.validate([1,2,[],"3"]).valid, false);
			assert.equal(schema.validate([null, null, null, null]).valid, true);
			assert.equal(schema.validate([true, false, true, false]).valid, true);
			assert.equal(schema.validate([true, false, {}]).valid, false);
		});

		it("should validate mxied array values and length", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			t.valid = { length: 4 };
			schema = new Schema(t);
			assert.equal(schema.validate([1,2,3]).valid, false);
			assert.equal(schema.validate([null, true, false, 1]).valid, true);
			assert.equal(schema.validate([null, true, false, {}]).valid, false);
			assert.equal(schema.validate([1,2,3,4]).valid, true);
			assert.equal(schema.validate(["1","2",3,4]).valid, true);
		});

		it("should not validate non-array values", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate(43).valid, false);
			assert.equal(schema.validate(true).valid, false);
			assert.equal(schema.validate("true").valid, false);
			assert.equal(schema.validate({ a: 42 }).valid, false);
		});

		it("should not allow null values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.items[0].attributes = [];
			schema = new Schema(t);
			assert.equal(schema.validate(["bla"]).valid, true);
			assert.equal(schema.validate([null]).valid, false);
		});

		it("should allow null values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			schema = new Schema(t);
			assert.equal(schema.validate(["foo"]).valid, true);
			assert.equal(schema.validate([null]).valid, true);
		});

		it("should not allow undefined values if not specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.items[0].attributes = [ ];
			schema = new Schema(t);
			assert.equal(schema.validate(["foobar"]).valid, true);
			assert.equal(schema.validate([undefined]).valid, false);
		});

		it("should allow undefined values if specified", () => {
			let schema;
			let t = JSON.parse(JSON.stringify(template));
			delete t.valid;
			t.items[0].attributes = [ "optional" ];
			schema = new Schema(t);
			assert.equal(schema.validate(["foo"]).valid, true);
			assert.equal(schema.validate([undefined]).valid, true);
		});

		it("should validate matrices", () => {
			let schema;
			let t = {
				id: "/Matrix",
				type: "array",
				items: {
					type: "array",
					items: {
						type: "number"
					}
				}
			};
			schema = new Schema(t);
			assert.equal(schema.validate([1, 2, 3]).valid, false);
			assert.equal(schema.validate([ [1, 2, 3], [4, 5, 6] ]).valid, true);
		});

	});

});
