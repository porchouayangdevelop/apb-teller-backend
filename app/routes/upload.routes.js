
import util from 'util';
import path from "path";
import { PdfReader } from 'pdfreader';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import EventEmitter from "events";
import fastify from 'fastify';
import { responseSchema } from '../schemas/responseSchema.js';
import { validateFile,isPdfContentValid } from '../utils/validation.js';

const notificationEmitter = new EventEmitter();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const extractTextFromPDF = async (pdfFilePath) => {
  return new Promise((resolve, reject) => {
    const reader = new PdfReader();
    let text = '';

    reader.parseFileItems(pdfFilePath, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(text);
      } else if (item.text) {
        text += item.text + ' ';
      }
    });
  });
};

const processAndNotify = async (pdfFilePath, filename) => {
  try {
    notificationEmitter.emit("pdf-processed", {
      status: "started",
      filename,
      timestamp: new Date().toISOString(),
      message: `Started processing PDF: ${filename}`,
    });

    const text = await extractTextFromPDF(pdfFilePath);

    notificationEmitter.emit("pdf-processed", {
      status: "processing",
      filename,
      timestamp: new Date().toISOString(),
      preview: text.substring(0, 100) + '...',
      message: `Extracted ${text.length} characters from ${filename}`,
    });


    await new Promise((resolve) => setTimeout(resolve, 5000));

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const analysis = {
      wordCount,
      characterCount: text.length,
      averageWordLength: text.length / wordCount,
    };

    notificationEmitter.emit("pdf-processed", {
      status: "completed",
      filename,
      timestamp: new Date().toISOString(),
      analysis,
      message: `Processing completed for ${filename}`,
    });

    const textFilePath = path.join(uploadDir, `${filename}.txt`);
    await util.promisify(fs.writeFile)(textFilePath, text);

    fastify.log.info(`Text file saved: ${textFilePath}`);
    fastify.log.info(`Analysis: ${util.inspect(analysis)}`);
    fastify.log.info(`PDF processed : ${filename}`);


  } catch (error) {
    console.error('Error processing PDF:', error);

    notificationEmitter.emit("pdf-processed", {
      status: "error",
      filename,
      timestamp: new Date().toISOString(),
      message: `Processing failed for ${filename}: ${error.message}`,
    });
  }
};

export default async function uploadRoutes(fastify, opts) {
  fastify.post('/file', {
    schema: {
      tags: ['Upload'],
      summary: "Upload a file",
      description: "Upload a file",
      consumes: ['multipart/form-data'],
      response:responseSchema
    },
  },
    async (req, reply) => {
      try {
        const contentType = req.headers['content-type'] || '';
        if (!contentType || !contentType.includes('multipart/form-data')) {
          return reply.status(400).send({ error: 'Invalid content type. Only multipart/form-data is allowed.' });
        }

        const data = await req.file();
        if (!data) {
          return reply.status(400).send({ error: 'No file uploaded' });
        }

        const validation = validateFile(data);
        if (!validation.valid) {
          return reply.status(400).send({ error: "Invalid file" ,
            details: validation.errors,
          });
        }

        const fileBuffer = await data.toBuffer();
        
        if(!(await  isPdfContentValid(fileBuffer))) {
          return reply.status(400).send({ error: "Invalid file content. Only PDF files are allowed.",
            details: "Invalid file content. Only PDF files are allowed.",
           });
        }

        const secureFilename = `${Date.now()}_${data.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const pdfFilePath = path.join(uploadDir, secureFilename);
        await util.promisify(fs.writeFile)(pdfFilePath, fileBuffer);

        processAndNotify(pdfFilePath, secureFilename);
        fastify.log.info(`File uploaded: ${secureFilename}`);

        return reply.status(200).send({
          message: 'File uploaded successfully',
          filename: secureFilename,
          id: Date.now().toString(),
        });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
      }
    }
  );

  fastify.get('notifications',{websocket:true},(socket,req)=>{
    fastify.log.info('Client connected to notifications');

    const listener = (event)=>{
      socket.send(JSON.stringify(event));
    }

    notificationEmitter.on('pdf-processed',listener);

    socket.on('close',()=>{
      fastify.log.info('Client disconnected from notifications');
      notificationEmitter.removeListener('pdf-processed',listener);
    });
  });

}