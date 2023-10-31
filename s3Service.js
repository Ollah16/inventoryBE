const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

exports.handleS3Upload = async (req, res) => {
    const s3Client = new S3Client();
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `inventory/${req.originalname}`,
        Body: req.buffer,
    };
    try {
        await s3Client.send(new PutObjectCommand(param))
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

exports.handles3Delete = async (req, res) => {
    const s3Client = new S3Client();
    console.log(req.file)
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `inventory/${req.file}`,
    };
    try {
        await s3Client.send(new DeleteObjectCommand(param));
    } catch (error) {
        console.error('Error deleting file from S3:', error);
    }
};

