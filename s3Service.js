const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

exports.handleS3Upload = async (req, res) => {
    const s3Client = new S3Client();
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `inventory/${req.originalname}`,
        Body: req.buffer,
    };
    console.log(req)
    try {
        await s3Client.send(new PutObjectCommand(param))
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

