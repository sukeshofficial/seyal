import React, { useState, useRef } from "react";
import { Camera, Upload, User, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const ProfileUpload = ({ onImageSelect, error, compact = false }) => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                return; // handle error via parent if needed
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                onImageSelect(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        setPreview(null);
        onImageSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={cn("flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in duration-500", compact ? "space-y-2 pb-2" : "pb-4")}>
            <div
                className={cn(
                    "relative group cursor-pointer ring-4 ring-offset-4 ring-offset-zinc-950 transition-all",
                    error ? "ring-red-500/20" : "ring-white/5 hover:ring-white/10",
                    "rounded-full p-1"
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <Avatar className={cn("border-2 border-white/10 shadow-2xl", compact ? "h-20 w-20" : "h-28 w-28")}>
                    {preview ? (
                        <AvatarImage src={preview} className="object-cover" />
                    ) : (
                        <AvatarFallback className="bg-zinc-900 border-2 border-dashed border-zinc-700">
                            <User className={cn("text-zinc-600", compact ? "h-7 w-7" : "h-10 w-10")} />
                        </AvatarFallback>
                    )}
                </Avatar>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <Camera className="h-8 w-8 text-white animate-in slide-in-from-bottom-2 duration-300" />
                </div>

                {/* Remove Button */}
                {preview && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-30"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}

                {/* Action Icon Badge */}
                {!preview && (
                    <div className="absolute bottom-0 right-0 bg-white dark:bg-zinc-900 p-2 rounded-full shadow-md border border-zinc-200 dark:border-zinc-800 ring-4 ring-white dark:ring-zinc-950">
                        <Upload className="h-4 w-4 text-zinc-500" />
                    </div>
                )}
            </div>

            <div className="text-center">
                <label className="text-sm font-semibold text-zinc-300">Profile Picture</label>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">PNG, JPG or WebP (max 5MB)</p>
                {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}
            </div>

            <input
                type="file"
                multiple={false}
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
            />
        </div>
    );
};

export default ProfileUpload;
