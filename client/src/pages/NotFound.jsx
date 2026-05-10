import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <section className="flex h-full w-full items-center justify-center overflow-hidden bg-background text-foreground">
            <div className="flex w-full max-w-screen-md flex-col items-center justify-center px-4 text-center">
                <img
                    className="mx-auto mb-4 w-full max-w-xs sm:max-w-sm md:max-w-md object-contain"
                    style={{ maxHeight: "35vh" }}
                    src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/404/404-computer.svg"
                    alt="404 Not Found Illustration"
                />
                <h1 className="mb-2 text-6xl font-extrabold tracking-tight sm:text-8xl">
                    <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-500 bg-clip-text text-transparent">
                        404
                    </span>
                </h1>
                <p className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
                    Whoops! That page is missing.
                </p>
                <p className="mb-6 text-base font-medium text-muted-foreground sm:text-lg">
                    Sorry, we can't find that page. It might have been moved or deleted.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                </Link>
            </div>
        </section>
    );
}
