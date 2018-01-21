import * as wkhtmltopdf from "wkhtmltopdf";
import * as MemoryStream from 'memorystream';
import * as AWS from 'aws-sdk';
import * as  fs from 'fs-extra';
import * as  Buffer from 'buffer';
import {Response} from './response'

const pdfS3Bucket = `${process.env.pdfS3Bucket}-${process.env.ENV}`;
process.env['PATH'] = process.env['PATH'] + ':/tmp';

export const generatePdf = async (event, context, callback) => {
    await preparePdfBinary();

    const htmlUtf8 = new Buffer.Buffer('PGJvZHk+SGVsbG8gd29ybGQ8L2JvZHk+', 'base64').toString('utf8');

    try {
        convertToPdf(htmlUtf8, async function (pdf) {
            await saveFile(pdf);
            callback(null, new Response(200, {url: 'to do'}));
        });
    } catch (error) {
        console.log(error, error.stack);
        callback(null, new Response(500, {message: error}));
    }
};

const convertToPdf = function (htmlUtf8, callback) {
    const memStream = new MemoryStream();
    wkhtmltopdf(htmlUtf8, {}, function (code, signal) {
        callback(memStream.read());
    }).pipe(memStream);
};

async function saveFile(pdf: String) {
    const params = {
        Bucket: pdfS3Bucket,
        Key: new Date().getTime() + '-file.pdf',
        Body: pdf
    };
    return new AWS.S3().putObject(params).promise();
}

async function preparePdfBinary() {
    await fs.copySync('/var/task/wkhtmltopdf', '/tmp/wkhtmltopdf');
    await fs.chmodSync('/tmp/wkhtmltopdf', 0o777)
}