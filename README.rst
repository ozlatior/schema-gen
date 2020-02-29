Schema Gen - JSON Schema Validator and Code Generator for nodejs
****************************************************************

Schema Gen is a schema validator for nodejs. The idea behind it is to have a
validator that is fully compatible with json-schema but implements some new
features, including code generation.

It's also written using latest EcmaScript standards.


Usage
=====

Simply require the package. This will give access to the Schema class::

    const Schema = require("./path/to/index.js");
    //or
    const Schema = require("schema-gen");

Eeach schema object must be initialized with a JSON schema. The JSON schema
describes the values to be validated by the JSON schema validator. For instance::

    const s = {
        id: "/Test",
        type: "boolean"
    };

    const schema = new Schema(s);

After the object is constructed, it can be used to validate data::

    let r;

    r = schema.validate(true).valid;
    console.log(r); // true

    r = schema.validate(1).valid;
    console.log(r); // false

The validation function returns an object containing information about the validation. The object contains
the following fields:

* `valid`: boolean, `true` if validation passed, `false` otherwise
* `code`: number, numerical error code, `0` if validation passed, non-zero otherwise
* `reason`: string, string explanation for the validation success or failure

See a list of all codes and reasons in `src/schema/invalid.js`.


Schema definition
=================

There are examples in `test/test-schema.json`.

The properties of a JSON Schema definition are:

* `id`: string - the id of the schema definition
* `type`: string - schema data type; valid values are `boolean`, `number`, `string`, `array` and `object`
* `valid`: object, optional - extra validation rules to check value against (type-specific, see below)
* `attributes`: array, optional - set of extra attributes, valid values are `null`, `optional` and `partial`
  (see below)
* `properties`: object - for `type: 'object'`, an object containing the allowed fields and their respective
  schemas (see below)
* `items`: object or array - for `type: 'array'`, an object or array of objects containing the JSON schema
  for elements allowed in this array (see below)
* `required`: array, optional - for `type: 'object'`, list of required fields in this object; if missing,
  all fields are required unless individually specified (see below)

Examples::

    {
        "id": "/EmptyObject",
        "type": "object",
        "properties": {}
    }

    {
        "id": "/NumberPrimitive",
        "type": "number",
        "valid": {
            "range": [ 0, 10 ]
        },
        "attributes": [ "null" ]
    }

    {
        "id": "/StringPrimitive",
        "type": "string",
        "valid": {
            "length": 20,
            "regexp": "^[0-9]+$"
        },
        "attributes": [ "null" ]
    }

The `id` and `optional` attribute can be specified in the constructor arguments as well, alongside a value
for `key` which is appended to the `id`. See more in the `Schema Class` section of this document.


Validation of boolean values
----------------------------

Boolean values are the simplest. Currently there is no `valid` property available for booleans. The validator
only validates the values `true` and `false` as boolean. Truely or falsely values such as `1`, `null`, `undefined`
do not pass the validation.

Available fields for `valid`: none.

Available attributes: `null`, `optional`.

Example::

    var schema = new Schema({
        id: "/BooleanPrimitive",
        type: "boolean"
    });

    console.log(schema.validate(true).valid);       // true
    console.log(schema.validate(false).valid);      // true
    console.log(schema.validate(1).valid);          // false
    console.log(schema.validate("true").valid);     // false
    console.log(schema.validate(undefined).valid);  // false
    console.log(schema.validate(null).valid);       // false


Validation of number values
---------------------------

The validator provides a set of features for validating numbers. By default, any JSON number such as `0`, `-1`,
`1e12` would be validated, but more restrictions can be defined using the `valid` field. Just like the `valid`
field itself, all values are optional.

Available fields for `valid`:

