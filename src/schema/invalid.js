module.exports = {
	OK: {
		code: 0,
		reason: "Validation passed"
	},
	INVALID: {
		code: 1,
		reason: "JSON format invalid"
	},
	UNKNOWN: {
		code: 100,
		reason: "Unknown/unspecified issue"
	},
	NULL_NOT_ALLOWED: {
		code: 101,
		reason: "Null value not allowed in %path%"
	},
	NOT_OPTIONAL: {
		code: 102,
		reason: "Value in %path% is not optional"
	},
	INVALID_TYPE: {
		code: 103,
		reason: "Expected type %expected%, found %actual% in %path%"
	},
	ARRAY_INVALID: {
		code: 200,
		reason: "Array value is invalid in %path%"
	},
	ARRAY_UNEXPECTED_TYPE: {
		code: 201,
		reason: "Array element %actual% does not match any accepted types, expected %expected% in %path%"
	},
	ARRAY_UNEXPECTED_VALUE: {
		code: 202,
		reason: "Array element %actual% is not accepted, either because it's null or undefined in %path%"
	},
	ARRAY_LENGTH_INVALID: {
		code: 203,
		reason: "Array length %actual% invalid, expected length %expected% in %path%"
	},
	ARRAY_LENGTH_OUT_OF_RANGE: {
		code: 204,
		reason: "Array length %actual% out of range, should be in interval %expected% in %path%"
	},
	OBJECT_INVALID: {
		code: 300,
		reason: "Object value is invalid in %path%"
	},
	OBJECT_UNEXPECTED_FIELD: {
		code: 301,
		reason: "Object has unexpected field %actual% in %path%"
	},
	BOOLEAN_INVALID: {
		code: 400,
		reason: "Boolean value is invalid in %path%"
	},
	NUMBER_INVALID: {
		code: 500,
		reason: "Number value is invalid in %path%"
	},
	NUMBER_OUT_OF_RANGE: {
		code: 501,
		reason: "Number value %actual% out of range, should be in interval %expected% in %path%"
	},
	NUMBER_WRONG_TYPE: {
		code: 502,
		reason: "Number type for %actual% is not valid, expected %expected% in %path%"
	},
	STRING_INVALID: {
		code: 600,
		reason: "String value is invalid in %path%"
	},
	STRING_UNEXPECTED_VALUE: {
		code: 601,
		reason: "String value %actual% is not valid, expected %expected% in %path%"
	},
	STRING_DOES_NOT_MATCH_REGEXP: {
		code: 602,
		reason: "String value does not match specified regexp %expected% in %path%"
	},
	STRING_LENGTH_INVALID: {
		code: 603,
		reason: "String length %actual% invalid, expected length %expected% in %path%"
	},
	STRING_LENGTH_OUT_OF_RANGE: {
		code: 604,
		reason: "String length %actual% out of range, should be in interval %expected% in %path%"
	}
};
