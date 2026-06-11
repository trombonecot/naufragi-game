import type { CSSProperties } from 'react';
import { useSheet } from '../../context/SheetContext';

/** A text input bound to a sheet field by key. */
export function TextField({
  fieldKey,
  className,
  style,
  placeholder,
}: {
  fieldKey: string;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
}) {
  const { getText, setField } = useSheet();
  return (
    <input
      type="text"
      className={className}
      style={style}
      placeholder={placeholder}
      value={getText(fieldKey)}
      onChange={(e) => setField(fieldKey, e.target.value)}
    />
  );
}

/** A checkbox bound to a sheet field by key. */
export function CheckField({
  fieldKey,
  className,
  style,
}: {
  fieldKey: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { getBool, setField } = useSheet();
  return (
    <input
      type="checkbox"
      className={className}
      style={style}
      checked={getBool(fieldKey)}
      onChange={(e) => setField(fieldKey, e.target.checked)}
    />
  );
}