* `range`: array - provides a range for valid number values; general form for this array is
  `[<low>, <high>, <strictLow>, <strictHigh>]`; only the first two arguments are required and represent the
  min and max values for the validated number; the other two terms control wether the interval is strict or
  not for each side of the interval, for example:
  - `[1, 3]` or `[1, 3, false, false]` validates values 1, 2 and 3 (and everything in between)
  - `[1, 3, true, true]` does not validate 1 and 3 but validates everything in between (`1.00...0001`, ...)
* `type`: string - specific number type; only the value `integer` is valid and tells the validator to only
  validate integer numbers

Example::
    
    var schema = new Schema({
        "id": "/NumberPrimitive",
        "type": "number",
        "valid": {
            "range": [ 0, 2, false, true ],
            "type": "integer"
        }
    });
    
    console.log(schema.validate(0).valid);      // true, because the interval is not strict to the left
    console.log(schema.validate(0.5).valid);    // false, because only integers are allowed
    console.log(schema.validate(2).valid);      // false, because the interval is strict to the right

Available attributes: `null`, `optional`.


Validation of string values
---------------------------

The validator provides a set of features for validating strings. By default, any JSON string such as `"foobar"`
or `""` would be validated, but more restrictions can be defined using the `valid` field. Just like the `valid`
field itself, all values are optional.

Available fields for `valid`:

* `length`: array or number - provides the length(s) considered valid for the string:
  - `<length>`: the string must be exactly `length` characters long
  - `[<min>, <max>]` (two elements): the string must be between `min` and `max` characters long (inclusively)
  - `[<v1>, <v2>, <v3>]` (more than two elements): the string length must be any of the values specified in the
    array; if you want only two elements in the array, use third value of `-1` or `null` to use this feature;
    (this feature is currently not implemented)
* `regexp`: string - regular expresion to match the string against; the string must match this regular expression
  to be valid
* `equals`: string - the string must be exactly the same as the validation string

Example::

    var schema = new Schema({
        "id": "/SessionId",
        "type": "string",
        "valid": {
            "length": 16,
            "regexp": "^[0-9a-f]+$"
        }
    });

    console.log(schema.validate("11112222aaaabbbb").valid);     // true, because it matches both conditions
    console.log(schema.validate("11112222aaaabbbg").valid);     // false, because it does not match regexp
    console.log(schema.validate("a0a0a0a0").valid);             // false, because it's not 16 characters

Available attributes: `null`, `optional`.


Validation of array values
--------------------------

The validator provides a set of features for validating arrays. By default, any JSON array such as `"foobar"`
or `[]` would be validated, but more restrictions can be defined using the `valid` field. Just like the `valid`
field itself, all values are optional. Additionally, the schema for the array items has to be specified in the
`items` field.

Available fields for `valid`:

* `length`: array or number - provides the length(s) considered valid for the array
  - `<length>`: the array must be exactly `length` characters long
  - `[<min>, <max>]` (two elements): the array must be between `min` and `max` characters long (inclusively)
  - `[<v1>, <v2>, <v3>]` (more than two elements): the array length must be any of the values specified in the
    array; if you want only two elements in the array, use third value of `-1` or `null` to use this feature;
    (this feature is currently not implemented)

The `items` field can be either a schema definition or an array of schema definitions for the allowed values
in the array.

