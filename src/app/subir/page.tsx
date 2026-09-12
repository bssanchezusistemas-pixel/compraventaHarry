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
  const [currentPreviewIdx, setCurrentPreviewIdx] = useState(0);
  const [hasAttemptedPublish, setHasAttemptedPublish] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5); // Máximo 5 fotos
    setSelectedFiles(files);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);
    setCurrentPreviewIdx(0);
    setExtracted(null);
    setPublishedSuccess(false);
    setErrorMsg("");
    setHasAttemptedPublish(false);
  };

  const removeImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    if (currentPreviewIdx >= updatedPreviews.length) {
      setCurrentPreviewIdx(Math.max(0, updatedPreviews.length - 1));
    }
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg("Por favor adjunta al menos una foto del producto.");
      return;
    }
    setIsAnalyzing(true);
    setErrorMsg("");
    setHasAttemptedPublish(false);

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
        const extra = data.debug ? ` (${data.debug})` : "";
        throw new Error((data.error || "No se pudo analizar el producto.") + extra);
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
    setHasAttemptedPublish(true);

    // Validación de campos clave requeridos
    const missing: string[] = [];
    if (!extracted.name?.trim()) missing.push("Nombre Comercial");
    if (!extracted.price?.trim()) missing.push("Precio (COP)");

    if (missing.length > 0) {
      setErrorMsg(`⚠️ Faltan datos obligatorios para publicar: ${missing.join(", ")}.`);
      return;
    }

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
        const extra = data.debug ? ` (${data.debug})` : "";
        throw new Error((data.error || "Error al publicar el producto.") + extra);
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
    setCurrentPreviewIdx(0);
    setUserText("");
    setExtracted(null);
    setPublishedSuccess(false);
    setErrorMsg("");
    setHasAttemptedPublish(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Formateador visual de precio para el mockup
  const formatDisplayPrice = (val: string) => {
    if (!val || !val.trim()) return "$FALTA PRECIO";
    const clean = val.replace(/[^\d.,]/g, "").trim();
    if (!clean) return "$FALTA PRECIO";
    return clean.startsWith("$") ? clean : `$${clean}`;
  };

  // Ayudante para verificar si un campo está vacío
  const isFieldMissing = (val: unknown) => {
    if (val === undefined || val === null) return true;
    if (typeof val === "string" && !val.trim()) return true;
    if (typeof val === "number" && isNaN(val)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white p-4 sm:p-6 flex flex-col items-center justify-start font-sans">
      {/* Header */}
      <header className="w-full max-w-4xl py-4 flex items-center justify-between border-b border-zinc-800/80 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <span>⚡ Subida Rápida con IA</span>
          </h1>
          <p className="text-xs text-zinc-400">Panel asistente para Compraventa Harry</p>
        </div>
        <a
          href="/"
          target="_blank"
          className="text-xs px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:border-red-500 transition"
        >
          Ver Catálogo Web ↗
        </a>
      </header>

      <main className="w-full max-w-4xl flex flex-col gap-6">
        {/* Notificación de Éxito */}
        {publishedSuccess && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-xl font-bold text-emerald-300">¡Producto Publicado con Éxito!</h2>
              <p className="text-sm text-zinc-300 mt-1 max-w-md">
                <b>{extracted?.name}</b> ya se encuentra visible en el catálogo oficial en la categoría{" "}
                <b>{extracted?.category.toUpperCase()}</b>.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition shadow-lg"
              >
                + Subir Otro Producto
              </button>
              <a
                href="/#catalogo"
                target="_blank"
                className="py-3 px-4 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-zinc-300 font-semibold rounded-xl text-sm transition text-center"
              >
                Ver en la Web ↗
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
                  <span className="text-sm font-semibold text-zinc-300">Toca para tomar foto o elegir de la galería</span>
                  <span className="text-xs text-zinc-500 mt-1">Puedes subir hasta 5 fotos para el slider</span>
                </label>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentPreviewIdx(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition group ${
                        idx === currentPreviewIdx ? "border-red-500 ring-2 ring-red-500/40" : "border-zinc-700 hover:border-zinc-500"
                      }`}
                    >
                      <Image src={src} alt={`preview ${idx}`} fill className="object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-black/80 text-[10px] text-amber-400 px-1.5 py-0.5 rounded font-bold">
                          Portada
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
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
                ✍️ 2. Pega la información o precio
              </label>
              <textarea
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                placeholder="Ejemplo: Tobillera Oro🇨🇴 Rustico 💲7,6 Gr📏28 Cm🤑3’200.000, o Yamaha YZ 85 0km modelo 2027..."
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

            {/* Mensaje de error / advertencia */}
            {errorMsg && (
              <div className="bg-red-950/60 border border-red-600 text-red-200 text-sm p-4 rounded-xl flex items-center gap-2 animate-in fade-in">
                <span className="text-xl">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 3. VISTA PREVIA IDÉNTICA AL CATÁLOGO WEB + EDICIÓN */}
            {extracted && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
                {/* COLUMNA IZQUIERDA: TARJETA EXACTA DE LA WEB */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <span>👁️ Vista Previa en Vivo</span>
                    </span>
                    <span className="text-[10px] bg-red-600/20 text-red-400 px-2 py-0.5 rounded font-bold uppercase">
                      Como saldrá en la web
                    </span>
                  </div>

                  {/* MOCKUP CARD IDENTICO A CATALOG-CARD */}
                  <article className="catalog-card reveal active w-full max-w-sm shadow-2xl border border-zinc-800">
                    <div className={`card-img-wrap ${previews.length > 1 ? "has-slider" : ""}`}>
                      <div className="card-overlay" />
                      {previews.length > 0 ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={previews[currentPreviewIdx] || previews[0]}
                            alt={extracted.name}
                            fill
                            className="object-cover"
                          />
                          {previews.length > 1 && (
                            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
                              {previews.map((_, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setCurrentPreviewIdx(i)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    i === currentPreviewIdx ? "bg-red-500 w-5" : "bg-white/50"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="card-img-placeholder">
                          <span>🏍️</span>
                          <p>Sin imagen</p>
                        </div>
                      )}
                    </div>

                    <div className="card-body">
                      <h3 className="card-title">{extracted.name || "NOMBRE DEL PRODUCTO"}</h3>

                      {/* BADGES SEGUN CATEGORIA */}
                      <div className="card-specs">
                        {extracted.category === "oro" ? (
                          <>
                            <span className="spec-badge">{extracted.karats || "ORO 18K"}</span>
                            {extracted.weight && <span className="spec-badge">{extracted.weight}</span>}
                          </>
                        ) : (
                          <>
                            {extracted.model_year && (
                              <span className="spec-badge">AÑO {extracted.model_year}</span>
                            )}
                            <span className="spec-badge">{extracted.kilometers || "0 KM"}</span>
                          </>
                        )}
                      </div>

                      <div className="card-price-wrap">
                        <span className="price-label">Precio</span>
                        <span className={`price-tag ${isFieldMissing(extracted.price) ? "text-amber-400 font-normal text-base" : ""}`}>
                          {formatDisplayPrice(extracted.price)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="btn-card opacity-90 cursor-default"
                      >
                        CONSULTAR DISPONIBILIDAD
                      </button>
                    </div>
                  </article>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO DE EDICION Y APROBACION */}
                <div className="lg:col-span-7 bg-[#121217] border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                        <span>✏️ Datos Detectados (Edita si es necesario)</span>
                      </h3>
                      <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full font-bold uppercase">
                        {extracted.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* NOMBRE COMERCIAL */}
                      <div className="sm:col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-zinc-300 font-semibold">Nombre Comercial</label>
                          {isFieldMissing(extracted.name) && (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                              ● Falta información
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={extracted.name}
                          onChange={(e) => setExtracted({ ...extracted, name: e.target.value })}
                          className={`w-full bg-zinc-950 rounded-lg p-2.5 text-white font-bold transition focus:outline-none ${
                            isFieldMissing(extracted.name)
                              ? "border-2 border-red-500/80 bg-red-950/20 text-red-200 placeholder-red-400/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                              : "border border-zinc-700 focus:border-red-500"
                          }`}
                          placeholder="Ej: Yamaha YZ 85 o Tobillera Oro Rústico"
                        />
                      </div>

                      {/* PRECIO */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-zinc-300 font-semibold">Precio (COP)</label>
                          {isFieldMissing(extracted.price) && (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                              ● Falta precio
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={extracted.price}
                          onChange={(e) => setExtracted({ ...extracted, price: e.target.value })}
                          className={`w-full bg-zinc-950 rounded-lg p-2.5 font-bold transition focus:outline-none ${
                            isFieldMissing(extracted.price)
                              ? "border-2 border-red-500/90 bg-red-950/20 text-red-300 placeholder-red-400/60 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
                              : "border border-zinc-700 text-red-400 focus:border-red-500"
                          }`}
                          placeholder="Ej. 3.200.000 o 9.800.000"
                        />
                      </div>

                      {/* CATEGORIA */}
                      <div>
                        <label className="text-zinc-300 block mb-1 font-semibold">Categoría Web</label>
                        <select
                          value={extracted.category}
                          onChange={(e) => {
                            const cat = e.target.value as any;
                            const type = cat === "oro" ? "oro" : (cat === "repuestos" || cat === "accesorios" ? "servicio" : "vehiculo");
                            setExtracted({ ...extracted, category: cat, type });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                        >
                          <option value="moto">🏍️ Moto</option>
                          <option value="carro">🚗 Carro</option>
                          <option value="oro">✨ Oro / Joyería</option>
                          <option value="alquiler">🔑 Alquiler</option>
                          <option value="repuestos">🔧 Repuestos</option>
                          <option value="accesorios">🛡️ Accesorios</option>
                        </select>
                      </div>

                      {/* CAMPOS ESPECIFICOS PARA ORO */}
                      {extracted.category === "oro" && (
                        <>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-zinc-300 font-semibold">Kilates</label>
                              {isFieldMissing(extracted.karats) && (
                                <span className="text-[10px] font-bold text-amber-400">● Opcional / Sugerido</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={extracted.karats || "Oro 18k"}
                              onChange={(e) => setExtracted({ ...extracted, karats: e.target.value })}
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                              placeholder="Ej: Oro 18k"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-zinc-300 font-semibold">Peso / Medida</label>
                              {isFieldMissing(extracted.weight) && (
                                <span className="text-[10px] font-bold text-red-400">● Falta peso</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={extracted.weight || ""}
                              onChange={(e) => setExtracted({ ...extracted, weight: e.target.value })}
                              placeholder="Ej: 7,6 Gr · 28 Cm"
                              className={`w-full bg-zinc-950 rounded-lg p-2.5 text-white transition focus:outline-none ${
                                isFieldMissing(extracted.weight)
                                  ? "border-2 border-red-500/80 bg-red-950/20 text-red-200 placeholder-red-400/50"
                                  : "border border-zinc-700 focus:border-red-500"
                              }`}
                            />
                          </div>
                        </>
                      )}

                      {/* CAMPOS ESPECIFICOS PARA VEHICULOS */}
                      {(extracted.category === "moto" || extracted.category === "carro" || extracted.category === "alquiler") && (
                        <>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-zinc-300 font-semibold">Año / Modelo</label>
                              {isFieldMissing(extracted.model_year) && (
                                <span className="text-[10px] font-bold text-red-400">● Falta año</span>
                              )}
                            </div>
                            <input
                              type="number"
                              value={extracted.model_year || ""}
                              onChange={(e) => setExtracted({ ...extracted, model_year: e.target.value ? Number(e.target.value) : undefined })}
                              placeholder="Ej. 2027"
                              className={`w-full bg-zinc-950 rounded-lg p-2.5 text-white transition focus:outline-none ${
                                isFieldMissing(extracted.model_year)
                                  ? "border-2 border-red-500/80 bg-red-950/20 text-red-200 placeholder-red-400/50"
                                  : "border border-zinc-700 focus:border-red-500"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-zinc-300 font-semibold">Kilometraje</label>
                              {isFieldMissing(extracted.kilometers) && (
                                <span className="text-[10px] font-bold text-red-400">● Falta km</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={extracted.kilometers || ""}
                              onChange={(e) => setExtracted({ ...extracted, kilometers: e.target.value })}
                              placeholder="Ej. 0 km o 10.000 km"
                              className={`w-full bg-zinc-950 rounded-lg p-2.5 text-white transition focus:outline-none ${
                                isFieldMissing(extracted.kilometers)
                                  ? "border-2 border-red-500/80 bg-red-950/20 text-red-200 placeholder-red-400/50"
                                  : "border border-zinc-700 focus:border-red-500"
                              }`}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-zinc-300 font-semibold">Papeles Hasta</label>
                              {isFieldMissing(extracted.paper_until) && (
                                <span className="text-[10px] font-bold text-amber-400/90">● Opcional (Vacío si no aplica)</span>
                              )}
                            </div>
                            <input
                              type="text"
                              value={extracted.paper_until || ""}
                              onChange={(e) => setExtracted({ ...extracted, paper_until: e.target.value })}
                              placeholder="Ej. Diciembre 2026 / Al día"
                              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:border-red-500 focus:outline-none"
                            />
                          </div>
                        </>
                      )}

                      <div className="sm:col-span-2">
                        <label className="text-zinc-300 block mb-1 font-semibold">Descripción o Detalles</label>
                        <textarea
                          value={extracted.description || ""}
                          onChange={(e) => setExtracted({ ...extracted, description: e.target.value })}
                          rows={2}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white resize-none focus:border-red-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTONES DE ACCION FINAL */}
                  <div className="pt-4 mt-4 border-t border-zinc-800 flex gap-3">
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
                          <span>Publicando en la Web...</span>
                        </>
                      ) : (
                        <>
                          <span>✅ Confirmar y Publicar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="mt-3 bg-red-950/80 border border-red-600 text-red-200 text-xs p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                      <span className="text-lg">⚠️</span>
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
