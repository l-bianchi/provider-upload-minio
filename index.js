const minioClient = require("minio");

module.exports = {
  init(providerOptions) {
    const minio = new minioClient.Client({
      endPoint: providerOptions.endpoint,
      port: parseInt(providerOptions.port),
      useSSL: false,
      accessKey: providerOptions.accessKey,
      secretKey: providerOptions.secretKey,
    });

    const getFileKey = (file) => {
      const path = file.path ? `${file.path}/` : "";
      return `${path}${file.hash}${file.ext}`;
    };

    return {
      async uploadStream(file, customParams = {}) {
        const fileKey = getFileKey(file);
        return await minio.putObject(
          providerOptions.bucketName,
          fileKey,
          file.stream
        );
      },
      async upload(file, customParams = {}) {
        const fileKey = getFileKey(file);
        return await minio.putObject(
          providerOptions.bucketName,
          fileKey,
          file.buffer
        );
      },
      async delete(file, customParams = {}) {
        const fileKey = getFileKey(file);
        return await minio.removeObject(providerOptions.bucketName, fileKey);
      },
      async isPrivate() {
        return true;
      },
      async getSignedUrl(file) {
        const fileKey = getFileKey(file);
        const signedUrl = await minio.presignedGetObject(
          providerOptions.bucketName,
          fileKey,
          24 * 60 * 60
        );
        return { url: signedUrl };
      },
    };
  },
};
