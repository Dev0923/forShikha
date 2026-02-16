'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [formData, setFormData] = useState({
    mediaName: 'Wonder_cement_RS',
    screenName: 'Ridhi_Sidhi',
    startDate: '2026-01-29T11:04:40',
    endDate: '2026-01-29T22:54:40',
    duration: '10',
    gap: '200',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaName: formData.mediaName,
          screenName: formData.screenName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          duration: formData.duration,
          gap: formData.gap,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'daily_log.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>DOOH Ad Log Generator</h1>
        <p className={styles.subtitle}>Generate advertisement log PDFs for your digital screens</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="mediaName">Media Name</label>
            <input
              type="text"
              id="mediaName"
              name="mediaName"
              value={formData.mediaName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="screenName">Screen Name</label>
            <input
              type="text"
              id="screenName"
              name="screenName"
              value={formData.screenName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Campaign Start Date & Time</label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">Campaign End Date & Time</label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="duration">Ad Duration (seconds)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="gap">Gap Between Ads (seconds)</label>
              <input
                type="number"
                id="gap"
                name="gap"
                value={formData.gap}
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </button>
        </form>
      </div>
    </main>
  );
}
