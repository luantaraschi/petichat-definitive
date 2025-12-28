import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useAuthStore } from '@/stores/auth';

// Layouts
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { WizardPage } from '@/pages/wizard/WizardPage';
import { DocumentEditorPage } from '@/pages/DocumentEditorPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { CasesPage } from '@/pages/CasesPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

// Public Route Component (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <AuthLayout>
                                <LoginPage />
                            </AuthLayout>
                        </PublicRoute>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <PublicRoute>
                            <AuthLayout>
                                <RegisterPage />
                            </AuthLayout>
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardPage />} />
                    <Route path="templates" element={<TemplatesPage />} />
                    <Route path="cases" element={<CasesPage />} />
                    <Route path="wizard/:templateId" element={<WizardPage />} />
                    <Route path="document/:documentId" element={<DocumentEditorPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global Toaster for notifications */}
            <Toaster />
        </BrowserRouter>
    );
}

export default App;
