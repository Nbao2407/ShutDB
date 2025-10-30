import { WindowMinimise, Quit } from '../wailsjs/runtime/runtime'
import styles from './WindowControls.module.css'

export function WindowControls() {
  const handleMinimize = () => {
    WindowMinimise()
  }

  const handleClose = () => {
    Quit()
  }

  return (
    <div className={styles.windowControls}>
      <button 
        className={`${styles.windowControlBtn} ${styles.minimizeBtn}`} 
        onClick={handleMinimize}
        title="Minimize"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="5" width="8" height="2" fill="currentColor" />
        </svg>
      </button>
      <button 
        className={`${styles.windowControlBtn} ${styles.closeBtn}`} 
        onClick={handleClose}
        title="Close"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path 
            d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  )
}