Example (this array has to be between one and three elements, and can contain numbers from 0 to 10, strings
of length 1 to 6, boolean or `null` values (`null` values will be validated by the first item, the `null`
attribute does not have to be specified for all items)::

    var schema = new Schema({
        "id": "/MixedArray",
        "type": "array",
        "items": [
            {
                "type": "number",
                "valid": {
                    "range": [ 0, 10 ]
                },
                "attributes": [ "null" ]
            },
            {
                "type": "string",
                "valid": {
                    "length": [ 1, 6 ]
                }
            },
            {
                "type": "boolean"
            }
        ],
        "valid": {
            "length": [ 1, 3 ]
        }
    });
        
    console.log(schema.validate([1, "b", true]).valid);        // true
    console.log(schema.validate([1, "a", null]).valid);        // true
    console.log(schema.validate([1, "", true]).valid);         // false, because min string length is 1
    console.log(schema.validate([11, "a", true]).valid);       // false, because max number value is 10


Available attributes: `null`, `optional`.


Validation of object values
---------------------------

Objects, just like arrays, are special in the way they are nested and can contain schema of their own. Fields
for object schema are defined in the `properties` object. The keys in the properties object are the same as the
keys in the validated object. There is no `valid` field for objects, but fields are validated recursively. An
object is considered valid if the object itself as well as all the properties are valid.

Default conditions for option validation are

* all properties (fields) defined in the schema are present in object and they are also valid
* all properties (fields) present in the object are defined in the schema

This means, by default, all schema properties are required and the object cannot have extra fields. However,
it is possible to modify this behavior:

* the `partial` attribute (in the `attributes` array) tells the validator to accept objects with extra fields
* the `required` field in the schema tells the validator to only require the properties specified
* the `optional` attribute in the property schema tells the validator to consider the field as optional

In this example, all properties are required by default. All properties of the `someObject` field are required
as well, since nothing is optional::

    var schema = new Schema({
        id: "/ObjectExample",
        type: "object",
        properties: {
            someString: {
                type: "string",
                valid: {
                    length: 4
                }
            },
            someNumber: {
                type: "number",
                valid: {
                    range: [ 1, 10 ]
                }
            },
            someObject: {
                tyoe: "object",
                properties: {
                    a: {
                        type: "number"
                    },
                    b: {
                        type: "number"
                    }
                }
            }
        }
    });

    // this will be true, since all properties are there and they are valid
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1, b: 3 }}).valid);
    // this will be false, since the field b of someObject is of wrong type
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1, b: "3" }}).valid);
    
    // this will be false, since the field b of someObject is missing
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1 }}).valid);
    // this will be false, since the field someString of the root object is missing
    console.log(schema.validate({ someNumber: 3, someObject: { a: 1, b: 3 }}).valid);
    // this will be false, since the someObject contains extra field c
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1, b: 3, c: 12 }}).valid);

If we want toa allow the last three validations to pass, we have to update the schema. To allow the extra
property `c` in `someObject`, we have to give `someObject` the `partial` attribute.

We can give property `b` in someObject the attribute `optional` to make it optional or we can specify `a` as
the only required property (field). Let's go with the first option here.

We can give property `someString` the attribute `optional` as well or we could make the other properties the
only required fields in the `required` array. Let's go with the second option here.

The schema that would allow all these would look like::

    var schema = new Schema({
        id: "/ObjectExample",
        type: "object",
        properties: {
            someString: {
                type: "string",
                valid: {
                    length: 4
                }
            },
            someNumber: {
                type: "number",
                valid: {
                    range: [ 1, 10 ]
                }
            },
            someObject: {
                tyoe: "object",
                properties: {
                    a: {
                        type: "number"
                    },
                    b: {
                        type: "number",
                        attributes: [ "optional" ]
                    }
                },
                attributes: [ "partial" ]
            }
        },
        required: [ "someNumber", "someObject" ]
    });

    // this will be true, since all properties are there and they are valid
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1, b: 3 }}).valid);
    // this will be false, since the field b of someObject is of wrong type
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1, b: "3" }}).valid);
    
    // this will be true, even if the field b of someObject is missing, because it's marked as optional
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1 }}).valid);
    // this will be true, even if the field someString of the root object is missing, because only the other two are required
    console.log(schema.validate({ someNumber: 3, someObject: { a: 1, b: 3 }}).valid);
    // this will be true, even if the someObject contains extra field c, because someObject is a partial schema
    console.log(schema.validate({ someString: "abcd", someNumber: 3, someObject: { a: 1, b: 3, c: 12 }}).valid);

Available attributes: `null`, `optional`, `partial`.


