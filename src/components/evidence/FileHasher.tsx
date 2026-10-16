import React, { useState, useRef } from 'react'
import { calculateFileSha256 } from '../../services/crypto'
import { Hash, Upload, Copy, Check, Shield, FileCode } from 'lucide-react'

export interface FileHasherProps {
  onHashGenerated?: (hash: string, fileName: string) => void;
}

export const FileHasher: React.FC<FileHasherProps> = ({ onHashGenerated }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    sizeBytes: number;
    type: string;
    hash: string;
  } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = async (file: File) => {
    setIsHashing(true);
    try {
      const hash = await calculateFileSha256(file);
      const info = {
        name: file.name,
        sizeBytes: file.size,
        type: file.type || 'unknown/binary',
        hash,
      };
      setFileInfo(info);
      if (onHashGenerated) {
        onHashGenerated(hash, file.name);
      }
    } catch (err) {
      console.error('File hashing failed:', err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = () => {
    if (!fileInfo) return;
    navigator.clipboard.writeText(fileInfo.hash);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              In-Browser SHA-256 Cryptographic Hasher
            </h4>
            <p className="text-xs text-slate-400">
              Compute cryptographic integrity hashes locally for malware samples, suspicious documents, or log extracts
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          Client-Side Only
        </span>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-700 hover:border-slate-600 bg-slate-950/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              processFile(e.target.files[0]);
            }
          }}
        />
        <div className="p-3 rounded-full bg-slate-800 text-cyan-400 mb-2">
          {isHashing ? (
            <Hash className="w-6 h-6 animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>
        <p className="text-xs font-semibold text-slate-200">
          {isHashing ? 'Computing SHA-256 Digest...' : 'Select or Drop File to Hash'}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Any file size up to browser memory limits. Never transmitted over the network.
        </p>
      </div>

      {/* Calculated Result Display */}
      {fileInfo && (
        <div className="p-4 rounded-lg border border-slate-700 bg-slate-950 space-y-3 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-200 truncate max-w-sm">
                {fileInfo.name}
              </span>
              <span className="text-slate-500 font-mono">
                ({formatFileSize(fileInfo.sizeBytes)})
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 self-start sm:self-center"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy SHA-256</span>
                </>
              )}
            </button>
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 break-all select-all">
            {fileInfo.hash}
          </div>
        </div>
      )}

      {/* Privacy and Legal Custody Disclaimer */}
      <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 text-slate-400 text-xs flex items-start gap-2.5">
        <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Cryptographic Integrity vs Legal Chain of Custody:</strong> Cryptographic hashing verifies that a file has not been altered or corrupted since it was hashed. However, hashing alone does not prove authenticity, establish origin, or satisfy regulated forensic evidence rules. Do not upload or enter classified or sensitive real-world evidence into an unapproved browser application.
        </p>
      </div>
    </div>
  );
};
