import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders a canvas", () => {
  render(<App />);

  expect(screen.getByTestId("document-canvas")).toBeTruthy();
});
