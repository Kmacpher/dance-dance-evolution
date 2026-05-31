import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Upload() {
  const navigate = useNavigate();
  const [smFile, setSmFile] = useState<File | null>(null);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!smFile || !songFile) return;

    setStatus('uploading');
    const form = new FormData();
    form.append('sm', smFile);
    form.append('song', songFile);
    if (bgFile) form.append('bg', bgFile);

    try {
      const res = await api.uploadSong(form);
      if (!res.ok) throw new Error('Upload failed');
      setStatus('success');
      setTimeout(() => navigate('/choose-song'), 2000);
    } catch (err) {
      setErrorMsg((err as Error).message);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <h2 className="font-game text-dde-cyan text-lg text-center">UPLOAD SONG</h2>
        <p className="font-game text-xs text-gray-500 text-center">
          Upload a StepMania .sm file with its audio file
        </p>

        {status === 'success' ? (
          <div className="text-center space-y-2">
            <p className="font-game text-dde-green text-sm">UPLOAD SUCCESSFUL!</p>
            <p className="font-game text-xs text-gray-400">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'STEPMANIA FILE (.sm)', accept: '.sm', set: setSmFile, required: true },
              { label: 'AUDIO FILE', accept: '.mp3,.ogg,.wav', set: setSongFile, required: true },
              { label: 'BACKGROUND IMAGE (optional)', accept: '.jpg,.jpeg,.png', set: setBgFile, required: false },
            ].map(({ label, accept, set, required }) => (
              <div key={label}>
                <label className="font-game text-xs text-gray-400 block mb-1">{label}</label>
                <input
                  type="file"
                  accept={accept}
                  required={required}
                  onChange={(e) => set(e.target.files?.[0] ?? null)}
                  className="w-full text-gray-300 text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-game file:text-xs file:bg-dde-purple file:text-white hover:file:bg-dde-pink file:cursor-pointer"
                />
              </div>
            ))}

            {status === 'error' && (
              <p className="font-game text-dde-pink text-xs text-center">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'uploading'}
              className="w-full font-game text-sm py-3 bg-dde-purple hover:bg-dde-pink transition-colors rounded disabled:opacity-50"
            >
              {status === 'uploading' ? 'UPLOADING...' : 'UPLOAD'}
            </button>
          </form>
        )}

        <button
          onClick={() => navigate('/menu')}
          className="w-full font-game text-xs py-2 border border-gray-700 hover:border-gray-500 text-gray-500 hover:text-gray-300 transition-colors rounded"
        >
          BACK
        </button>
      </div>
    </div>
  );
}
