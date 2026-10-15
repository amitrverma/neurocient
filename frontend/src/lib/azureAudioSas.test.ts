import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { credentialConstructor, generateSas, parsePermissions } = vi.hoisted(() => ({
  credentialConstructor: vi.fn(function MockCredential() {}),
  generateSas: vi.fn(() => ({ toString: () => "signed-query" })),
  parsePermissions: vi.fn(() => "read-permission"),
}));

vi.mock("@azure/storage-blob", () => ({
  BlobSASPermissions: { parse: parsePermissions },
  StorageSharedKeyCredential: credentialConstructor,
  generateBlobSASQueryParameters: generateSas,
}));

describe("Azure audio SAS configuration", () => {
  const originalAccountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  const originalAccountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
  const originalContainerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

  beforeEach(() => {
    delete process.env.AZURE_STORAGE_ACCOUNT_NAME;
    delete process.env.AZURE_STORAGE_ACCOUNT_KEY;
    delete process.env.AZURE_STORAGE_CONTAINER_NAME;
    credentialConstructor.mockClear();
    generateSas.mockClear();
    parsePermissions.mockClear();
    vi.resetModules();
  });

  afterEach(() => {
    restoreEnv("AZURE_STORAGE_ACCOUNT_NAME", originalAccountName);
    restoreEnv("AZURE_STORAGE_ACCOUNT_KEY", originalAccountKey);
    restoreEnv("AZURE_STORAGE_CONTAINER_NAME", originalContainerName);
  });

  it("can be imported without constructing credentials", async () => {
    await import("./azureAudioSas");

    expect(credentialConstructor).not.toHaveBeenCalled();
  });

  it("reports missing runtime configuration before attempting to sign", async () => {
    const { generateAudioSasUrl } = await import("./azureAudioSas");

    expect(() => generateAudioSasUrl("article.mp3")).toThrow(
      "Azure audio storage configuration is missing",
    );
    expect(credentialConstructor).not.toHaveBeenCalled();
  });

  it("signs the requested blob when runtime configuration is present", async () => {
    process.env.AZURE_STORAGE_ACCOUNT_NAME = "audioaccount";
    process.env.AZURE_STORAGE_ACCOUNT_KEY = "test-key";
    process.env.AZURE_STORAGE_CONTAINER_NAME = "audio";
    const { generateAudioSasUrl } = await import("./azureAudioSas");

    const url = generateAudioSasUrl("article.mp3");

    expect(credentialConstructor).toHaveBeenCalledWith("audioaccount", "test-key");
    expect(generateSas).toHaveBeenCalledWith(
      expect.objectContaining({
        containerName: "audio",
        blobName: "article.mp3",
        permissions: "read-permission",
      }),
      expect.anything(),
    );
    expect(url).toBe(
      "https://audioaccount.blob.core.windows.net/audio/article.mp3?signed-query",
    );
  });
});

function restoreEnv(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
