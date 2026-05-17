import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, LoaderIcon, Upload, User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPT_ATTRIBUTE = "image/png,image/jpeg,image/jpg,image/webp";

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const baseContainerClass = "flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500";
const uploadTriggerBaseClass = "group relative rounded-full p-1 ring-4 ring-offset-4 ring-offset-zinc-950 transition-all";
const avatarBaseClass = "border-2 border-white/10 shadow-2xl";
const overlayClass = "absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100";
const cameraIconClass = "h-8 w-8 animate-in slide-in-from-bottom-2 duration-300 text-white";
const loaderContainerClass = "absolute inset-0 z-50 flex items-center justify-center";
const loaderIconClass = "h-8 w-8 animate-spin text-indigo-400";
const removeButtonClass = "absolute -top-1 -right-1 z-30 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-colors hover:bg-red-600 disabled:pointer-events-none disabled:opacity-50";
const removeButtonIconClass = "h-3 w-3";
const uploadBadgeClass = "absolute bottom-0 right-0 rounded-full border border-zinc-200 bg-white p-2 shadow-md ring-4 ring-white dark:border-zinc-800 dark:bg-zinc-900 dark:ring-zinc-950";
const uploadBadgeIconClass = "h-4 w-4 text-zinc-500";
const labelClass = "text-sm font-semibold text-zinc-300";
const helperTextClass = "mt-1 text-[10px] uppercase tracking-widest text-zinc-500";
const errorTextClass = "mt-2 text-xs font-medium text-red-500";
const fallbackClass = "border-2 border-dashed border-zinc-700 bg-zinc-900";

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

const validateImageFile = (file) => {
  if (!file) return "No file selected.";

  const isValidMimeType = ACCEPTED_IMAGE_TYPES.includes(file.type);
  if (!isValidMimeType) return "Only PNG, JPG, JPEG, or WebP images are allowed.";

  const exceedsSizeLimit = file.size > MAX_FILE_SIZE_BYTES;
  if (exceedsSizeLimit) return "Image size must be less than 5MB.";

  return null;
};

const verifyImageIntegrity = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(true);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Corrupted or invalid image file."));
    };

    image.src = objectUrl;
  });

/* -------------------------------------------------------------------------- */
/*                              Profile Upload                                */
/* -------------------------------------------------------------------------- */

/**
 * @param {Object} props
 * @param {(file: File | null) => void} props.onImageSelect
 * @param {string} [props.error]
 * @param {boolean} [props.compact=false]
 * @param {boolean} [props.isUploading=false]
 * @param {string} [props.label="Profile Picture"]
 */
const ProfileUpload = ({
  onImageSelect = () => { },
  error = "",
  compact = false,
  isUploading = false,
  label = "Profile Picture",
}) => {
  const inputId = useId();
  const fileInputRef = useRef(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState("");

  const resolvedError = localError || error;

  /* ---------------------------------------------------------------------- */
  /*                               Computed UI                              */
  /* ---------------------------------------------------------------------- */

  const containerClass = cn(baseContainerClass, compact ? "space-y-2 pb-2" : "space-y-4 pb-4");
  const uploadTriggerClass = cn(
    uploadTriggerBaseClass,
    resolvedError ? "ring-red-500/20" : "ring-white/5 hover:ring-white/10",
    isUploading && "cursor-not-allowed opacity-90"
  );
  const avatarClass = cn(avatarBaseClass, compact ? "h-20 w-20" : "h-28 w-28");
  const avatarImageClass = cn("object-cover", isUploading && "opacity-40 blur-sm");
  const userIconClass = cn("text-zinc-600", compact ? "h-7 w-7" : "h-10 w-10");

  /* ---------------------------------------------------------------------- */
  /*                               Side Effects                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  /* ---------------------------------------------------------------------- */
  /*                                 Actions                                 */
  /* ---------------------------------------------------------------------- */

  const resetInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const clearPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
  }, [previewUrl]);

  const openFilePicker = useCallback(() => {
    if (isUploading) return;

    fileInputRef.current?.click();
  }, [isUploading]);

  const handleKeyDown = useCallback(
    (event) => {
      const isKeyboardTrigger = event.key === "Enter" || event.key === " ";

      if (isKeyboardTrigger && !isUploading) {
        event.preventDefault();
        openFilePicker();
      }
    },
    [isUploading, openFilePicker]
  );

  const handleImageChange = useCallback(async (event) => {
    const file = event.target.files?.[0];

    setLocalError("");

    const validationError = validateImageFile(file);

    if (validationError) {
      clearPreview();
      resetInput();
      setLocalError(validationError);
      onImageSelect(null);

      return;
    }

    try {
      await verifyImageIntegrity(file);

      clearPreview();

      const nextPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(nextPreviewUrl);

      onImageSelect(file);
    } catch (uploadError) {
      clearPreview();
      resetInput();
      setLocalError(uploadError.message || "Failed to process image.");
      onImageSelect(null);
    }
  },
    [
      clearPreview,
      onImageSelect,
      resetInput,
    ]
  );

  const handleRemove = useCallback((event) => {
    event.stopPropagation();

    clearPreview();
    resetInput();

    setLocalError("");

    onImageSelect(null);
  },
    [
      clearPreview,
      onImageSelect,
      resetInput,
    ]
  );

  return (
    <div className={containerClass}>
      <button
        type="button"
        aria-label="Upload profile picture"
        aria-disabled={isUploading}
        disabled={isUploading}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        className={uploadTriggerClass}
      >
        <Avatar className={avatarClass}>
          {previewUrl ? (
            <AvatarImage
              src={previewUrl}
              alt="Selected profile preview"
              className={avatarImageClass}
            />
          ) : (
            <AvatarFallback className={fallbackClass}>
              <User
                aria-hidden="true"
                className={userIconClass}
              />
            </AvatarFallback>
          )}
        </Avatar>

        {isUploading && (
          <div className={loaderContainerClass}>
            <LoaderIcon className={loaderIconClass} />
          </div>
        )}

        {!isUploading && (
          <div
            aria-hidden="true"
            className={overlayClass}
          >
            <Camera className={cameraIconClass} />
          </div>
        )}

        {previewUrl && (
          <button
            type="button"
            aria-label="Remove profile image"
            disabled={isUploading}
            onClick={handleRemove}
            className={removeButtonClass}
          >
            <X className={removeButtonIconClass} />
          </button>
        )}

        {!previewUrl && (
          <div
            aria-hidden="true"
            className={uploadBadgeClass}
          >
            <Upload className={uploadBadgeIconClass} />
          </div>
        )}
      </button>

      <div className="text-center">
        <label
          htmlFor={inputId}
          className={labelClass}
        >
          {label}
        </label>

        <p className={helperTextClass}>
          PNG, JPG or WebP (max 5MB)
        </p>

        {resolvedError && (
          <p
            role="alert"
            aria-live="polite"
            className={errorTextClass}
          >
            {resolvedError}
          </p>
        )}
      </div>

      <input
        hidden
        id={inputId}
        type="file"
        multiple={false}
        ref={fileInputRef}
        accept={ACCEPT_ATTRIBUTE}
        disabled={isUploading}
        onChange={handleImageChange}
      />
    </div>
  );
};

export default React.memo(ProfileUpload);
