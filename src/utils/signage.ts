import * as AWS from 'aws-sdk';

  export async function getPresignedAvatarUrl(key: string): Promise<string> {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        signatureVersion: 'v4',
        region: process.env.AWS_REGION, 
    
      });
    try {
      const presignedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_AVATAR_BUCKET_NAME,
        Key: key,
        Expires: 604800, 
      });
      //console.log("PRESIGNED: ", presignedUrl)
      return presignedUrl;
    } catch (error) {
      console.error('Detailed error generating presigned URL:', error);
      throw new Error(`Error generating presigned URL: ${error.message}`);
    }
  }

  export async function getPresignedThumbUrl(key: string): Promise<string> {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        signatureVersion: 'v4',
        region: process.env.AWS_REGION, 
    
      });
    try {
      const presignedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_THUMB_BUCKET_NAME,
        Key: key,
        Expires: 3600, 
      });
      //console.log("PRESIGNED: ", presignedUrl)
      return presignedUrl;
    } catch (error) {
      console.error('Detailed error generating presigned URL:', error);
      throw new Error(`Error generating presigned URL: ${error.message}`);
    }
  }
  
  export async function getPresignedFullUrl(key: string): Promise<string> {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        signatureVersion: 'v4',
        region: process.env.AWS_REGION, 
    
      });
    try {
      const presignedUrl = s3.getSignedUrl('getObject', {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Expires: 3600, 
      });
      //console.log("PRESIGNED: ", presignedUrl)
      return presignedUrl;
    } catch (error) {
      console.error('Detailed error generating presigned URL:', error);
      throw new Error(`Error generating presigned URL: ${error.message}`);
    }
  }
  