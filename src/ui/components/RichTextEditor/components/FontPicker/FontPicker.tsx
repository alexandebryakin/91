import React from 'react';
import Select from 'react-select';
import { components, GroupTypeBase, OptionProps, OptionTypeBase, SingleValueProps } from 'react-select';

import { fontFamilies } from './fontFamilies';

const FONT_CACHE: { [family: string]: boolean } = {};

function loadFont(family: string | undefined) {
  if (!family || FONT_CACHE[family]) return;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  // style.type = 'text/css';
  const css = `@import url('https://fonts.googleapis.com/css?family=${family.replace(/\s/gi, '+')}');`;
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);

  FONT_CACHE[family] = true;
}

const Option = (props: OptionProps<OptionTypeBase, boolean, GroupTypeBase<OptionTypeBase>>) => {
  const { children, className } = props;

  const family = props.data.value;
  const cx = [className, 'font-picker__option'];

  return (
    <components.Option {...props} className={cx.join(' ')}>
      <span style={{ fontFamily: family }}>{children}</span>
    </components.Option>
  );
};

const SingleValue = (props: SingleValueProps<OptionTypeBase, GroupTypeBase<OptionTypeBase>>) => {
  const { children } = props;

  const family = props.data.value;
  return (
    <components.SingleValue {...props}>
      <span style={{ fontFamily: family }}>{children}</span>
    </components.SingleValue>
  );
};

interface FontPickerProps {
  selectedFontFamily?: string;
  onChangeFontFamily?: (family: string) => void;
}

function FontPicker(props: FontPickerProps): React.ReactElement {
  const { selectedFontFamily } = props;
  const { onChangeFontFamily } = props;

  const options = fontFamilies.map((ff) => ({ label: ff.family, value: ff.family }));

  React.useEffect(() => {
    fontFamilies.forEach((ff) => loadFont(ff.family));
  }, []);

  type TFontOption = { label: string; value: string };
  const handleChange = (option: TFontOption) => {
    onChangeFontFamily && onChangeFontFamily(option.value);
  };

  return (
    <Select
      placeholder="Select typeface"
      value={selectedFontFamily ? { label: selectedFontFamily, value: selectedFontFamily } : null}
      options={options}
      onChange={(v) => handleChange(v as TFontOption)}
      components={{ DropdownIndicator: () => null, IndicatorSeparator: () => null, Option, SingleValue }}
      styles={{
        control: (base) => {
          return { ...base, border: 'none', boxShadow: 'none', cursor: 'pointer' };
        },
      }}
    />
  );
}

export default FontPicker;
