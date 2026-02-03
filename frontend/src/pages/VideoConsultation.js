// Commit on 2026-03-08
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './VideoConsultation.module.css';
import AgoraRTC from 'agora-rtc-sdk-ng';

// Minimal Agora integration: start camera and mic on join, subscribe remote users.
export default function VideoConsultation() {
  const [appId, setAppId] = useState('');
  const [channel, setChannel] = useState('ayurvarta');
  const [token, setToken] = useState('');
  const [uid, setUid] = useState('');
  // userType is a UX choice; role remains 'host' for publishing
  const [userType, setUserType] = useState('practitioner'); // 'practitioner' | 'dietitian'
  const [role, setRole] = useState('host');
  const [joined, setJoined] = useState(false);
  const localRef = useRef(null);
  const clientRef = useRef(null);
  const localTracksRef = useRef({ mic: null, cam: null });
  

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      // Single-camera UI: don't render remote video, but play audio so the practitioner/dietitian can be heard.
      if (mediaType === 'video') {
        // Optional: could show toast indicating remote video published.
      }
      if (mediaType === 'audio') {
        user.audioTrack?.play();
      }
    };
    const handleUserUnpublished = (user) => {
      // Automatically handled by SDK when tracks stop; nothing to do here for now.
    };
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
    };
  }, []);

  // Ensure camera preview is opened as soon as possible.
  const ensurePreview = async () => {
    try {
      if (!localTracksRef.current.cam) {
        const camTrack = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current.cam = camTrack;
      }
      localTracksRef.current.cam.play(localRef.current);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Camera preview error', err);
    }
  };

  useEffect(() => {
    // Auto-start camera preview on mount.
    ensurePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTokenIfNeeded = async (appIdIn, channelIn, uidIn, roleIn) => {
    if (token && appId) return { appId: appIdIn || appId, token, uid: uidIn };
    // Try backend token service; fallback to appId without token for testing (if project allows).
    const body = { channel: channelIn, uid: uidIn || 0, role: roleIn };
    const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5050';
    const resp = await fetch(`${base}/api/v1/agora/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error('Failed to fetch token');
    const data = await resp.json();
    setAppId(data.appId);
    setToken(data.token);
    return { appId: data.appId, token: data.token, uid: data.uid };
  };

  const generateRandomUid = () => {
    // Agora UID typically fits 32-bit int. Use a safe positive range.
    const min = 1_000_000;
    const max = 2_147_483_647; // 2^31 - 1
    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    setUid(String(rand));
  };

  const handleJoin = async () => {
    try {
      const channelName = channel.trim();
      if (!channelName) return;
      const desiredUid = uid ? Number(uid) : null;
      const { appId: finalAppId, token: finalToken, uid: serverUid } = await fetchTokenIfNeeded(appId, channelName, desiredUid, role);
      const client = clientRef.current;
      const actualUid = await client.join(finalAppId, channelName, finalToken || null, desiredUid || null);
      // Create mic if needed and reuse existing camera preview track
      let micTrack = localTracksRef.current.mic;
      if (!micTrack) {
        micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localTracksRef.current.mic = micTrack;
      }
      if (!localTracksRef.current.cam) {
        // Fallback if preview didn't initialize
        localTracksRef.current.cam = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current.cam.play(localRef.current);
      }
      // Publish
      await client.publish([localTracksRef.current.mic, localTracksRef.current.cam]);
      setJoined(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Join error', err);
      alert('Failed to start video. Check Agora config and permissions.');
    }
  };

  const handleLeave = async () => {
    try {
      const client = clientRef.current;
      const { mic, cam } = localTracksRef.current;
      // Unpublish tracks from the channel
      try { await client.unpublish(); } catch {}
      await client.leave();
      // Close mic but keep camera preview running for UX
      if (mic) { try { mic.stop(); mic.close(); } catch {} localTracksRef.current.mic = null; }
      if (cam) {
        // Ensure the preview remains visible
        try { cam.play(localRef.current); } catch {}
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Leave error', err);
    } finally {
      setJoined(false);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Video Consultation</h1>
        <Link to="/dashboard" className={styles.button + ' ' + styles.ghost}>Back to Dashboard</Link>
      </div>

      <Panel appId={appId} setAppId={setAppId} channel={channel} setChannel={setChannel}
             token={token} setToken={setToken} uid={uid} setUid={setUid} role={role} setRole={setRole}
             userType={userType} setUserType={setUserType} onGenerateUid={generateRandomUid}
             joined={joined} onJoin={handleJoin} onLeave={handleLeave}
             localRef={localRef} onOpenCamera={ensurePreview} />
    </section>
  );
}

function Panel({ appId, setAppId, channel, setChannel, token, setToken, uid, setUid, role, setRole, userType, setUserType, onGenerateUid, joined, onJoin, onLeave, localRef, onOpenCamera }) {
  return (
    <div className={styles.stageCard}>
      <div className={styles.controls}>
        <div className={styles.segmented} role="group" aria-label="Select user type">
          <button type="button" className={`${styles.segment} ${userType==='practitioner' ? styles.active : ''}`} onClick={()=>setUserType('practitioner')}>Practitioner</button>
          <button type="button" className={`${styles.segment} ${userType==='dietitian' ? styles.active : ''}`} onClick={()=>setUserType('dietitian')}>Dietitian</button>
        </div>
        <input className={styles.input} placeholder="Agora App ID" value={appId} onChange={(e)=>setAppId(e.target.value)} />
        <input className={styles.input} placeholder="Channel" value={channel} onChange={(e)=>setChannel(e.target.value)} />
        <input className={styles.input} placeholder="Token (optional)" value={token} onChange={(e)=>setToken(e.target.value)} />
        <div className={styles.uidRow}>
          <input className={styles.input} placeholder="UID (optional)" value={uid} onChange={(e)=>setUid(e.target.value)} />
          <button className={styles.button + ' ' + styles.ghost} type="button" onClick={onGenerateUid}>Random UID</button>
          <button className={styles.button + ' ' + styles.ghost} type="button" onClick={onOpenCamera}>Open Camera</button>
        </div>
        {!joined ? (
          <button className={styles.button} onClick={onJoin}>Join</button>
        ) : (
          <button className={styles.button + ' ' + styles.alt} onClick={onLeave}>Leave</button>
        )}
      </div>
      <div className={styles.videoStageSingle}>
        <div className={styles.videoBox}>
          <label>Camera</label>
          <div ref={localRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <div className={styles.hint}>
        Tip: Choose role above. Leave token blank to fetch from backend. Configure backend .env with AGORA_APP_ID and AGORA_APP_CERT.
      <