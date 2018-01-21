import * as wkhtmltopdf from "wkhtmltopdf";
import * as MemoryStream from 'memorystream';
import * as AWS from 'aws-sdk';
import * as  fs from 'fs-extra';
import * as  Buffer from 'buffer';

const pdfS3Bucket = `${process.env.pdfS3Bucket}-${process.env.ENV}`;
process.env['PATH'] = process.env['PATH'] + ':/tmp';

export const generatePdf = async (event, context, callback) => {
    await preparePdfBinary();

    const htmlUtf8 = new Buffer.Buffer('PGJvZHk+SGVsbG8gd29ybGQ8L2JvZHk+', 'base64').toString('utf8');

    convertToPdf(htmlUtf8, function (pdf) {
        const params = {
            Bucket: pdfS3Bucket,
            Key: new Date().getTime() + '-file.pdf',
            Body: pdf
        };
        new AWS.S3().putObject(params, function (err, data) {
            context.done(null, {pdf_base64: pdf.toString('base64')});
        })
    });
};

const convertToPdf = function (htmlUtf8, callback) {
    const memStream = new MemoryStream();
    wkhtmltopdf(htmlUtf8, {}, function (code, signal) {
        console.log('code', code)

        callback(memStream.read());
    }).pipe(memStream);
};

async function preparePdfBinary() {
    await fs.copySync('/var/task/wkhtmltopdf', '/tmp/wkhtmltopdf');
    await fs.chmodSync('/tmp/wkhtmltopdf', 0o777)
}