export const DisclosureTriangle = ({
  collapsed,
  onClick,
  enabled = true,
}: {
  collapsed: boolean;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  enabled?: boolean;
}) => {
  const _onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(e);
  };
  return (
    <div
      onClick={_onClick}
      className={`triangle ${collapsed ? "disclosed" : ""} ${enabled ? "enabled" : ""}`}
    />
  );
};
