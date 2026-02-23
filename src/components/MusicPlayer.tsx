import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, List } from 'lucide-react';

const TRACKS = [
  { name: "Gentle Rain", color: "from-sky-400 to-blue-500", url: "https://cdn.pixabay.com/audio/2022/02/22/audio_d1718ab41b.mp3" },
  { name: "Forest Birds", color: "from-emerald-400 to-teal-500", url: "https://cdn.pixabay.com/audio/2022/08/31/audio_419263ef36.mp3" },
  { name: "Ocean Waves", color: "from-cyan-400 to-blue-500", url: "https://cdn.pixabay.com/audio/2022/05/16/audio_1808eb13b0.mp3" },
  { name: "Campfire Crackle", color: "from-amber-400 to-orange-500", url: "https://cdn.pixabay.com/audio/2024/11/04/audio_4956b4edd1.mp3" },
  { name: "Calm Piano", color: "from-violet-400 to-purple-500", url: "https://cdn.pixabay.com/audio/2022/01/20/audio_cce588a2b4.mp3" },
  { name: "Deep Focus", color: "from-indigo-400 to-blue-500", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" },
  { name: "Meditation Drone", color: "from-fuchsia-400 to-pink-500", url: "https://cdn.pixabay.com/audio/2023/09/04/audio_72b4bb3597.mp3" },
  { name: "Wind Chimes", color: "from-teal-400 to-cyan-500", url: "https://cdn.pixabay.com/audio/2024/06/05/audio_4bfae1a00f.mp3" },
  { name: "Soft Ambient", color: "from-rose-400 to-pink-500", url: "https://cdn.pixabay.com/audio/2023/07/07/audio_98625d8837.mp3" },
  { name: "Night Crickets", color: "from-lime-400 to-emerald-500", url: "https://cdn.pixabay.com/audio/2022/03/24/audio_3cbe560094.mp3" },
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrackList, setShowTrackList] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When track changes, reset and play if was playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play().catch(() => {
          setError("Unable to play");
          setIsPlaying(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else {
      try { setError(null); await audioRef.current.play(); setIsPlaying(true); }
      catch { setError("Unable to play"); setIsPlaying(false); }
    }
  };

  const nextTrack = () => setCurrentTrack((currentTrack + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length);

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(true);
    setShowTrackList(false);
    setError(null);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) { setIsMuted(!isMuted); audioRef.current.muted = !isMuted; }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
      className="relative overflow-hidden rounded-3xl p-6"
      style={{ background: 'linear-gradient(135deg, rgba(10,8,22,0.92) 0%, rgba(20,15,35,0.88) 100%)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
      <div className={`absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-35 transition-all duration-1000 bg-gradient-to-br ${TRACKS[currentTrack].color}`} />
      <div className={`absolute -bottom-14 -left-14 w-36 h-36 rounded-full blur-3xl opacity-15 transition-all duration-1000 bg-gradient-to-br ${TRACKS[currentTrack].color}`} />

      <audio ref={audioRef} src={TRACKS[currentTrack].url} loop
        onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
        onError={() => { setError("Error loading audio"); setIsPlaying(false); }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white/8 ${isPlaying ? 'animate-pulse' : ''}`}>
              <Music size={18} className="text-white/80" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white/90 text-lg leading-tight">Calm Focus</h2>
              <p className="text-[11px] text-white/25 font-medium">{TRACKS.length} ambient tracks</p>
            </div>
          </div>
          <button onClick={() => setShowTrackList(!showTrackList)}
            className={`p-2 rounded-xl transition-all ${showTrackList ? 'bg-white/10 text-white/60' : 'text-white/25 hover:bg-white/5 hover:text-white/40'}`}>
            <List size={16} />
          </button>
        </div>

        {/* Track List */}
        <AnimatePresence>
          {showTrackList && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1 rounded-xl border border-white/5 p-2"
                style={{ background: 'rgba(0,0,0,0.2)' }}>
                {TRACKS.map((track, i) => (
                  <button key={i} onClick={() => selectTrack(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all text-sm ${i === currentTrack ? 'bg-white/10 text-white/90' : 'text-white/40 hover:bg-white/5 hover:text-white/60'}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 bg-gradient-to-br ${track.color}`} />
                    <span className="truncate font-medium">{track.name}</span>
                    {i === currentTrack && isPlaying && (
                      <div className="ml-auto flex gap-0.5 items-end h-3">
                        {[1, 2, 3].map((b) => (
                          <motion.div key={b}
                            animate={{ height: [3, 10, 3] }}
                            transition={{ repeat: Infinity, duration: 0.6, delay: b * 0.1 }}
                            className={`w-1 rounded-full bg-gradient-to-t ${track.color}`} />
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-5">
          {/* Now Playing */}
          <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/25 uppercase tracking-[0.15em] mb-1 font-medium">Now Playing</span>
              <span className="font-medium text-white/80 text-sm">{TRACKS[currentTrack].name}</span>
              {error && <span className="text-[10px] text-red-400 mt-1">{error}</span>}
            </div>
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'animate-pulse' : ''} bg-gradient-to-br ${TRACKS[currentTrack].color}`} />
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-white/25 hover:text-white/50 transition-colors">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} className="flex-1 cursor-pointer" />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            <motion.button onClick={prevTrack} whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-all border border-white/5">
              <SkipBack size={16} fill="currentColor" />
            </motion.button>
            <motion.button onClick={togglePlay} whileTap={{ scale: 0.9 }}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-r from-white/90 to-white/80 text-gray-900 shadow-xl transition-transform hover:scale-105"
              style={{ boxShadow: '0 8px 25px rgba(255,255,255,0.12)' }}>
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
            </motion.button>
            <motion.button onClick={nextTrack} whileTap={{ scale: 0.9 }}
              className="p-3 rounded-xl bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/50 transition-all border border-white/5">
              <SkipForward size={16} fill="currentColor" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
