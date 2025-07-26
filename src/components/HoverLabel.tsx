import { Html } from '@react-three/drei';

interface HoverLabelProps {
  label: string;
  visible: boolean;
  position?: [number, number, number];
}

export function HoverLabel({
  label,
  visible,
  position = [0, 0, 0],
}: HoverLabelProps) {
  if (!label || !visible) return null;

  return (
    <Html
      position={position}
      center
      style={{
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {label}
      </div>
    </Html>
  );
}