Attributes
----------

The `attributes` array defines extra conditions for validation. The possible values are `null`, `optional` and
`partial`. The first two work on any type while the `partial` attribute only works on objects.

*Allow null:* adding the `null` value to the `attributes` array tells the validator to allow null values. This
works for any type and also works for nested objects.

*Optional* adding the `optional` value to the `attributes` array tells the validator that this value could be
optional (undefined).

*Partial* the `partial` value in the `attributes` array only works on objects and tells the validator the schema
is merely a partial representation of the object, the object could contain extra properties.


Ids and paths
-------------

The schema object can specify an `id` field, or it can be specified as a constructor argument (see below). The
constructor argument takes precedence over the value specified in the obect. For nested objects, ids will follow
the object path and use the specified `id` as root. For instance::

    {
        id: "/SomeSchema",      // id: /SomeSchema
        type: "object",
        properties: {
            numberField: { type: "number" },    // id: /SomeSchema/numberField
            objectField: {                      // id: /SomeSchema/objectField
                type: "object",
                properties: {
                    stringField: { type: "string" },    // id: /SomeSchema/objectField/stringField
                }
            },
            arrayField: {       // id: /SomeSchema/arrayField
                tyoe: "array",
                items: [
                    { type: "number" },     // id: /SomeSchema/arrayField/items/0
                    { type: "string" },     // id: /SomeSchema/arrayField/items/1
                    { type: "boolean" }     // id: /SomeSchema/arrayField/items/2
                ]
            }
        }
    }

Ids will be specified in error messages and validation messages, so we know exactly which value was incorrect
in a nested object.


Class Structure
===============

Including the package gives access to the Schema class, but also all the other classes in the object.

* `Schema`: the main class returned by `require`, contains the validation function function and the assert function,
 as long as a set of getters
* `Schema.SchemaError`: usually thrown when there is an issue with a schema definition
* `Schema.SchemaMessageError`: usually thrown by the assert function when a message does not pass validation

See the last section for the other classes.


The Schema Class
----------------

`Schema` objects are initilized with the complete schema of the value that we want to validate and then used to
validate such values. The `Schema` constructor::

    new Schema(schema, id, key, optional);

* `schema`: object - the schema definition
* `id`: string, optional - override the id defined in schema (or specify one if missing)
* `key`: string, optional - override the path for this schema
* `optional`: boolean, optional - override the `optional` attribute for this schema

Only the `schema` argument is mandatory. Besides the object-specific fields, the schema object can specify an
`id` field and an `optional` attribute in the `attributes` array. While the `id` is optional as an argument of
the constructor, it has to be specified in at least one of the two places. The `id` specified as argument takes
precedence over the `id` specified in the schema object.

The `key` argument can be used to specify a schema deep down a nested tree. The `key` will be appended to the
`id`, as if it was a path. For example if the `key` is set to `objectField/nestedObjectField`, this will be
appended to the `id`, so it becomes `<InitialId>/objectField/nestedObjectField`. Use a value of `null` to skip
this argument.

The `optional` argument, if specified, overrides the `optional` value in the `attributes` array. Thus, it can be
used to force an element without the `optional` attribute to be optional or the other way around.

.getId()
~~~~~~~~

`.getId()` can be used to retrieve the id of a schema (as specified in the schema object or as an argument). It
returns a string value::

    var schema = new Schema(schemaObject, "/ObjectSchema", "nested/path");
    console.log(schema.getId());    // prints /ObjectSchema/nested/path

.getType()
~~~~~~~~~~

`.getType()` can be used to return the type of the schema, as specified in the schema definition passed to the
constructor. It returns the type as one of the strings `"boolean"`, `"number"`, `"string"`, `"array"` or
`"object"`. For example::

    var schema = new Schema({ id: "/FooBar", type: "string" });
    console.log(schema.getType());  // prints string

.isOptional()
~~~~~~~~~~~~~

