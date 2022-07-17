import { render, fireEvent, screen } from "@testing-library/react";
import SelectList from "./index";

const sampleOptions = [
  { value: 'someting', label: 'something' },
  { value: 'sometingElse', label: 'something else' },
  { value: 'sometingMore', label: 'something more' },
];

describe("SelectList", () => {
  test("onChange is executed properly", () => {
    let counter = 0;
    const testForClick = () => {
      counter += 1;
    };
    render(<SelectList options={sampleOptions} onChange={testForClick} />);
    const renderedSelectList = screen.getByTestId("SelectList");
    fireEvent.change(renderedSelectList, { target: { value: 1 } });
    expect(counter).toEqual(1);
  });
  test("snapshot matches", () => {
    render(
      <SelectList
        cssClasses="test classes"
        options={sampleOptions} 
        disabled={false}
      />
    );
    const renderedSelectList = screen.getByTestId("SelectList");
    expect(renderedSelectList).toMatchSnapshot();
  });
});
