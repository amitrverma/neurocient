import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";

import {
  NotificationProvider,
  useNotification,
} from "../src/app/components/NotificationProvider";

afterEach(cleanup);

function StructuredErrorTrigger() {
  const { notify } = useNotification();
  return (
    <button
      onClick={() =>
        notify({
          code: "internal_error",
          correlation_id: "123e4567-e89b-42d3-a456-426614174000",
        })
      }
    >
      Show error
    </button>
  );
}

describe("NotificationProvider", () => {
  it("renders structured failures as text instead of crashing React", () => {
    render(
      <NotificationProvider>
        <StructuredErrorTrigger />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Show error" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Something went wrong. Please try again. Reference: 123e4567.",
    );
  });
});