`.isOptional()` can be used to check if the value specified by the schema definition is optional or not. It
returns a boolean value of `true` if optional, `false` otherwise::

    var schema = new Schema({ id: "/FooBar", "type": "string", attributes: [ "optional" ] } );
    console.log(schema.isOptional());   // prints true

.allowNull()
~~~~~~~~~~~~

`.allowNull()` can be used to check if the value specified by the schema definition can be null not. It
returns a boolean value of `true` if optional, `false` otherwise::

    var schema = new Schema({ id: "/FooBar", "type": "string", attributes: [ "null" ] } );
    console.log(schema.allowNull());   // prints true

.validate(value)
~~~~~~~~~~~~~~~~

`validate(value)` checks if a value is valid according to the schema definition or not. It returns an object
containing the validation result.

* `value`: any type - the value to validate

Returned object contains fields:

* `valid`: boonlean - `true` if validation passes, false otherwise
* `code`: number - validation code, `0` if valid, non-zero value otherwise (see `src/schema/invalid.js` for codes)
* `reason`: string - error message (reason for validation failure) (see `src/schema/invalid.js` for messages)

assertValid(value)
~~~~~~~~~~~~~~~~~~

`assertValid(value)` runs an assertion that the value passed is valid according to schema definition. It returns
`true` if assertion passes or it throws a `SchemaMessageError` if it fails.


Internal Structure of Schema
----------------------------

The Schema class constructor object contains references to all other classes used in the package, so you can use
their constructors as well. Normal use cases do not require this, but maybe you need the classes for instance comparison
for testing purposes, for example. Just for good measure, they are listed here.

Entities are containers for schema definitions. A `Schema` object contains a `SchemaEntity` object for the type
it validates. Entities can be nested as well to validate objects and arrays.

* `Schema.SchemaEntity`: schema entity container, the base class for all schema types
* `Schema.SchemaBoolean`: schema entity for boolean types, extended from `SchemaEntity`
* `Schema.SchemaNumber`: schema entity for number types, extended from `SchemaEntity`
* `Schema.SchemaString`: schema entity for string types, extended from `SchemaEntity`
* `Schema.SchemaArray`: schema entity for array types, extended from `SchemaEntity`
* `Schema.SchemaObject`: schema entity for object types, extended from `SchemaEntity`

And the two error classes:

* `Schema.SchemaError`: usually thrown when there is an issue with a schema definition
* `Schema.SchemaMessageError`: usually thrown by the assert function when a message does not pass validation

For instance, the structure of a schema for validating objects would be::

    (Schema) schema: {
        ...
        (SchemaObject) entity: {
            ...
            properties: {
                (SchemaNumber) numberField: { ... },
                (SchemaString) stringField: { ... }
                ...
            }
        }
    }

While for an array accepting both numbers and strings, the structure would be::

    (Schema) schema: {
        ...
        (SchemaArray) entity: {
            ...
            items: [
                (SchemaNumber) { ... },
                (SchemaString) { ... }
            ]
        }
    }


Error classes
=============

There are two error classes. Instances of these classes are thrown as errors by the Schema Validator.


SchemaError
-----------

An instance of `SchemaError` is thrown in case there is a problem with the schema object itself when passed
as argument to the constructor (or with any of the other arguments) or sometimes at runtime (the problem was
not detected at instantiation, but it is detected later when validating a value).

The `SchemaError` class is not different from the `Error` class it extends from, except for the name which is
`SchemaError`.


SchemaMessageError
------------------

An instance of `SchemaMessageError` is thrown when a validation assertion fails. The fields of this class are:

* `name`: string, `SchemaMessageError`,
* `code`: number, error code as described in `src/schema/invalid.js`
* `short`: string, a short description of the error condition (keys in `src/schema/invalid.js`)
* `reason`: string, the reason for the error condition as described in `src/schema/invalid.js`

