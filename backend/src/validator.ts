import { Validator as JsonValidator, Schema } from 'jsonschema';

class Validator {
  validator: JsonValidator;
  
  constructor() {
    this.validator = new JsonValidator();

    const schema = {
      id: '/Article',
      type: 'object',
      properties: {
        id: { type: 'string', readOnly: true },
        title: { type: 'string' },
        content: { type: 'string' },
        createdAt: { type: 'number', readOnly: true },
        updatedAt: { type: 'number', readOnly: true },
      },
      required: ['title', 'content'],
      additionalProperties: false,
    };
    
    this.validator.addSchema(schema, schema.id);
  }

  async validate(object, type){
		let schema = this.validator.schemas[type];

    var validation = this.validator.validate(object, schema);
    if (validation.errors.length > 0) {
      console.log(validation);
      throw validation.errors;
    }
	}
}

export default Validator;
