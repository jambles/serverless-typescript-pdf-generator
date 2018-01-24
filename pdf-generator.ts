import * as wkhtmltopdf from "wkhtmltopdf";
import * as MemoryStream from 'memorystream';
import * as AWS from 'aws-sdk';
import * as  fs from 'fs-extra';
import {Response} from './response'
import * as http from 'http';
import {RequestOptions} from 'https';
import {GeneratePdfRequest} from './GeneratePdfRequest';

const pdfS3Bucket = `${process.env.pdfS3Bucket}-${process.env.ENV}`;
process.env['PATH'] = process.env['PATH'] + ':/tmp';

export const generatePdf = async (event, context, callback) => {
    try {
        const body: GeneratePdfRequest = JSON.parse(event.body);

        await preparePdfBinary();
        if (body.fromUrl) {
            const inputs = body.urlOptions;
            let options = buildHttpOptions(inputs.host, inputs.method, inputs.protocol, inputs.port, inputs.path);
            console.log('Executing request with options', options);
            const req = http.request(options, function (res) {
                let data = '';

                res.on('data', function (chunk) {
                    data += chunk;
                });

                res.on('end', function () {
                    convertToPdf(data, async function (pdf) {
                        await saveFile(pdf);
                        callback(null, new Response(200, {url: 'to do'}));
                    });
                });
            });

            req.on('error', function (e) {
                console.log('err', e);
                throw e;
            });

            req.end();
        }
    } catch (error) {
        console.log('err', error);
        callback(null, new Response(500, {message: error}));
    }
};

function buildHttpOptions(host: string, method: string = 'GET', protocol: string = 'http:', port: number = 80, path: string = "/"): RequestOptions {
    return {method: method, protocol: protocol, host: host, port: port, path: path};
}

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