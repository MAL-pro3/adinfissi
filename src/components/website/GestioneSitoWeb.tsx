import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Trash2,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2,
  ArrowLeft,
  LogOut,
  ImageIcon,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  GalleryService,
  GALLERY_SECTIONS,
  type GalleryImage,
  type GallerySection,
} from '../../services/galleryService';
import { useAuth } from '../../contexts/AuthContext';

const bySort = (a: GalleryImage, b: GalleryImage) =>
  a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);

type Notice = { type: 'ok' | 'error'; text: string } | null;

const GestioneSitoWeb: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<GallerySection>('HERO');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  // Campi del form di caricamento
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [asCover, setAsCover] = useState(false);

  // Modale di modifica
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isHero = activeSection === 'HERO';
  const sectionMeta = GALLERY_SECTIONS.find((s) => s.key === activeSection)!;

  const sectionImages = useMemo(
    () => images.filter((i) => i.section === activeSection).sort(bySort),
    [images, activeSection],
  );

  const load = useCallback(async () => {
    try {
      const data = await GalleryService.list();
      setImages(data);
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', text: 'Errore nel caricamento delle immagini.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Mostra i messaggi per qualche secondo
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let okCount = 0;
    try {
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        await GalleryService.upload(list[i], activeSection, {
          title,
          description,
          isCover: !isHero && asCover && i === 0,
        });
        okCount++;
      }
      setTitle('');
      setDescription('');
      setAsCover(false);
      await load();
      setNotice({
        type: 'ok',
        text: `${okCount} immagine${okCount > 1 ? 'i' : ''} caricata${okCount > 1 ? 'e' : ''} con successo.`,
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Errore durante il caricamento.';
      setNotice({ type: 'error', text: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!window.confirm('Eliminare definitivamente questa immagine?')) return;
    try {
      await GalleryService.remove(image);
      await load();
      setNotice({ type: 'ok', text: 'Immagine eliminata.' });
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', text: 'Errore nell\'eliminazione.' });
    }
  };

  const handleSetCover = async (image: GalleryImage) => {
    try {
      await GalleryService.setCover(image.id, image.section);
      await load();
      setNotice({ type: 'ok', text: 'Copertina aggiornata.' });
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', text: 'Errore nell\'impostare la copertina.' });
    }
  };

  const handleToggleActive = async (image: GalleryImage) => {
    try {
      await GalleryService.update(image.id, { is_active: !image.is_active });
      await load();
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', text: 'Errore nell\'aggiornamento.' });
    }
  };

  const handleMove = async (image: GalleryImage, dir: 'up' | 'down') => {
    const list = images.filter((i) => i.section === image.section).sort(bySort);
    const idx = list.findIndex((i) => i.id === image.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    const reordered = [...list];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    try {
      await Promise.all(reordered.map((img, i) => GalleryService.update(img.id, { sort_order: i })));
      await load();
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', text: 'Errore nel riordino.' });
    }
  };

  const openEdit = (image: GalleryImage) => {
    setEditing(image);
    setEditTitle(image.title ?? '');
    setEditDescription(image.description ?? '');
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      await GalleryService.update(editing.id, {
        title: editTitle.trim() || null,
        description: editDescription.trim() || null,
      });
      setEditing(null);
      await load();
      setNotice({ type: 'ok', text: 'Dettagli salvati.' });
    } catch (err) {
      console.error(err);
      setNotice({ type: 'error', text: 'Errore nel salvataggio.' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <ImageIcon className="text-brand-yellow-400" size={24} />
              <h1 className="text-lg sm:text-xl font-bold">Gestione Sito Web</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-brand-yellow-400 transition-colors px-3 py-2"
              >
                <ArrowLeft size={16} />
                Vai al sito
              </Link>
              <Link
                to="/app/dashboard"
                className="hidden sm:flex items-center gap-2 text-sm text-gray-300 hover:text-brand-yellow-400 transition-colors px-3 py-2"
              >
                Gestionale
              </Link>
              <span className="hidden md:block text-sm text-gray-400 mr-2">
                {user?.full_name || user?.email}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 mb-6">
          Carica e gestisci le foto del sito. Le modifiche sono immediate: le foto
          pubblicate compaiono sul sito senza bisogno di ricaricare nulla.
        </p>

        {/* Tabs sezioni */}
        <div className="flex flex-wrap gap-2 mb-6">
          {GALLERY_SECTIONS.map((s) => {
            const count = images.filter((i) => i.section === s.key).length;
            const active = activeSection === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  active
                    ? 'bg-brand-yellow-400 text-gray-900 shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {s.label}
                <span className={`ml-2 text-xs ${active ? 'text-gray-700' : 'text-gray-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Avviso */}
        {notice && (
          <div
            className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border ${
              notice.type === 'ok'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notice.type === 'ok' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{notice.text}</span>
          </div>
        )}

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Aggiungi foto — {sectionMeta.label}</h2>
          <p className="text-sm text-gray-500 mb-5">{sectionMeta.hint}</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titolo (opzionale)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Es. Pergolato bioclimatico"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow-400 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione (opzionale)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Es. Villa privata - Aprilia"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-yellow-400 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {!isHero && (
            <label className="flex items-center gap-2 mb-4 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={asCover}
                onChange={(e) => setAsCover(e.target.checked)}
                className="w-4 h-4 accent-brand-yellow-500"
              />
              Usa la prima foto caricata come copertina della card
            </label>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-brand-yellow-400 hover:bg-brand-yellow-500 disabled:opacity-60 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm"
          >
            {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
            {uploading ? 'Caricamento...' : 'Seleziona foto'}
          </button>
          <p className="text-xs text-gray-400 mt-2">
            Puoi selezionare più immagini. Formati: JPG, PNG, WEBP. Max 10MB per foto.
          </p>
        </div>

        {/* Elenco foto */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Foto caricate ({sectionImages.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
          ) : sectionImages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
              <ImageIcon className="mx-auto mb-3" size={40} />
              <p>Nessuna foto in questa sezione.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sectionImages.map((img, idx) => (
                <div
                  key={img.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <img
                      src={img.image_url}
                      alt={img.title ?? ''}
                      className={`w-full h-full object-cover ${img.is_active ? '' : 'opacity-40'}`}
                      loading="lazy"
                    />
                    {img.is_cover && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 bg-brand-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                        <Star size={12} /> Copertina
                      </span>
                    )}
                    {!img.is_active && (
                      <span className="absolute top-2 right-2 bg-gray-800/80 text-white text-xs font-semibold px-2 py-1 rounded">
                        Nascosta
                      </span>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {img.title || <span className="text-gray-400 italic">Senza titolo</span>}
                    </p>
                    {img.description && (
                      <p className="text-xs text-gray-500 truncate">{img.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-1 mt-3">
                      {!isHero && !img.is_cover && (
                        <button
                          onClick={() => handleSetCover(img)}
                          title="Imposta come copertina"
                          className="p-2 rounded-lg text-gray-600 hover:bg-brand-yellow-100 hover:text-brand-yellow-700 transition-colors"
                        >
                          <Star size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(img)}
                        title="Modifica titolo/descrizione"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(img)}
                        title={img.is_active ? 'Nascondi dal sito' : 'Mostra sul sito'}
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {img.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleMove(img, 'up')}
                        disabled={idx === 0}
                        title="Sposta su"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMove(img, 'down')}
                        disabled={idx === sectionImages.length - 1}
                        title="Sposta giù"
                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(img)}
                        title="Elimina"
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors ml-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modale modifica */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Modifica dettagli</h3>
              <button
                onClick={() => setEditing(null)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <img
              src={editing.image_url}
              alt=""
              className="w-full h-40 object-cover rounded-lg mb-4"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Titolo</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-brand-yellow-400 focus:border-transparent outline-none"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-brand-yellow-400 focus:border-transparent outline-none"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={saveEdit}
                disabled={savingEdit}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-brand-yellow-400 hover:bg-brand-yellow-500 text-gray-900 transition-colors disabled:opacity-60"
              >
                {savingEdit && <Loader2 size={16} className="animate-spin" />}
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestioneSitoWeb;
