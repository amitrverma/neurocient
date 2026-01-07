import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME!;

const credential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

export function generateAudioSasUrl(
  blobName: string,
  expiryMinutes = 120 // 2 hours
) {
  const expiresOn = new Date(
    Date.now() + expiryMinutes * 60 * 1000
  );

  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
    },
    credential
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sas}`;
}
