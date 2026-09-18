"use client";

interface AudioPlayerProps {
  driveFileId: string;
  fileName?: string;
}

export default function AudioPlayer({ driveFileId, fileName }: AudioPlayerProps) {
  const audioUrl = `https://drive.google.com/uc?export=download&id=${driveFileId}`;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-black/5">
      <span className="text-2xl">🎵</span>
      <div className="flex-1 min-w-0">
        {fileName && (
          <p className="text-xs opacity-60 truncate mb-1">{fileName}</p>
        )}
        <audio controls preload="none" className="w-full h-8">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support audio.
        </audio>
      </div>
    </div>
  );
}
