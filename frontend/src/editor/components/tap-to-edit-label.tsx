import { useEffect, useRef, useState } from "react";

export const TapToEditLabel = ({
  value,
  onChange,
  className,
}: {
  value: string;
  className: string;
  onChange?: (str: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const el = useRef<HTMLDivElement | null>();

  useEffect(() => {
    if (editing && el.current) {
      el.current.focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      document.execCommand("selectAll", false, null as any);
    }
  }, [editing]);

  const isUntitled = `${value}`.startsWith("Untitled");

  if (!onChange) {
    return (
      <div
        ref={(e) => (el.current = e)}
        className={`tap-to-edit editing-false ${className}`}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  return (
    <div
      contentEditable={editing}
      ref={(e) => (el.current = e)}
      className={`tap-to-edit editing-${editing} enabled ${isUntitled ? "untitled" : ""} ${className}`}
      dangerouslySetInnerHTML={{ __html: value }}
      onChange={(e) => {
        onChange(e.currentTarget.innerText);
      }}
      onDragStart={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!editing) {
          setEditing(true);
          e.preventDefault();
        }
      }}
      onKeyUp={(e) => {
        if (e.keyCode === 13) {
          e.currentTarget.blur();
        }
      }}
      onBlur={(e) => {
        setEditing(false);
        onChange(e.target.innerText);
      }}
    />
  );
};
