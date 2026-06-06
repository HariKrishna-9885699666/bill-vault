import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/Common/EmptyState";

describe("EmptyState", () => {
  it("renders the title text", () => {
    render(<EmptyState title="No bills yet" />);
    expect(screen.getByText("No bills yet")).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    render(<EmptyState title="No bills" description="Start by adding your first receipt." />);
    expect(screen.getByText("Start by adding your first receipt.")).toBeInTheDocument();
  });

  it("does not render a description element when omitted", () => {
    const { queryByText } = render(<EmptyState title="No bills" />);
    expect(queryByText(/receipt/i)).toBeNull();
  });

  it("renders an action node when provided", () => {
    render(<EmptyState title="Empty" action={<button type="button">Add Bill</button>} />);
    expect(screen.getByRole("button", { name: "Add Bill" })).toBeInTheDocument();
  });

  it("does not render an action area when omitted", () => {
    const { queryByRole } = render(<EmptyState title="Empty" />);
    expect(queryByRole("button")).toBeNull();
  });

  it("shows the inbox icon container", () => {
    const { container } = render(<EmptyState title="Empty" />);
    // The icon wrapper div is always rendered
    expect(container.querySelector(".rounded-full")).toBeInTheDocument();
  });
});
