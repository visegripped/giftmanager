import { render, fireEvent, screen } from "@testing-library/react";
import SelectList from "./index";

describe("SelectList", () => {
  test("onSelect is executed properly", () => {
    let counter = 0;
    const testForClick = () => {
      counter += 1;
    };
    render(<SelectList onSelect={testForClick} />);
    const renderedSelectList = screen.getByTestId("SelectList");
    fireEvent.click(renderedSelectList);
    expect(counter).toEqual(1);
  });
  test("snapshot matches", () => {
    render(
      <SelectList
        cssClasses="test classes"
        disabled={false}
      />
    );
    const renderedSelectList = screen.getByTestId("SelectList");
    expect(renderedSelectList).toMatchSnapshot();
  });
});
