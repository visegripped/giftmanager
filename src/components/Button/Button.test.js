import { render, fireEvent, screen } from "@testing-library/react";
import Button from "./index";

describe("Button", () => {
  test("onClick is executed properly", () => {
    let counter = 0;
    const testForClick = () => {
      counter += 1;
    };
    render(<Button onClick={testForClick} />);
    const renderedButton = screen.getByTestId("Button");
    fireEvent.click(renderedButton);
    expect(counter).toEqual(1);
  });
  test("snapshot matches", () => {
    render(
      <Button
        text="click me"
        cssClasses="test classes"
        priority="secondary"
        disabled={false}
      />
    );
    const renderedButton = screen.getByTestId("Button");
    expect(renderedButton).toMatchSnapshot();
  });
});
