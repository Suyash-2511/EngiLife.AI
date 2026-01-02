
import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Brain, Save, Trash2, 
  ChevronRight, RotateCw, Check, Zap, Sparkles, Book,
  RotateCcw, ThumbsUp, ThumbsDown, Clock, ArrowLeft
} from 'lucide-react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { useAppContext } from '../../context/AppContext';
import { generateFlashcardsFromNotes } from '../../services/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Note, Flashcard } from '../../types';

interface FlashcardPlayerProps {
  cards: Flashcard[];
  onClose: () => void;
  onComplete: (score: number, updatedCards: Flashcard[]) => void;
}

const FlashcardPlayer = ({ cards, onClose, onComplete }: FlashcardPlayerProps) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>(JSON.parse(JSON.stringify(cards))); // Deep copy
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Spaced Repetition System (SRS) Algorithm (Modified SM-2)
  const calculateNextReview = (card: Flashcard, rating: 'again' | 'hard' | 'good' | 'easy') => {
    let interval = card.interval || 0;
    let ease = card.easeFactor || 2.5;
    let reviews = card.reviews || 0;

    if (rating === 'again') {
      // Needs Review: Fail grade. Reset interval.
      interval = 0; 
      ease = Math.max(1.3, ease - 0.2);
    } else if (rating === 'hard') {
      // Hard: Pass but difficult. Small interval increase.
      interval = interval === 0 ? 1 : interval * 1.2;
      ease = Math.max(1.3, ease - 0.15);
    } else if (rating === 'good') {
      // Good: Standard pass.
      interval = interval === 0 ? 1 : interval * ease;
    } else if (rating === 'easy') {
      // Easy: Bright pass. Bonus interval.
      interval = interval === 0 ? 4 : interval * ease * 1.3;
      ease += 0.15;
    }

    // Rounding and minimums
    interval = Math.round(interval * 10) / 10;
    
    // Calculate next due date
    const nextDueDate = new Date();
    // If interval is 0 (Needs Review), set due date to tomorrow (1 day) or same day logic depending on strictness
    // Here we use 1 day minimum for any review unless it's immediate re-queue (not implemented in this linear session)
    nextDueDate.setDate(nextDueDate.getDate() + (interval < 1 ? 1 : interval));

    return {
      ...card,
      interval,
      easeFactor: ease,
      reviews: reviews + 1,
      dueDate: nextDueDate.toISOString(),
      mastered: interval > 21 // Consider mastered if interval > 3 weeks
    };
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    const currentCard = sessionCards[index];
    const updatedCard = calculateNextReview(currentCard, rating);
    
    // Update local session state
    const newSessionCards = [...sessionCards];
    newSessionCards[index] = updatedCard;
    setSessionCards(newSessionCards);

    // Score only increases for good/easy
    if (rating === 'good' || rating === 'easy') {
      setScore(prev => prev + 1);
    }

    setIsFlipped(false);

    if (index < sessionCards.length - 1) {
      setTimeout(() => setIndex(index + 1), 200);
    } else {
      setFinished(true);
      onComplete(rating === 'good' || rating === 'easy' ? score + 1 : score, newSessionCards);
    }
  };

  const getIntervalLabel = (rating: 'again' | 'hard' | 'good' | 'easy') => {
      const dummy = calculateNextReview(sessionCards[index], rating);
      const days = dummy.interval || 1;
      return days < 1 ? '1d' : `${Math.round(days)}d`;
  };

  if (finished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm"
      >
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl max-w-sm w-full text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
           <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={40} className="text-emerald-500" />
           </div>
           <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Session Complete!</h2>
           <p className="text-slate-500 mb-6">Review progress updated for {cards.length} cards.</p>
           <Button onClick={onClose} className="w-full">Close</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4 text-white">
           <span className="font-mono text-sm opacity-70">Card {index + 1} / {cards.length}</span>
           <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Trash2 size={20}/></button>
        </div>
        
        <div className="h-96 perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
           <motion.div 
             className="relative w-full h-full preserve-3d transition-transform duration-500"
             animate={{ rotateY: isFlipped ? 180 : 0 }}
             style={{ transformStyle: 'preserve-3d' }}
           >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 flex items-center justify-center text-center shadow-2xl border border-slate-200 dark:border-slate-700">
                 <div className="max-w-lg">
                    <span className="text-xs uppercase tracking-widest text-slate-400 mb-6 block font-bold">Question</span>
                    <h3 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-white leading-tight">{sessionCards[index].question}</h3>
                    <p className="text-sm text-slate-400 mt-12 animate-pulse flex items-center justify-center gap-2">
                       <RotateCw size={14} /> Tap to flip
                    </p>
                 </div>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backface-hidden bg-slate-900 dark:bg-black rounded-3xl p-8 flex items-center justify-center text-center shadow-2xl border border-slate-700"
                style={{ transform: 'rotateY(180deg)' }}
              >
                 <div className="max-w-lg text-white">
                    <span className="text-xs uppercase tracking-widest text-emerald-400 mb-6 block font-bold">Answer</span>
                    <p className="text-lg md:text-xl leading-relaxed font-medium text-slate-100">{sessionCards[index].answer}</p>
                 </div>
              </div>
           </motion.div>
        </div>

        {/* Action Buttons */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-4 gap-3 mt-8"
            >
               <button 
                 onClick={() => handleRating('again')}
                 className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 transition-all hover:scale-105 border-t-4 border-rose-500"
               >
                  <span className="text-sm font-bold mb-1">Needs Review</span>
                  <span className="text-xs opacity-60">{getIntervalLabel('again')}</span>
               </button>
               <button 
                 onClick={() => handleRating('hard')}
                 className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-all hover:scale-105 border-t-4 border-amber-500"
               >
                  <span className="text-sm font-bold mb-1">Hard</span>
                  <span className="text-xs opacity-60">{getIntervalLabel('hard')}</span>
               </button>
               <button 
                 onClick={() => handleRating('good')}
                 className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition-all hover:scale-105 border-t-4 border-blue-500"
               >
                  <span className="text-sm font-bold mb-1">Good</span>
                  <span className="text-xs opacity-60">{getIntervalLabel('good')}</span>
               </button>
               <button 
                 onClick={() => handleRating('easy')}
                 className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-all hover:scale-105 border-t-4 border-emerald-500"
               >
                  <span className="text-sm font-bold mb-1">Easy</span>
                  <span className="text-xs opacity-60">{getIntervalLabel('easy')}</span>
               </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isFlipped && (
           <div className="mt-8 text-center text-slate-400 text-sm opacity-50">
              Flip the card to see options
           </div>
        )}
      </div>
    </div>
  );
};

