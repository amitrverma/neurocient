import {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

export function generateAudioSasUrl(
  blobName: string,
  expiryMinutes = 120 // 2 hours
) {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  if (!accountName || !accountKey || !containerName) {
    throw new Error("Azure audio storage configuration is missing");
  }

  const credential = new StorageSharedKeyCredential(accountName, accountKey);
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
