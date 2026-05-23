import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryIcon } from "@/components/Common/CategoryIcon";

describe("CategoryIcon", () => {
  it("renders with the correct aria-label for the category", () => {
    render(<CategoryIcon category="medical" />);
    expect(screen.getByLabelText("Medical & Healthcare")).toBeInTheDocument();
  });

  it("renders without throwing for every supported category", () => {
    const categories = [
      "medical", "groceries", "entertainment", "utilities",
      "rent", "transportation", "dining", "shopping",
      "education", "insurance", "travel", "electronics",
      "home_furniture", "personal_care", "taxes", "miscellaneous",
    ] as const;

    for (const cat of categories) {
      const { unmount } = render(<CategoryIcon category={cat} />);
      unmount();
    }
  });

  it("applies the sm size class", () => {
    const { container } = render(<CategoryIcon category="groceries" size="sm" />);
    expect(container.firstChild).toHaveClass("h-8");
    expect(container.firstChild).toHaveClass("w-8");
  });

  it("applies the md size class by default", () => {
    const { container } = render(<CategoryIcon category="groceries" />);
    expect(container.firstChild).toHaveClass("h-10");
    expect(container.firstChild).toHaveClass("w-10");
  });

  it("applies the lg size class", () => {
    const { container } = render(<CategoryIcon category="groceries" size="lg" />);
    expect(container.firstChild).toHaveClass("h-14");
    expect(container.firstChild).toHaveClass("w-14");
  });

  it("passes custom className through", () => {
    const { container } = render(<CategoryIcon category="dining" className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("uses a CSS variable for the background color", () => {
    const { container } = render(<CategoryIcon category="medical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.backgroundColor).toMatch(/var\(--color-cat-medical\)/);
  });
});
