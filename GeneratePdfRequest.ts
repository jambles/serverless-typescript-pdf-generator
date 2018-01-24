export class GeneratePdfRequest {

    public fromUrl: boolean;
    public urlOptions: UrlOptions;

}

class UrlOptions{
    public method: string = 'GET';
    public protocol: string = 'http:';
    public host: string;
    public port: number = 80;
    public path: string = "/";
}