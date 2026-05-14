import React from "react";

const AuthBranding = () => {
    return (
        <div className="relative hidden h-full flex-col bg-muted p-8 text-white lg:flex overflow-hidden">
            {/* Cinematic Cosmic Background System */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                    src="https://images.aeonmedia.co/images/78ba87e7-7198-4468-81b5-500c505d5bc8/essay-gettyimages-1237093074.jpg?width=3840&quality=75&format=auto"
                    className="w-full h-full object-cover opacity-60 scale-105"
                    alt=""
                />
                {/* 1. Cinematic Dimming Layer */}
                <div className="absolute inset-0 bg-zinc-950/40" />

                {/* 2. Depth Vignette Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.8)_100%)]" />

                {/* 3. Text Readability Shield (Darker on the left) */}
                <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />

                {/* 4. SEYAL Identity Tint (Subtle Purple) */}
                <div className="absolute inset-0 bg-indigo-950/15 mix-blend-color" />

                {/* 5. Atmospheric Warm Glow (Sync with image energy) */}
                <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-orange-500/[0.03] to-transparent blur-3xl" />
            </div>

            {/* Branding Header */}
            <div className="relative z-20 flex items-center gap-3 text-xl font-bold tracking-tight">
                <div className="h-9 w-9 overflow-hidden rounded-full bg-white p-1.5 shadow-xl shadow-white/10 ring-1 ring-white/20">
                    <img
                        src="/SEYAL-LOGO.svg"
                        alt="SEYAL Logo"
                        className="h-full w-full object-contain"
                    />
                </div>
                <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    SEYAL
                </span>
            </div>

            {/* Hero Content */}
            <div className="relative z-20 mt-auto">
                <div className="space-y-3 max-w-sm">
                    <h1 className="text-4xl font-bold tracking-tighter leading-[1.1]">
                        Build. Learn.<br />
                        <span className="text-indigo-400">Create.</span>
                    </h1>
                    <p className="text-lg text-zinc-400 font-medium leading-relaxed">
                        SEYAL helps developers build, collaborate, and grow together in the most modern ecosystem.
                    </p>
                </div>

                {/* Decorative Feature List */}
                <div className="mt-8 flex gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Community</span>
                        <span className="text-xs font-medium text-zinc-300">Join 10k+ devs</span>
                    </div>
                    <div className="h-8 w-px bg-zinc-800" />
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Resources</span>
                        <span className="text-xs font-medium text-zinc-300">500+ Projects</span>
                    </div>
                </div>
            </div>

            {/* Footer Quote */}
            <div className="relative z-20 mt-auto pt-8 border-t border-white/5">
                <blockquote className="space-y-5">
                    <p className="text-base italic text-zinc-400 text-[14px]">
                        &ldquo;The best way to predict the future is to build it. <br /> Joining SEYAL was the first step in my developer journey.&rdquo;
                    </p>
                    <footer className="text-xs font-semibold text-zinc-500">
                        — Sukesh D, Founder of SEYAL
                    </footer>
                </blockquote>
            </div>
        </div>
    );
};

export default AuthBranding;
