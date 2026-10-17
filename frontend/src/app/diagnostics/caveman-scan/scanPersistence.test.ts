import { beforeEach, describe, expect, it, vi } from "vitest";
import { questionsBank } from "./questionsBank";
import { saveCompletedPortrait } from "./scanPersistence";

const responses = questionsBank.map((question) => {
  const option = question.options[0];
  return { ...option, science: option.science ?? null };
});

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("saveCompletedPortrait", () => {
  it("saves selected answers and reflection identities without a drive-based portrait", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "session-1", accessToken: "token-1" }), { status: 200 }))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await saveCompletedPortrait(responses, "account-1");

    const createBody = JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body));
    expect(createBody.scoring_version).toBe("selected-response-1");
    expect(createBody.report_version).toBe("answer-reflections-1");

    const completeBody = JSON.parse(String((fetchMock.mock.calls[1][1] as RequestInit).body));
    expect(completeBody.evidence.selectedOptionIds).toHaveLength(questionsBank.length);
    expect(completeBody.portrait.version).toBe("answer-reflections-1");
    expect(completeBody.portrait).not.toHaveProperty("primary");
    expect(completeBody.responses[0]).not.toHaveProperty("evidence");
  });
});
