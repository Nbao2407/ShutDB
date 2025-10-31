import styles from './DragRegion.module.css'

interface DragRegionProps {
  children?: React.ReactNode;
  className?: string;
}

export function DragRegion({ children, className }: DragRegionProps) {
  const combinedClassName = className ? `${styles.dragRegion} ${className}` : styles.dragRegion;

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}
