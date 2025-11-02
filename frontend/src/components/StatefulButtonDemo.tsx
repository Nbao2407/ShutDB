import React, { useState } from 'react';
import { StatefulButton } from './StatefulButton';
import styles from './StatefulButtonDemo.module.css';

/**
 * StatefulButtonDemo Component
 * Showcases the StatefulButton with different states and use cases
 */
export const StatefulButtonDemo: React.FC = () => {
  const [result, setResult] = useState<string>('');

  // Simulate API call with delay
  const simulateAPICall = async (duration: number = 2000): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, duration);
    });
  };

  const handleSendMessage = async () => {
    setResult('Sending message...');
    await simulateAPICall(2000);
    setResult('Message sent successfully! ✓');
    setTimeout(() => setResult(''), 3000);
  };

  const handleSaveSettings = async () => {
    setResult('Saving settings...');
    await simulateAPICall(1500);
    setResult('Settings saved! ✓');
    setTimeout(() => setResult(''), 3000);
  };

  const handleDelete = async () => {
    setResult('Deleting...');
    await simulateAPICall(2500);
    setResult('Item deleted! ✓');
    setTimeout(() => setResult(''), 3000);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Stateful Button Demo</h2>
      <p className={styles.description}>
        Click the buttons below to see the loading and success states in action.
      </p>

      <div className={styles.demoSection}>
        <div className={styles.buttonGroup}>
          <div className={styles.buttonWrapper}>
            <StatefulButton onClickAsync={handleSendMessage}>
              Send Message
            </StatefulButton>
            <span className={styles.label}>Send Message</span>
          </div>

          <div className={styles.buttonWrapper}>
            <StatefulButton 
              onClickAsync={handleSaveSettings}
              style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}
            >
              Save Settings
            </StatefulButton>
            <span className={styles.label}>Save Settings</span>
          </div>

          <div className={styles.buttonWrapper}>
            <StatefulButton 
              onClickAsync={handleDelete}
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              Delete
            </StatefulButton>
            <span className={styles.label}>Delete (Danger)</span>
          </div>
        </div>

        {result && (
          <div className={styles.result}>
            {result}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3>Features:</h3>
        <ul>
          <li>✓ Automatic loading state during async operations</li>
          <li>✓ Success checkmark animation after completion</li>
          <li>✓ Smooth transitions and interactions</li>
          <li>✓ Disabled state during operations</li>
          <li>✓ Accessible and responsive</li>
          <li>✓ Built with Framer Motion</li>
        </ul>
      </div>
    </div>
  );
};

export default StatefulButtonDemo;
