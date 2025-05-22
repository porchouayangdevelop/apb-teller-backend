import Ajv from 'ajv';
import addFormats from 'ajv-formats';


const ajv = new Ajv({ allErrors: true });
addFormats(ajv);


export const pdfFileSchema = {
  type: 'object',
  properties: {
    mimetype: {
      type: 'string',
      enum: ['application/pdf'],
    },
    filename: {
      type: 'string',
      pattern: '.*\\.pdf$'
    },
    size: {
      type: 'number',
      maximum: 10 * 1024 * 1024 // 10MB
    },
  },
  required: ['filename'],
}
export const validatePdfFile = ajv.compile(pdfFileSchema);

export function validateFile(file) {
  const validationObj = {
    mimetype: file.mimetype,
    filename: file.originalname,
    size: file.size ? file.file.byteLength : 0,
  }

  const valid = validatePdfFile(validationObj);

  if (!valid) {
    const errors = validatePdfFile.errors.map((err) => {
      if (err.keyword === 'enum' && err.params.allowedValues) {
        return `Invalid Mimetype : ${validationObj.mimetype}. Excepted :application/pdf`;
      }

      if (err.keyword === 'pattern') {
        return `Invalid filename : ${validationObj.filename}. Excepted : *.pdf`;
      }

      if (err.keyword === 'minimum') {
        return `File size is too small : ${validationObj.size}. Excepted : ${err.params.limit}`;
      }
      if (err.keyword === 'maximum') {
        return `File size is too large : ${validationObj.size}. Excepted : ${err.params.limit}`;
      }
      return `${err.instancePath.replace(/^\//, '')} ${err.message}`
    });

    return {
      valid: false,
      errors,
    }
  }

  return {
    valid: true,
  }

}

export async function isPdfContentValid(buffer) {
  // Simple PDF header check (PDF files start with %PDF-)
  if (buffer.length < 5) {
    return false;
  }
  
  const signature = buffer.slice(0, 5).toString();
  return signature === '%PDF-';
}