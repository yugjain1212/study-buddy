import { Suspense, lazy, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Planner = lazy(() => import("./pages/Planner"));
const Tutor = lazy(() => import("./pages/Tutor"));
const Quizzes = lazy(() => import("./pages/Quizzes"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  // Initialize scroll-based animations once on mount
  useEffect(() => {
    AOS.init({
      duration: 800,          // animation length
      once: true,             // only animate first time in view
      offset: 100,            // trigger a bit before element enters viewport
    });

    // Map existing custom animation utility classes to AOS types
    const mappings: [string, string][] = [
      ["animate-slide-in-up", "slide-up"],
      ["animate-slide-in-right", "slide-right"],
      ["animate-fade-in", "fade"],
    ];

    mappings.forEach(([cls, aos]) => {
      document.querySelectorAll(`.${cls}`).forEach((el) => {
        if (!el.hasAttribute("data-aos")) {
          el.setAttribute("data-aos", aos);
        }
      });
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="study-buddy-theme">
        <TooltipProvider>
          <BrowserRouter>
            <div className="min-h-screen">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/tutor" element={<Tutor />} />
                  <Route path="/quizzes" element={<Quizzes />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
