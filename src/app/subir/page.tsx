"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ExtractedProduct } from "@/lib/agent/types";

export default function SubirRapidoPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [userText, setUserText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedProduct | null>(null);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5); // Máximo 5 fotos
    setSelectedFiles(files);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    setExtracted(null);
    setPublishedSuccess(false);
    setErrorMsg("");
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg("Por favor adjunta al menos una foto del producto.");
      return;
    }
    setIsAnalyzing(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("action", "extract");
      formData.append("text", userText);
      selectedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/agent/draft", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "No se pudo analizar el producto.");
      }

      setExtracted(data.product);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al conectar con la Inteligencia Artificial.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublish = async () => {
    if (!extracted || selectedFiles.length === 0) return;
    setIsPublishing(true);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("action", "publish");
      formData.append("product", JSON.stringify(extracted));
      selectedFiles.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/agent/draft", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Error al publicar el producto.");
      }

      setPublishedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo publicar el producto.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setUserText("");
    setExtracted(null);
    setPublishedSuccess(false);
    setErrorMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white p-4 sm:p-6 flex flex-col items-center justify-start font-sans">
      {/* Header */}
      <header className="w-full max-w-xl py-4 flex items-center justify-between border-b border-zinc-800/80 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>⚡ Subida Rápida</span>
          </h1>
          <p className="text-xs text-zinc-400">Asistente IA Compraventa Harry</p>
        </div>
        <a
          href="/"
          target="_blank"
          className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500 transition"
        >
          Ver Web ↗
        </a>
      </header>

      <main className="w-full max-w-xl flex flex-col gap-6">
        {/* Notificación de Éxito */}
        {publishedSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-6 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-2xl font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-300">¡Producto Publicado con Éxito!</h2>
              <p className="text-sm text-zinc-300 mt-1">
                Ya está disponible en la categoría <b>{extracted?.category.toUpperCase()}</b> de tu catálogo web.
              </p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition"
              >
                + Subir Otro Producto
              </button>
              <a
                href="/#catalogo"
                target="_blank"
                className="py-3 px-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition"
              >
                Ver en la Web
              </a>
            </div>
          </div>
        )}

        {!publishedSuccess && (
          <>
            {/* 1. SELECCIÓN DE FOTOS (Hasta 5) */}
            <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <span>📸 1. Fotos del Producto</span>
                  <span className="text-xs text-red-400 font-normal">({selectedFiles.length}/5 máx)</span>
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    + Agregar más
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              {previews.length === 0 ? (
                <label
                  htmlFor="file-upload"
                  className="w-full h-40 border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition bg-zinc-900/40 hover:bg-zinc-900/80 group"
                >
                  <span className="text-3xl mb-2 group-hover:scale-110 transition">📷</span>
                  <span className="text-sm font-semibold text-zinc-300">Toca para tomar foto o elegir</span>
                  <span className="text-xs text-zinc-500 mt-1">Puedes seleccionar hasta 5 fotos</span>
                </label>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-700 group">
                      <Image src={src} alt={`preview ${idx}`} fill className="object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/80 text-[10px] text-amber-400 px-1.5 py-0.5 rounded font-bold">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {previews.length < 5 && (
                    <label
                      htmlFor="file-upload"
                      className="aspect-square border-2 border-dashed border-zinc-700 hover:border-red-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition text-zinc-400 hover:text-white"
                    >
                      <span className="text-xl">+</span>
                      <span className="text-[10px]">Añadir</span>
                    </label>
                  )}
                </div>
              )}
            </div>

            {/* 2. TEXTO INFORMAL O AUDIO */}
            <div className="bg-[#0f0f12] border border-zinc-800 rounded-2xl p-5 shadow-xl">
              <label className="text-sm font-bold uppercase tracking-wider text-zinc-300 block mb-2">
                ✍️ 2. Pega los detalles o precio
              </label>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Ejemplo: Tobillera Oro Rustico 7,6 Gr 28 Cm $3'200.000, o Nmax 2024 blanca papeles dic 2026..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 resize-none transition"
              />
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || selectedFiles.length === 0}
                className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin text-lg">⚙️</span>
                    <span>Analizando con Inteligencia Artificial...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Analizar y Estructurar Ficha</span>
                  </>
                )}
              </button>
            </div>

            {/* Mensaje de error */}
            {errorMsg && (
              <div className="bg-red-950/60 border border-red-800/80 text-red-200 text-sm p-4 rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* 3. FICHA EDITABLE Y CONFIRMACIÓN */}
            {extracted && (
              <div className="bg-[#121217] border-2 border-red-600/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                    <span>🔍 Ficha Detectada (Puedes editarla)</span>
                  </h3>
                  <span className="text-[11px] bg-red-600/20 text-red-300 px-2.5 py-1 rounded-full font-bold uppercase">
                    {extracted.category}
                  </span>
                </div>

                {/* Campos organizados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Nombre del Producto</label>
                    <input
                      type="text"
                      value={extracted.name}
                      onChange={(e) => setExtracted({ ...extracted, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Precio (COP)</label>
                    <input
                      type="text"
                      value={extracted.price}
                      onChange={(e) => setExtracted({ ...extracted, price: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-emerald-400 font-bold"
                      placeholder="Ej. 3.200.000"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 font-semibold">Categoría Web</label>
                    <select
                      value={extracted.category}
                      onChange={(e) => {
                        const cat = e.target.value as any;
                        const type = cat === "oro" ? "oro" : (cat === "repuestos" || cat === "accesorios" ? "servicio" : "vehiculo");
                        setExtracted({ ...extracted, category: cat, type });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white"
                    >
                      <option value="moto">🏍️ Moto</option>
                      <option value="carro">🚗 Carro</option>
                      <option value="oro">✨ Oro / Joyería</option>
                      <option value="alquiler">🔑 Alquiler</option>
                      <option value="repuestos">🔧 Repuestos</option>
                      <option value="accesorios">🛡️ Accesorios</option>
                    </select>
                  </div>

                  {extracted.category === "oro" && (
                    <>
                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Kilates</label>
                        <input
                          type="text"
                          value={extracted.karats || "Oro 18k"}
                          onChange={(e) => setExtracted({ ...extracted, karats: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-zinc-400 block mb-1 font-semibold">Peso / Medidas</label>
                        <input
                          type="text"
                          value={extracted.weight || ""}
                          onChange={(e) => setExtracted({ ...extracted, weight: e.target.value })}
                          placeholder="Ej: 7,6 Gr - 28 Cm"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                    </>
                  )}

                  {(extracted.category === "moto" || extracted.category === "carro" || extracted.category === "alquiler") && (
                    <>
                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Año / Modelo</label>
                        <input
                          type="number"
                          value={extracted.model_year || ""}
                          onChange={(e) => setExtracted({ ...extracted, model_year: Number(e.target.value) })}
                          placeholder="Ej. 2024"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Kilometraje</label>
                        <input
                          type="text"
                          value={extracted.kilometers || ""}
                          onChange={(e) => setExtracted({ ...extracted, kilometers: e.target.value })}
                          placeholder="Ej. 12.500 km"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-zinc-400 block mb-1 font-semibold">Papeles Hasta</label>
                        <input
                          type="text"
                          value={extracted.paper_until || ""}
                          onChange={(e) => setExtracted({ ...extracted, paper_until: e.target.value })}
                          placeholder="Ej. Diciembre 2026"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white"
                        />
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1 font-semibold">Descripción Comercial</label>
                    <textarea
                      value={extracted.description || ""}
                      onChange={(e) => setExtracted({ ...extracted, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white resize-none"
                    />
                  </div>
                </div>

                {/* BOTÓN FINAL DE PUBLICACIÓN */}
                <div className="pt-2 border-t border-zinc-800 flex gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-1/3 py-3 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold rounded-xl text-xs transition"
                  >
                    Descartar
                  </button>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="w-2/3 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                  >
                    {isPublishing ? (
                      <>
                        <span className="animate-spin">⚙️</span>
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <span>✅ Confirmar y Publicar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
