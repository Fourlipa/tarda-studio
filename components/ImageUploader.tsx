
import React, { useRef } from 'react';
import { FashionImage } from '../types';

interface ImageUploaderProps {
  label: string;
  image: FashionImage | null;
  onImageSelect: (image: FashionImage) => void;
  icon: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageSelect, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageSelect({
          base64: base64String,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      onClick={() => fileInputRef.current?.click()}
      className="relative w-full h-full group cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all duration-700"
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {image ? (
        <>
          <img src={image.previewUrl} alt={label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
            <p className="text-white text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.4em] uppercase font-light border-b border-white/40 pb-1">Ubah Foto</p>
          </div>
        </>
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          {/* Mannequin Silhouette */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.1] md:opacity-[0.15] group-hover:opacity-25 transition-opacity duration-700">
            <svg viewBox="0 0 200 500" className="h-[75%] md:h-[85%] w-auto fill-current text-[#c5a059]">
              <path d="M100 20c-10 0-18 8-18 18s8 18 18 18 18-8 18-18-8-18-18-18zm0 40c-25 0-45 20-45 60v100c0 10 5 20 15 25l10 5v230h40V250l10-5c10-5 15-15 15-25V120c0-40-20-60-45-60z" />
              <path d="M55 120c-15 40-25 100-25 150s10 120 20 180h100c10-60 20-130 20-180s-10-110-25-150H55z" fillOpacity="0.5"/>
            </svg>
          </div>

          {/* Upload Text Overlay */}
          <div className="z-10 text-center space-y-3 md:space-y-4 px-6 md:px-8">
            <div className="flex justify-center text-[#c5a059] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500">
              {icon}
            </div>
            <div className="space-y-1">
              <p className="text-[#c5a059] text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.5em] uppercase font-medium">
                {label}
              </p>
              <p className="text-slate-500 text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] uppercase italic font-light opacity-60">
                Posisikan diri Anda di atelier kami
              </p>
            </div>
            
            <div className="pt-2 md:pt-4">
               <span className="px-5 md:px-6 py-2 border border-[#c5a059]/30 rounded-full text-[8px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] text-[#c5a059]/60 uppercase group-hover:bg-[#c5a059] group-hover:text-[#052c22] transition-all duration-500">
                 Buka Galeri
               </span>
            </div>
          </div>
          
          {/* Ambient Lighting Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c5a059]/5 to-[#c5a059]/10 pointer-events-none"></div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
