import Link from "next/link";
import { ArrowRight, Calendar, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-rose-500" />
              <span className="font-bold">SyllabusSync</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/dashboard"
                className="transition-colors hover:text-foreground/80"
              >
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-rose-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Never miss a deadline again
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload your syllabi and automatically extract key dates,
                    deadlines, and exams into your calendar.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center w-full px-4 py-4">
                <img
                  src="/placeholder.svg?height=150&width=900"
                  alt="Student planner dashboard preview"
                  className="rounded-lg object-cover shadow-lg w-full max-w-5xl"
                  width={900}
                  height={150}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  How It Works
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SyllabusSync makes organizing your academic life simple in
                  just three steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <Card className="border-2 border-rose-100">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <Upload className="h-6 w-6 text-rose-500" />
                  </div>
                  <CardTitle>Upload Syllabi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Upload your course syllabi in PDF, Word, or text format.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-rose-100">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <FileText className="h-6 w-6 text-rose-500" />
                  </div>
                  <CardTitle>Automatic Parsing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Our algorithm extracts key dates, deadlines, and exam
                    information.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-rose-100">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <Calendar className="h-6 w-6 text-rose-500" />
                  </div>
                  <CardTitle>Sync Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Export to Google or Apple Calendar with a single click.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted/40">
        <div className="container flex flex-col gap-4 py-10">
          <div className="flex flex-col gap-4 md:gap-2 lg:gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-rose-500" />
              <span className="font-semibold">SyllabusSync</span>
            </Link>
            <p className="text-sm text-muted-foreground md:max-w-xs">
              Built by Cornell DTI
            </p>
          </div>
        </div>
        <div className="container py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} SyllabusSync. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