export const KnowledgeVault: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, awardXP } = useAppContext();
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Editor State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [playingFlashcards, setPlayingFlashcards] = useState(false);

  const selectedNote = notes.find(n => n.id === selectedNoteId);

  // Initialize new note
  const handleCreateNote = () => {
     addNote('New Note', '');
     setIsEditing(true);
     // On mobile, automatically selecting the new note is handled by the effect of adding it,
     // but we rely on the user clicking it or we could auto-select the latest one.
     // For simplicity, we just add it to the list.
  };

  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    }
  }, [selectedNoteId, notes]);

  const handleSave = () => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { title: editTitle, content: editContent });
      setIsEditing(false);
    }
  };

  const handleGenerateCards = async () => {
    if (!selectedNoteId || !editContent) return;
    setIsGenerating(true);
    const cards = await generateFlashcardsFromNotes(editContent);
    if (cards.length > 0) {
       // Convert to Flashcard objects with initial SRS state
       const newCards: Flashcard[] = cards.map((c: any, i) => ({
         id: Date.now().toString() + i,
         question: c.question,
         answer: c.answer,
         mastered: false,
         interval: 0,
         easeFactor: 2.5,
         reviews: 0,
         dueDate: new Date().toISOString()
       }));
       updateNote(selectedNoteId, { flashcards: newCards });
       awardXP(20); // Bonus for creating materials
    }
    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100dvh-140px)]">
      {playingFlashcards && selectedNote && (
        <FlashcardPlayer 
          cards={selectedNote.flashcards} 
          onClose={() => setPlayingFlashcards(false)} 
          onComplete={(score, updatedCards) => {
             awardXP(score * 5); // 5 XP per good/easy rating
             if (selectedNoteId) {
                updateNote(selectedNoteId, { flashcards: updatedCards });
             }
             setPlayingFlashcards(false);
          }}
        />
      )}

      {/* Sidebar List - Hidden on Mobile if note selected */}
      <div className={`lg:col-span-3 flex flex-col h-full gap-4 ${selectedNoteId ? 'hidden lg:flex' : 'flex'}`}>
        <Button onClick={handleCreateNote} icon={<Plus size={18} />} className="w-full">New Note</Button>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
           {notes.length === 0 && <div className="text-center text-slate-400 text-sm mt-10">No notes yet</div>}
           {notes.map(note => (
             <motion.div 
               key={note.id}
               onClick={() => { setSelectedNoteId(note.id); setIsEditing(false); }}
               className={`p-4 rounded-xl cursor-pointer transition-all border ${
                 selectedNoteId === note.id 
                 ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 border-primary-500' 
                 : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
               }`}
             >
                <h3 className="font-semibold truncate">{note.title}</h3>
                <div className="flex justify-between items-center mt-2 opacity-80 text-xs">
                   <span>{note.lastModified}</span>
                   {note.flashcards.length > 0 && (
                      <span className="flex items-center gap-1 bg-white/20 px-1.5 py-0.5 rounded">
                         <Zap size={10} fill="currentColor" /> {note.flashcards.length}
                      </span>
                   )}
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Editor Area - Hidden on Mobile if NO note selected */}
      <div className={`lg:col-span-9 h-full flex flex-col ${!selectedNoteId ? 'hidden lg:flex' : 'flex'}`}>
        {selectedNote ? (
           <Card noPadding className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800">
              {/* Toolbar */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                 {/* Mobile Back Button */}
                 <button 
                    onClick={() => setSelectedNoteId(null)}
                    className="lg:hidden mr-3 p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                 >
                    <ArrowLeft size={18} />
                 </button>

                 <div className="flex-1 mr-4">
                    <input 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Note Title"
                      className="bg-transparent text-lg md:text-xl font-bold text-slate-900 dark:text-white outline-none w-full placeholder:text-slate-400"
                    />
                 </div>
                 <div className="flex items-center gap-1 md:gap-2">
                    {selectedNote.flashcards.length > 0 && (
                       <Button size="sm" variant="secondary" onClick={() => setPlayingFlashcards(true)} icon={<Brain size={16} className="text-primary-500" />}>
                          <span className="hidden md:inline">Study</span> ({selectedNote.flashcards.length})
                       </Button>
                    )}
                    <Button 
                       variant="ghost" 
                       size="sm"
                       onClick={handleGenerateCards} 
                       disabled={isGenerating || !editContent}
                       className="text-indigo-600 dark:text-indigo-400"
                       title="Generate Flashcards"
                    >
                       {isGenerating ? <RotateCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSave} className="text-emerald-600 dark:text-emerald-400">
                       <Save size={18} />
                    </Button>
                    <button 
                       onClick={() => { deleteNote(selectedNote.id); setSelectedNoteId(null); }}
                       className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>

              {/* Text Area */}
              <textarea 
                 value={editContent}
                 onChange={(e) => setEditContent(e.target.value)}
                 className="flex-1 w-full p-4 md:p-8 resize-none outline-none bg-transparent text-slate-800 dark:text-slate-200 leading-relaxed text-sm md:text-base font-mono focus:bg-slate-50/50 dark:focus:bg-slate-900/50 transition-colors"
                 placeholder="Start typing your notes here (Markdown supported)..."
              />
              
              <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-right flex justify-between px-4">
                 <span>Markdown Supported</span>
                 <span>{editContent.length} chars</span>
              </div>
           </Card>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                 <Book size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Your Knowledge Vault</h3>
              <p className="mt-2 text-sm max-w-xs text-center">Select a note from the sidebar or create a new one to start building your second brain.</p>
           </div>
        )}
      </div>
    </div>
  );
};
