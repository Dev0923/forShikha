'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const screenOptions = ['Ridhi_Sidhi', 'VivaCity_Mall', 'NewGate_MiRoad', 'Gt_Central_Mall'];
  
  const [mode, setMode] = useState<'single' | 'monthly'>('single');
  const [formData, setFormData] = useState({
    mediaName: 'Wonder_cement_RS',
    screenName: 'Ridhi_Sidhi',
    startDate: '2026-01-29T11:04:40',
    endDate: '2026-01-29T22:54:40',
    duration: '10',
    gap: '200',
    year: '2026',
    month: '1',
  });

  const [screenSelection, setScreenSelection] = useState(screenOptions[0]);
  const [customScreen, setCustomScreen] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScreenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setScreenSelection(value);
    if (value === 'custom') {
      setFormData((prev) => ({
        ...prev,
        screenName: customScreen,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        screenName: value,
      }));
      setCustomScreen('');
    }
  };

  const handleCustomScreenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCustomScreen(value);
    setFormData((prev) => ({
      ...prev,
      screenName: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'monthly') {
        // Generate monthly report with randomized parameters
        const response = await fetch('/api/generate-monthly-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mediaName: formData.mediaName,
            screenName: formData.screenName,
            year: formData.year,
            month: formData.month,
            duration: formData.duration,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate monthly report');
        }

        // Download ZIP
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.mediaName}_${formData.screenName}_${formData.year}-${formData.month.padStart(2, '0')}_monthly_report.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Generate single day PDF
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
      }
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

        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setMode('single')}
            style={{
              padding: '10px 20px',
              backgroundColor: mode === 'single' ? '#0070f3' : '#eaeaea',
              color: mode === 'single' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: mode === 'single' ? 'bold' : 'normal',
            }}
          >
            Single Day
          </button>
          <button
            type="button"
            onClick={() => setMode('monthly')}
            style={{
              padding: '10px 20px',
              backgroundColor: mode === 'monthly' ? '#0070f3' : '#eaeaea',
              color: mode === 'monthly' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: mode === 'monthly' ? 'bold' : 'normal',
            }}
          >
            Monthly Report
          </button>
        </div>

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
            <select
              id="screenName"
              name="screenName"
              value={screenSelection}
              onChange={handleScreenChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'inherit',
              }}
            >
              {screenOptions.map((screen) => (
                <option key={screen} value={screen}>
                  {screen}
                </option>
              ))}
              <option value="custom">Custom Addition</option>
            </select>
            {screenSelection === 'custom' ? (
              <input
                type="text"
                id="customScreen"
                placeholder="Enter custom screen name"
                value={customScreen}
                onChange={handleCustomScreenChange}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                  marginTop: '8px',
                }}
              />
            ) : null}
          </div>

          {mode === 'single' ? (
            <>
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
            </>
          ) : (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="year">Year</label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="month">Month</label>
                  <select
                    id="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
              </div>

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
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Note: Start time (11:00-11:10), end time (22:50-23:00) will be randomized for each day. Gap is fixed at 110s
                </p>
              </div>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? (mode === 'monthly' ? 'Generating Monthly Report...' : 'Generating PDF...') : (mode === 'monthly' ? 'Download Monthly Report (ZIP)' : 'Download PDF')}
          </button>
        </form>
      </div>
    </main>
  );
}
