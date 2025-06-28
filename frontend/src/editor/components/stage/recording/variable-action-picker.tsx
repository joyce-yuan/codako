import { MathOperation } from "../../../../types";

export const VariableActionPicker = (props: {
  operation: MathOperation;
  onChangeOperation: (op: MathOperation) => void;
}) => {
  const { operation, onChangeOperation } = props;

  return (
    <select
      value={operation}
      className="variable-operation-select"
      onChange={(e) => onChangeOperation(e.target.value as MathOperation)}
    >
      <option value="add">Add</option>
      <option value="subtract">Subtract</option>
      <option value="set">Put</option>
    </select>
  );
};
