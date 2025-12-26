
import React, { useState } from 'react';
import { FashionImage, GenerationState, BoutiqueItem, GenerationStep } from './types';
import { GeminiFashionService } from './services/geminiService';
import ImageUploader from './components/ImageUploader';

const getDriveUrl = (id: string) => `https://lh3.googleusercontent.com/d/${id}`;

const BOUTIQUE_ITEMS: BoutiqueItem[] = [
  { id: 'gamis-1', name: 'Gamis Abu', description: 'Silk metallic luxury grey gamis.', imageUrl: getDriveUrl('1rY1eaU2sA0GvE8ySPhXih9PnFmuqqXcV'), base64: '' },
  { id: 'gamis-2', name: 'Gamis Coklat', description: 'Warm earth-toned premium matte crepe.', imageUrl: getDriveUrl('1lxiAOJoK1NEfbEGicM98qK4aU4nRSkxT'), base64: '' },
  { id: 'gamis-3', name: 'Gamis Biru', description: 'Regal royal blue flowing chiffon.', imageUrl: getDriveUrl('1BB1mrDVKNiPIpoo6GepY2etB3ClYVSKU'), base64: '' },
  { id: 'gamis-4', name: 'Gamis Putih', description: 'Pure white lace ceremonial gown.', imageUrl: getDriveUrl('1ZrVtFyTi2H_ZXf4oThpDdlrFOr_YHLUY'), base64: '' }
];

const App: React.FC = () => {
  const [userPhoto, setUserPhoto] = useState<FashionImage | null>(null);
  const [selectedThobe, setSelectedThobe] = useState<BoutiqueItem | null>(null);
  const [state, setState] = useState<GenerationState>({
    step: 'idle',
    error: null,
    resultImage: null,
    debugPrompt: null
  });

  const service = new GeminiFashionService();

  const handleGenerate = async () => {
    if (!userPhoto || !selectedThobe) {
      setState(prev => ({ ...prev, error: "Harap lengkapi foto profil dan pilihan busana Anda.", step: 'error' }));
      return;
    }

    setState({ step: 'analyzing', error: null, resultImage: null, debugPrompt: null });

    try {
      const outfitResponse = await fetch(selectedThobe.imageUrl);
      const outfitBlob = await outfitResponse.blob();
      const outfitBase64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onloadend = () => res((reader.result as string).split(',')[1]);
        reader.readAsDataURL(outfitBlob);
      });

      const aiPrompt = await service.analyzeStyle(
        userPhoto.base64, userPhoto.mimeType,
        outfitBase64, outfitBlob.type
      );

      setState(prev => ({ ...prev, step: 'generating', debugPrompt: aiPrompt }));
      const finalImage = await service.generateVisual(
        aiPrompt,
        userPhoto.base64, userPhoto.mimeType,
        outfitBase64, outfitBlob.type
      );

      setState({ step: 'success', resultImage: finalImage, error: null, debugPrompt: aiPrompt });
    } catch (err: any) {
      setState(prev => ({ ...prev, step: 'error', error: err.message }));
    }
  };

  const getLoadingMessage = () => {
    if (state.step === 'analyzing') return "Analyzing your unique silhouette...";
    if (state.step === 'generating') return "Stitching your custom creation...";
    return "Please wait...";
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#052c22] text-white selection:bg-[#c5a059]/30 pb-20 overflow-y-auto overflow-x-hidden">
      <header className="pt-12 md:pt-20 pb-10 md:pb-16 text-center px-4 w-full">
        <h1 className="text-5xl md:text-8xl font-luxury font-light tracking-[0.2em] uppercase mb-4">TARDA</h1>
        <p className="text-[10px] md:text-sm tracking-[0.6em] text-[#c5a059] uppercase font-light">Fitting Online Atelier</p>
      </header>

      <main className="max-w-7xl w-full px-4 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Mirror / Result */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-8">
          <div className="relative aspect-[9/16] w-full max-w-[360px] md:max-w-[400px] glass-panel tarda-border rounded-[2.5rem] overflow-hidden shadow-2xl bg-black/20">
            {state.step === 'analyzing' || state.step === 'generating' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
                <div className="relative w-16 h-16 mb-8">
                  <div className="absolute inset-0 border border-[#c5a059]/10 rounded-full"></div>
                  <div className="absolute inset-0 border-t-2 border-[#c5a059] rounded-full animate-spin"></div>
                </div>
                <p className="text-[#c5a059] text-[10px] tracking-[0.4em] uppercase animate-pulse text-center px-4">{getLoadingMessage()}</p>
              </div>
            ) : state.resultImage ? (
              <div className="w-full h-full animate-in fade-in zoom-in duration-1000 relative">
                <img src={state.resultImage} className="w-full h-full object-cover" alt="Output" />
                <div className="absolute bottom-8 left-0 w-full px-8">
                  <button onClick={() => setState(prev => ({ ...prev, resultImage: null, step: 'idle' }))} className="w-full py-4 bg-[#c5a059] text-[#052c22] font-luxury tracking-widest rounded-xl shadow-lg">TRY NEW LOOK</button>
                </div>
              </div>
            ) : (
              <ImageUploader label="Upload Your Portrait" image={userPhoto} onImageSelect={setUserPhoto} icon={<CameraIcon />} />
            )}
          </div>

          <div className="w-full max-w-[360px] md:max-w-[400px] space-y-4">
            {state.step === 'error' && (
              <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-center space-y-2">
                <p className="text-red-400 text-[10px] uppercase tracking-widest">{state.error}</p>
                <button onClick={handleGenerate} className="text-white underline text-[9px] tracking-widest">RETRY PROCESS</button>
              </div>
            )}
            
            <button 
              onClick={handleGenerate}
              disabled={state.step === 'analyzing' || state.step === 'generating'}
              className="w-full py-5 bg-white text-[#052c22] font-luxury text-lg tracking-[0.3em] uppercase hover:bg-[#c5a059] hover:text-white transition-all rounded-xl disabled:opacity-30 shadow-xl"
            >
              Visualize Style
            </button>
          </div>
        </div>

        {/* Right Side: Collection Grid */}
        <div className="lg:col-span-5 space-y-8 pb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-[11px] tracking-[0.5em] text-[#c5a059] uppercase mb-2">Private Collection</h2>
            <div className="h-[1px] w-20 bg-[#c5a059]/30"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {BOUTIQUE_ITEMS.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedThobe(item)}
                className={`cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 tarda-border ${selectedThobe?.id === item.id ? 'ring-2 ring-[#c5a059] scale-[1.03] z-10' : 'opacity-40 hover:opacity-100'}`}
              >
                <img src={item.imageUrl} className="aspect-[3/4] object-cover w-full" alt={item.name} />
                <div className="p-2 bg-black/40 text-center">
                   <p className="text-[8px] tracking-[0.2em] uppercase text-white/80">{item.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-10 opacity-20 text-[8px] tracking-[0.5em] uppercase text-center w-full px-4">
        &copy; TARDA ATELIER COUTURE MMXXIV
      </footer>
    </div>
  );
};

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

export default App;
