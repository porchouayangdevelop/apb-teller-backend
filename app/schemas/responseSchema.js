
export const responseSchema = {
  200:{
    type: 'object',
    properties: {
      // statusCode: { type: 'number' },
      message: { type: 'string' },
      file: { type: 'string' },
      id: { type:'string' },
    },
  },
  400:{
    type: 'object',
    properties: {
     error: { type:'string' },
     details:{
      type:'array',
      items:{
        type:'string',
      }
     }
    },
  },
  415:{
    type: 'object',
    properties:{
      error:{ type:'string' },
    }
  },
  500:{
    type: 'object',
    properties:{
      error:{ type:'string' },
    }
  }
}