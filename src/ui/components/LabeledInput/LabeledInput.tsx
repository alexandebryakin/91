import './LabeledInput.scss';

interface ILabeledInput extends Partial<Pick<HTMLInputElement, 'defaultValue' | 'placeholder' | 'value' | 'disabled'>> {
  onChange?: (v: string) => void;
  label: string;
}

function LabeledInput(props: ILabeledInput): React.ReactElement {
  const { label, onChange, ...inputProps } = props;

  const { disabled } = inputProps;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    typeof onChange == 'function' && onChange(e.target.value);

  return (
    <div className="labeled-input">
      <input
        className={`text-input ${disabled ? 'text-input--disabled' : ''}`}
        type="text"
        onChange={handleChange}
        {...inputProps}
      />

      <div className="labeled-input__label-container">
        <div className={`labeled-input__label ${disabled ? 'labeled-input__label--disabled' : ''}`}>{label}</div>
      </div>
    </div>
  );
}

export default LabeledInput;
