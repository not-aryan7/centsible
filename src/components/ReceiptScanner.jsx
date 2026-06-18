import { useState, useRef, useCallback, useEffect } from "react";
import { MaterialIcon, CATEGORIES } from "../utils/dashboardUtils";
import { scanReceipt } from "../services/ai";

export default function ReceiptScanner({ open, onClose, onScanned }) {
  const [mode, setMode] = useState("choose"); // choose | camera | preview | scanning | result
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [editResult, setEditResult] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup camera on close
  useEffect(() => {
    if (!open) {
      stopCamera();
      setMode("choose");
      setImageData(null);
      setResult(null);
      setError("");
      setEditResult(null);
    }
  }, [open]);

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  async function startCamera() {
    setError("");
    setMode("camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied. Try uploading a photo instead.");
      setMode("choose");
    }
  }

  function resizeAndCompressImage(dataUrl, maxDimension = 800, quality = 0.6) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = dataUrl;
    });
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
    stopCamera();
    
    // Compress before setting
    resizeAndCompressImage(dataUrl).then((compressedDataUrl) => {
      setImageData(compressedDataUrl);
      setMode("preview");
    });
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const compressedDataUrl = await resizeAndCompressImage(ev.target.result);
      setImageData(compressedDataUrl);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!imageData) return;
    setMode("scanning");
    setError("");

    try {
      // Extract base64 data (remove the data:image/...;base64, prefix)
      const base64 = imageData.split(",")[1];
      const data = await scanReceipt(base64);
      setResult(data);
      setEditResult({
        desc: data.merchant || "",
        amount: data.amount ? String(data.amount) : "",
        category: CATEGORIES.includes(data.category) ? data.category : "Other",
      });
      setMode("result");
    } catch (err) {
      console.error("Scan error:", err);
      setError(err.message || "Failed to scan receipt. Try a clearer photo.");
      setMode("preview");
    }
  }

  function handleConfirm() {
    if (!editResult) return;
    onScanned({
      desc: editResult.desc,
      amount: editResult.amount,
      category: editResult.category,
    });
    onClose();
  }

  function handleRetake() {
    setImageData(null);
    setResult(null);
    setEditResult(null);
    setError("");
    setMode("choose");
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:w-[480px] sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ border: "1px solid rgba(0,0,0,0.06)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#e8603a] to-[#c94e2a] text-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MaterialIcon name="document_scanner" className="text-xl" fill />
            </div>
            <div>
              <h3 className="font-bold font-headline text-sm">Receipt Scanner</h3>
              <p className="text-[10px] text-white/70 uppercase tracking-widest font-semibold">AI Powered</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          >
            <MaterialIcon name="close" className="text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-[#ef4444]/10 text-[#ef4444] rounded-2xl px-4 py-3 mb-4">
              <MaterialIcon name="error" className="text-lg" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Choose mode */}
          {mode === "choose" && (
            <div className="space-y-4">
              <p className="text-sm text-[#5a6063] text-center mb-6">
                Snap a photo or upload a receipt to auto-fill your transaction.
              </p>
              <button
                onClick={startCamera}
                className="w-full flex items-center gap-4 p-5 bg-[#f5f5f7] rounded-2xl hover:bg-[#eef0f3] transition-colors group"
              >
                <div className="w-14 h-14 bg-[#e8603a]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#e8603a]/20 transition-colors">
                  <MaterialIcon name="photo_camera" className="text-2xl text-[#e8603a]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Take a Photo</p>
                  <p className="text-[10px] text-[#5a6063]">Use your camera to snap a receipt</p>
                </div>
                <MaterialIcon name="arrow_forward" className="text-lg text-[#adb3b6] ml-auto" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 bg-[#f5f5f7] rounded-2xl hover:bg-[#eef0f3] transition-colors group"
              >
                <div className="w-14 h-14 bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#8b5cf6]/20 transition-colors">
                  <MaterialIcon name="upload_file" className="text-2xl text-[#8b5cf6]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold">Upload Image</p>
                  <p className="text-[10px] text-[#5a6063]">Choose from your photo library</p>
                </div>
                <MaterialIcon name="arrow_forward" className="text-lg text-[#adb3b6] ml-auto" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera view */}
          {mode === "camera" && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
                  <div className="absolute top-8 left-8 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-xl" />
                  <div className="absolute top-8 right-8 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-xl" />
                  <div className="absolute bottom-8 left-8 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-xl" />
                  <div className="absolute bottom-8 right-8 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-xl" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => { stopCamera(); setMode("choose"); }}
                  className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#eef0f3] transition-colors"
                >
                  <MaterialIcon name="close" className="text-xl text-[#5a6063]" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-[#e8603a] flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                  style={{ boxShadow: "0 4px 20px rgba(232,96,58,0.3)" }}
                >
                  <div className="w-12 h-12 rounded-full border-3 border-white" />
                </button>
                <button
                  onClick={() => { stopCamera(); fileInputRef.current?.click(); }}
                  className="w-12 h-12 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#eef0f3] transition-colors"
                >
                  <MaterialIcon name="photo_library" className="text-xl text-[#5a6063]" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => { stopCamera(); handleFileUpload(e); }}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* Preview */}
          {mode === "preview" && imageData && (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden bg-[#f5f5f7]">
                <img src={imageData} alt="Receipt" className="w-full object-contain max-h-[400px]" />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3.5 bg-[#f5f5f7] text-[#5a6063] rounded-full font-semibold text-sm hover:bg-[#eef0f3] transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={handleScan}
                  className="flex-1 py-3.5 bg-[#e8603a] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ boxShadow: "0 4px 16px rgba(232,96,58,0.25)" }}
                >
                  <MaterialIcon name="document_scanner" className="text-base" />
                  Scan Receipt
                </button>
              </div>
            </div>
          )}

          {/* Scanning */}
          {mode === "scanning" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-20 h-20 bg-[#e8603a]/10 rounded-full flex items-center justify-center relative">
                <MaterialIcon name="document_scanner" className="text-3xl text-[#e8603a]" />
                <div className="absolute inset-0 rounded-full border-2 border-[#e8603a]/30 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-bold text-center">Scanning receipt...</p>
                <p className="text-[10px] text-[#5a6063] text-center mt-1">AI is reading your receipt</p>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#e8603a]"
                    style={{
                      animation: "centsi-bounce 1.4s ease-in-out infinite",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <style>{`
                @keyframes centsi-bounce {
                  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                  40% { transform: translateY(-6px); opacity: 1; }
                }
              `}</style>
            </div>
          )}

          {/* Result */}
          {mode === "result" && editResult && (
            <div className="space-y-4">
              {/* Success header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                  <MaterialIcon name="check_circle" className="text-xl text-[#10b981]" fill />
                </div>
                <div>
                  <p className="text-sm font-bold">Receipt Scanned!</p>
                  <p className="text-[10px] text-[#5a6063]">Review and edit before adding</p>
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-1.5 block">
                    Merchant / Description
                  </label>
                  <input
                    type="text"
                    value={editResult.desc}
                    onChange={(e) => setEditResult((prev) => ({ ...prev, desc: e.target.value }))}
                    className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all"
                    placeholder="Merchant name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-1.5 block">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editResult.amount}
                      onChange={(e) => setEditResult((prev) => ({ ...prev, amount: e.target.value }))}
                      className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-3.5 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#e8603a]/20 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[#5a6063] uppercase tracking-wider mb-1.5 block">
                      Category
                    </label>
                    <select
                      value={editResult.category}
                      onChange={(e) => setEditResult((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-[#f5f5f7] rounded-2xl px-5 py-3.5 text-sm font-medium focus:outline-none appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Thumbnail */}
              {imageData && (
                <div className="flex items-center gap-3 bg-[#f5f5f7] rounded-2xl p-3">
                  <img
                    src={imageData}
                    alt="Receipt"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-[#5a6063] font-medium truncate">Scanned receipt</p>
                    <p className="text-[9px] text-[#adb3b6]">Tap retake to scan again</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3.5 bg-[#f5f5f7] text-[#5a6063] rounded-full font-semibold text-sm hover:bg-[#eef0f3] transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!editResult.desc || !editResult.amount}
                  className="flex-1 py-3.5 bg-[#e8603a] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                  style={{ boxShadow: "0 4px 16px rgba(232,96,58,0.25)" }}
                >
                  <MaterialIcon name="add" className="text-base" />
                  Add Transaction
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
