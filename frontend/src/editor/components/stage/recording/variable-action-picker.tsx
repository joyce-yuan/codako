import { MathOperation } from "../../../../types";

export const VariableActionPicker = (props: {
  operation: MathOperation;
  value: string | number;
  onChangeValue: (value: number) => void;
  onChangeOperation: (op: MathOperation) => void;
}) => {
  const { operation, value, onChangeOperation, onChangeValue } = props;

  return (
    <span>
      <select
        value={operation}
        className="variable-operation-select"
        onChange={(e) => onChangeOperation(e.target.value as MathOperation)}
      >
        <option value="add">Add</option>
        <option value="subtract">Subtract</option>
        <option value="set">Put</option>
      </select>
      <input
        type="text"
        key={`${value}`}
        defaultValue={value}
        className="variable-value-input"
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => (e.keyCode === 13 ? e.currentTarget.blur() : null)}
        onBlur={(e) => onChangeValue(Number(e.target!.value))}
      />
      {{ set: "into", add: "to", subtract: "from" }[operation]}
    </span>
  );
};
