import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FlaskConical, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { user, token } = await authService.login(formData);
            login(user, token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
                        <FlaskConical className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Tests Industriels
                    </h1>
                    <p className="text-gray-600">
                        Gestion Professionnelle des Tests
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-soft p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Connexion</h2>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="form-label">
                                Adresse email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input pl-10"
                                    placeholder="vous@exemple.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="form-label">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-input pl-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                                    Se souvenir de moi
                                </label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Connexion...
                                </div>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Vous n'avez pas de compte ?{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
                            S'inscrire
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-sm text-gray-500">
                    © 2026 Système de Gestion des Tests Industriels
                </p>
            </div>
        </div>
    );
}
