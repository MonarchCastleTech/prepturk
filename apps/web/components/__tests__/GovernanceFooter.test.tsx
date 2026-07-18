import { render, screen } from "@testing-library/react";
import GovernanceFooter from "../GovernanceFooter";

describe("GovernanceFooter", () => {
  it("keeps PrepTürk sovereign-first with a restrained masterbrand endorsement", () => {
    render(<GovernanceFooter />);

    expect(screen.getByRole("img", { name: "PrepTürk" })).toHaveAttribute(
      "src",
      "/logo.svg",
    );
    expect(screen.getByText("Türkçe birincil arayüz")).toBeInTheDocument();
    expect(
      screen.getByText("Part of Monarch Castle Technologies."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Çevrimdışı ve yerel çalışma için tasarlandı/),
    ).toBeInTheDocument();
  });
});
