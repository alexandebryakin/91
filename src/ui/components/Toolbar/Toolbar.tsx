import React from 'react';

import './Toolbar.scss';

interface ToolbarProps {
  children: React.ReactNode;
}
function Panel(props: ToolbarProps): React.ReactElement {
  return <div className="toolbar"> {props.children}</div>;
}

interface ToolbarGroupsProps {
  children: React.ReactNode;
}
function Group(props: ToolbarGroupsProps): React.ReactElement {
  return <div className="toolbar__group">{props.children}</div>;
}

interface ToolbarGroupsProps {
  active?: boolean;
  disabled?: boolean;

  children: React.ReactNode;

  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}
function Tool(props: ToolbarGroupsProps): React.ReactElement {
  const { active, disabled, children } = props;
  const { onClick } = props;

  const cx = ['tool'];
  active && cx.push('tool--active');
  disabled && cx.push('tool--disabled');

  return (
    <div className={cx.join(' ')} onClick={onClick}>
      {children}
    </div>
  );
}

function Separator(): React.ReactElement {
  return <div className="separator" />;
}

export default {
  Panel,
  Group,
  Tool,
  Separator,
};
