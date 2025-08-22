import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import Index from "../pages/Index";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock date-fns format function
vi.mock("date-fns", () => ({
  format: vi.fn((date: Date, formatStr: string) => {
    if (formatStr === "PPpp") return date.toLocaleString();
    if (formatStr === "PPp") return date.toLocaleString();
    if (formatStr === "MMM dd, HH:mm") return date.toLocaleDateString();
    return date.toString();
  }),
}));

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
});

describe("Scheduled Post Manager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("renders the main heading", () => {
    render(<Index />);
    expect(screen.getByText("Scheduled Post Manager")).toBeInTheDocument();
  });

  it("renders both main sections", () => {
    render(<Index />);
    expect(screen.getByText("Create Scheduled Post")).toBeInTheDocument();
    expect(screen.getByText("Published Timeline")).toBeInTheDocument();
  });

  it("shows empty state in timeline", () => {
    render(<Index />);
    expect(screen.getByText("No posts published yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Scheduled posts will appear here when their time arrives"
      )
    ).toBeInTheDocument();
  });

  it("disables submit button when form is incomplete", () => {
    render(<Index />);
    const submitButton = screen.getByRole("button", { name: /schedule post/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when form is complete", async () => {
    const user = userEvent.setup();
    render(<Index />);

    const textArea = screen.getByPlaceholderText(
      "What would you like to share?"
    );
    const dateTimeInput = screen.getByLabelText("Schedule for");
    const submitButton = screen.getByRole("button", { name: /schedule post/i });

    await user.type(textArea, "Test post content");

    // Set a future datetime
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);
    const dateTimeValue = futureDate.toISOString().slice(0, 16);

    await user.type(dateTimeInput, dateTimeValue);

    expect(submitButton).not.toBeDisabled();
  });

  it("shows character count", async () => {
    const user = userEvent.setup();
    render(<Index />);

    const textArea = screen.getByPlaceholderText(
      "What would you like to share?"
    );
    await user.type(textArea, "Hello");

    expect(screen.getByText("5/280 characters")).toBeInTheDocument();
  });

  it("prevents scheduling posts in the past", () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { container } = render(<Index />);

    const textArea = screen.getByPlaceholderText(
      "What would you like to share?"
    );
    const dateTimeInput = screen.getByLabelText("Schedule for");

    // Fill in the form with valid content
    fireEvent.change(textArea, { target: { value: "Test post" } });

    // Set a past datetime
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1);
    const dateTimeValue = pastDate.toISOString().slice(0, 16);
    fireEvent.change(dateTimeInput, { target: { value: dateTimeValue } });

    // Submit the form directly by finding it in the container
    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    expect(alertSpy).toHaveBeenCalledWith(
      "Please select a future date and time"
    );

    alertSpy.mockRestore();
  });

  it("loads posts from localStorage on mount", () => {
    const mockPosts = JSON.stringify([
      {
        id: "1",
        content: "Saved post",
        scheduledTime: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isPublished: false,
      },
    ]);

    localStorageMock.getItem.mockReturnValue(mockPosts);

    render(<Index />);

    expect(localStorageMock.getItem).toHaveBeenCalledWith("scheduledPosts");
  });

  it("shows pending posts count when there are scheduled posts", () => {
    const mockPosts = JSON.stringify([
      {
        id: "1",
        content: "Pending post 1",
        scheduledTime: new Date(Date.now() + 60000).toISOString(), // 1 minute in future
        createdAt: new Date().toISOString(),
        isPublished: false,
      },
      {
        id: "2",
        content: "Pending post 2",
        scheduledTime: new Date(Date.now() + 120000).toISOString(), // 2 minutes in future
        createdAt: new Date().toISOString(),
        isPublished: false,
      },
    ]);

    localStorageMock.getItem.mockReturnValue(mockPosts);

    render(<Index />);

    expect(screen.getByText("2 post(s) scheduled")).toBeInTheDocument();
  });

  it("displays current time", () => {
    render(<Index />);
    expect(screen.getByText(/Current time:/)).toBeInTheDocument();
  });

  it("validates empty content submission", async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Index />);

    const textArea = screen.getByPlaceholderText(
      "What would you like to share?"
    );
    const dateTimeInput = screen.getByLabelText("Schedule for");

    // Set only datetime without content (add just a space to enable button)
    await user.type(textArea, " ");

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);
    const dateTimeValue = futureDate.toISOString().slice(0, 16);

    fireEvent.change(dateTimeInput, { target: { value: dateTimeValue } });

    // Now submit the form directly
    const form = screen
      .getByRole("button", { name: /schedule post/i })
      .closest("form");
    fireEvent.submit(form!);

    await waitFor(
      () => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Please fill in both the content and scheduled time"
        );
      },
      { timeout: 1000 }
    );

    alertSpy.mockRestore();
  });

  it("has proper accessibility labels", () => {
    render(<Index />);

    expect(screen.getByLabelText("Post Content")).toBeInTheDocument();
    expect(screen.getByLabelText("Schedule for")).toBeInTheDocument();
  });

  it("enforces character limit", async () => {
    render(<Index />);

    const textArea = screen.getByPlaceholderText(
      "What would you like to share?"
    );

    // Type more than 280 characters
    const longText = "a".repeat(300);
    fireEvent.change(textArea, { target: { value: longText } });

    // Should be limited to 280 characters
    await waitFor(
      () => {
        expect(textArea).toHaveValue("a".repeat(280));
      },
      { timeout: 1000 }
    );
  });
});
